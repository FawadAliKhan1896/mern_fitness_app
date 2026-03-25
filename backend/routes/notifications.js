import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import Notification from '../models/Notification.js';
import Reminder from '../models/Reminder.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user_id', 'username');
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user.id },
      { read: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reminders', async (req, res) => {
  try {
    const reminders = await Reminder.find({
      user_id: req.user.id,
      enabled: true
    }).sort({ scheduled_time: 1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reminders', [
  body('type').isIn(['workout', 'meal', 'goal', 'general']),
  body('title').trim().notEmpty(),
  body('scheduled_time').isISO8601(),
  body('recurrence').optional().isIn(['daily', 'weekly', 'once']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { type, title, scheduled_time, recurrence } = req.body;

    const reminder = new Reminder({
      user_id: req.user.id,
      type,
      title,
      scheduled_time: new Date(scheduled_time),
      recurrence: recurrence || 'once'
    });

    await reminder.save();
    res.status(201).json(reminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
