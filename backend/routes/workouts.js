import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import Workout from '../models/Workout.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', [
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const query = { user_id: req.user.id };

    if (req.query.search) {
      query.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { notes: new RegExp(req.query.search, 'i') }
      ];
    }
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.from || req.query.to) {
      query.date = {};
      if (req.query.from) query.date.$gte = new Date(req.query.from);
      if (req.query.to) query.date.$lte = new Date(req.query.to);
    }

    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;

    const workouts = await Workout.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .populate('user_id', 'username');

    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', [
  body('name').trim().notEmpty(),
  body('category').trim().notEmpty(),
  body('date').isISO8601(),
  body('tags').optional(),
  body('notes').optional(),
  body('exercises').optional().isArray(),
  body('exercises.*.exercise_name').trim().notEmpty(),
  body('exercises.*.sets').optional().isInt({ min: 1 }).toInt(),
  body('exercises.*.reps').optional(),
  body('exercises.*.weight').optional().isFloat().toFloat(),
  body('exercises.*.notes').optional(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, category, date, tags, notes, exercises = [] } = req.body;

    const workout = new Workout({
      user_id: req.user.id,
      name,
      category,
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      date: new Date(date),
      notes,
      exercises
    });

    await workout.save();
    await workout.populate('user_id', 'username');

    res.status(201).json(workout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user_id: req.user.id })
      .populate('user_id', 'username');
    if (!workout) return res.status(404).json({ error: 'Workout not found' });
    res.json(workout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', [
  body('name').optional().trim().notEmpty(),
  body('category').optional().trim().notEmpty(),
  body('date').optional().isISO8601(),
  body('tags').optional(),
  body('notes').optional(),
  body('exercises').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const workout = await Workout.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!workout) return res.status(404).json({ error: 'Workout not found' });

    const { name, category, date, tags, notes, exercises } = req.body;
    if (name !== undefined) workout.name = name;
    if (category !== undefined) workout.category = category;
    if (date !== undefined) workout.date = new Date(date);
    if (tags !== undefined) workout.tags = Array.isArray(tags) ? tags : (tags ? [tags] : []);
    if (notes !== undefined) workout.notes = notes;
    if (exercises !== undefined) workout.exercises = exercises;

    await workout.save();
    await workout.populate('user_id', 'username');

    res.json(workout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await Workout.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!result) return res.status(404).json({ error: 'Workout not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
