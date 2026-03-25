import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import Progress from '../models/Progress.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', [
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('metric_type').optional().trim(),
  query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const query = { user_id: req.user.id };

    if (req.query.from || req.query.to) {
      query.date = {};
      if (req.query.from) query.date.$gte = new Date(req.query.from);
      if (req.query.to) query.date.$lte = new Date(req.query.to);
    }
    if (req.query.metric_type) {
      query.metric_type = req.query.metric_type;
    }

    const limit = req.query.limit || 50;
    const offset = req.query.offset || 0;

    const entries = await Progress.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .populate('user_id', 'username');

    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', [
  body('date').isISO8601(),
  body('weight').optional().isFloat().toFloat(),
  body('body_fat').optional().isFloat().toFloat(),
  body('chest').optional().isFloat().toFloat(),
  body('waist').optional().isFloat().toFloat(),
  body('hips').optional().isFloat().toFloat(),
  body('biceps').optional().isFloat().toFloat(),
  body('thighs').optional().isFloat().toFloat(),
  body('run_time_minutes').optional().isFloat().toFloat(),
  body('lifting_weight').optional().isFloat().toFloat(),
  body('metric_type').optional().trim(),
  body('notes').optional(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { date, weight, body_fat, chest, waist, hips, biceps, thighs, run_time_minutes, lifting_weight, metric_type, notes } = req.body;

    const progress = new Progress({
      user_id: req.user.id,
      weight,
      body_fat,
      chest,
      waist,
      hips,
      biceps,
      thighs,
      run_time_minutes,
      lifting_weight,
      metric_type: metric_type || 'general',
      date: new Date(date),
      notes
    });

    await progress.save();
    await progress.populate('user_id', 'username');

    res.status(201).json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const entry = await Progress.findOne({ _id: req.params.id, user_id: req.user.id })
      .populate('user_id', 'username');
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', [
  body('date').optional().isISO8601(),
  body('weight').optional().isFloat().toFloat(),
  body('body_fat').optional().isFloat().toFloat(),
  body('chest').optional().isFloat().toFloat(),
  body('waist').optional().isFloat().toFloat(),
  body('hips').optional().isFloat().toFloat(),
  body('biceps').optional().isFloat().toFloat(),
  body('thighs').optional().isFloat().toFloat(),
  body('run_time_minutes').optional().isFloat().toFloat(),
  body('lifting_weight').optional().isFloat().toFloat(),
  body('metric_type').optional().trim(),
  body('notes').optional(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const updates = {};
    const allowed = ['weight', 'body_fat', 'chest', 'waist', 'hips', 'biceps', 'thighs', 'run_time_minutes', 'lifting_weight', 'metric_type', 'notes', 'date'];
    for (const k of allowed) {
      if (req.body[k] !== undefined) {
        updates[k] = k === 'date' ? new Date(req.body[k]) : req.body[k];
      }
    }
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    const progress = await Progress.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      updates,
      { new: true }
    ).populate('user_id', 'username');

    if (!progress) return res.status(404).json({ error: 'Entry not found' });

    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await Progress.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!result) return res.status(404).json({ error: 'Entry not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
