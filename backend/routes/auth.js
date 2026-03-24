import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import db from '../db.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';

const router = Router();

router.post('/register',
  body('username').trim().isLength({ min: 3 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').optional().trim().escape(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { username, email, password, name } = req.body;
      const password_hash = await bcrypt.hash(password, 10);

      const result = db.prepare(`
        INSERT INTO users (username, email, password_hash, name)
        VALUES (?, ?, ?, ?)
      `).run(username, email, password_hash, name || username);

      const user = db.prepare('SELECT id, username, email, name, profile_picture, created_at FROM users WHERE id = ?')
        .get(result.lastInsertRowid);

      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ user, token });
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
      res.status(500).json({ error: err.message });
    }
  }
);

router.post('/login',
  body('username').trim().notEmpty(),
  body('password').notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { username, password } = req.body;

      const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?')
        .get(username, username);

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const { password_hash, ...safeUser } = user;
      const token = jwt.sign({ id: safeUser.id, username: safeUser.username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ user: safeUser, token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get('/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, username, email, name, profile_picture, created_at FROM users WHERE id = ?')
    .get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/me', authenticateToken,
  body('name').optional().trim().escape(),
  body('email').optional().isEmail().normalizeEmail(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  const { name, email, profile_picture } = req.body;
  const updates = [];
  const values = [];
  if (name !== undefined) { updates.push('name = ?'); values.push(name); }
  if (email !== undefined) { updates.push('email = ?'); values.push(email); }
  if (profile_picture !== undefined) { updates.push('profile_picture = ?'); values.push(profile_picture); }
  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' });
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.user.id);

  db.prepare('UPDATE users SET ' + updates.join(', ') + ' WHERE id = ?').run(...values);
      const user = db.prepare('SELECT id, username, email, name, profile_picture, created_at FROM users WHERE id = ?')
        .get(req.user.id);
      res.json(user);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Email already in use' });
      }
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
