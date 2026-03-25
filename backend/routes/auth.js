import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
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

      const user = new User({
        username,
        email,
        password_hash,
        name: name || username
      });

      await user.save();

      const userResponse = {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        profile_picture: user.profile_picture,
        created_at: user.createdAt
      };

      const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ user: userResponse, token });
    } catch (err) {
      if (err.code === 11000) {
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

      const user = await User.findOne({
        $or: [{ username: username }, { email: username }]
      });

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const { password_hash, ...safeUser } = user.toObject();
      safeUser.id = safeUser._id;
      delete safeUser._id;
      delete safeUser.__v;

      const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ user: safeUser, token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username email name profile_picture createdAt');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      profile_picture: user.profile_picture,
      created_at: user.createdAt
    };

    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (email !== undefined) updates.email = email;
      if (profile_picture !== undefined) updates.profile_picture = profile_picture;
      if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true })
    .select('username email name profile_picture createdAt');

  const userResponse = {
    id: user._id,
    username: user.username,
    email: user.email,
    name: user.name,
    profile_picture: user.profile_picture,
    created_at: user.createdAt
  };

  res.json(userResponse);
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
