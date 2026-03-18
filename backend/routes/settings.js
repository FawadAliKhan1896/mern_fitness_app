import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
  let settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.user.id);
  if (!settings) {
    db.prepare('INSERT INTO user_settings (user_id) VALUES (?)').run(req.user.id);
    settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.user.id);
  }
  res.json(settings);
});

router.put('/', [
  body('units').optional().isIn(['metric', 'imperial']),
  body('theme').optional().isIn(['light', 'dark', 'system']),
  body('notifications_enabled').optional().isBoolean(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { units, theme, notifications_enabled } = req.body;
  const updates = [];
  const values = [];
  if (units !== undefined) { updates.push('units = ?'); values.push(units); }
  if (theme !== undefined) { updates.push('theme = ?'); values.push(theme); }
  if (notifications_enabled !== undefined) { updates.push('notifications_enabled = ?'); values.push(notifications_enabled ? 1 : 0); }
  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields' });

  const existing = db.prepare('SELECT user_id FROM user_settings WHERE user_id = ?').get(req.user.id);
  if (existing) {
    db.prepare('UPDATE user_settings SET ' + updates.join(', ') + ' WHERE user_id = ?').run(...values, req.user.id);
  } else {
    db.prepare('INSERT INTO user_settings (user_id, ' + updates.map(u => u.split(' = ')[0]).join(', ') + ') VALUES (?, ' + values.map(() => '?').join(', ') + ')').run(req.user.id, ...values);
  }

  const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.user.id);
  res.json(settings);
});

export default router;
