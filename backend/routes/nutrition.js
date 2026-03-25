import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import Nutrition from '../models/Nutrition.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks'];

router.get('/', [
  query('search').optional().trim(),
  query('meal_type').optional().isIn(['breakfast', 'lunch', 'dinner', 'snack']),
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
      query.food_items = new RegExp(req.query.search, 'i');
    }
    if (req.query.meal_type) {
      query.meal_type = req.query.meal_type;
    }
    if (req.query.from || req.query.to) {
      query.date = {};
      if (req.query.from) query.date.$gte = new Date(req.query.from);
      if (req.query.to) query.date.$lte = new Date(req.query.to);
    }

    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;

    const logs = await Nutrition.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .populate('user_id', 'username');

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', [
  body('meal_type').isIn(['breakfast', 'lunch', 'dinner', 'snack']),
  body('food_items').trim().notEmpty(),
  body('date').isISO8601(),
  body('quantity').optional(),
  body('calories').optional().isFloat().toFloat(),
  body('protein').optional().isFloat().toFloat(),
  body('carbs').optional().isFloat().toFloat(),
  body('fat').optional().isFloat().toFloat(),
  body('notes').optional(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { meal_type, food_items, date, quantity, calories, protein, carbs, fat, notes } = req.body;

    const nutrition = new Nutrition({
      user_id: req.user.id,
      meal_type,
      food_items,
      quantity,
      calories,
      protein,
      carbs,
      fat,
      date: new Date(date),
      notes
    });

    await nutrition.save();
    await nutrition.populate('user_id', 'username');

    res.status(201).json(nutrition);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const log = await Nutrition.findOne({ _id: req.params.id, user_id: req.user.id })
      .populate('user_id', 'username');
    if (!log) return res.status(404).json({ error: 'Entry not found' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', [
  body('meal_type').optional().isIn(['breakfast', 'lunch', 'dinner', 'snack']),
  body('food_items').optional().trim().notEmpty(),
  body('date').optional().isISO8601(),
  body('quantity').optional(),
  body('calories').optional().isFloat().toFloat(),
  body('protein').optional().isFloat().toFloat(),
  body('carbs').optional().isFloat().toFloat(),
  body('fat').optional().isFloat().toFloat(),
  body('notes').optional(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const updates = {};
    const allowed = ['meal_type', 'food_items', 'date', 'quantity', 'calories', 'protein', 'carbs', 'fat', 'notes'];
    for (const k of allowed) {
      if (req.body[k] !== undefined) {
        updates[k] = k === 'date' ? new Date(req.body[k]) : req.body[k];
      }
    }
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    const nutrition = await Nutrition.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      updates,
      { new: true }
    ).populate('user_id', 'username');

    if (!nutrition) return res.status(404).json({ error: 'Entry not found' });

    res.json(nutrition);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await Nutrition.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!result) return res.status(404).json({ error: 'Entry not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
