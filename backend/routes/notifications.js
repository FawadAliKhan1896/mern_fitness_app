import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
  const notifications = db.prepare(`
    SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
  `).all(req.user.id);
  res.json(notifications);
});

router.patch('/:id/read', (req, res) => {
  const result = db.prepare(`
    UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?
  `).run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Notification not found' });
  res.json({ ok: true });
});

router.patch('/read-all', (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ ok: true });
});

router.get('/reminders', (req, res) => {
  const reminders = db.prepare(`
    SELECT * FROM reminders WHERE user_id = ? AND enabled = 1 ORDER BY scheduled_time ASC
  `).all(req.user.id);
  res.json(reminders);
});

router.post('/reminders', [
  body('type').isIn(['workout', 'meal', 'goal', 'general']),
  body('title').trim().notEmpty(),
  body('scheduled_time').isISO8601(),
  body('recurrence').optional().isIn(['daily', 'weekly', 'once']),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { type, title, scheduled_time, recurrence } = req.body;
  const result = db.prepare(`
    INSERT INTO reminders (user_id, type, title, scheduled_time, recurrence)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.user.id, type, title, scheduled_time, recurrence || 'once');

  const reminder = db.prepare('SELECT * FROM reminders WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(reminder);
});

export default router;
