import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks'];

router.get('/', [
  query('search').optional().trim(),
  query('meal_type').optional().isIn(MEAL_TYPES),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let sql = 'SELECT * FROM nutrition_logs WHERE user_id = ?';
  const params = [req.user.id];

  if (req.query.search) {
    sql += ' AND food_items LIKE ?';
    params.push(`%${req.query.search}%`);
  }
  if (req.query.meal_type) {
    sql += ' AND meal_type = ?';
    params.push(req.query.meal_type);
  }
  if (req.query.from) {
    sql += ' AND date >= ?';
    params.push(req.query.from);
  }
  if (req.query.to) {
    sql += ' AND date <= ?';
    params.push(req.query.to);
  }

  sql += ' ORDER BY date DESC, created_at DESC';
  const limit = req.query.limit || 20;
  const offset = req.query.offset || 0;
  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const logs = db.prepare(sql).all(...params);
  res.json(logs);
});

router.post('/', [
  body('meal_type').isIn(MEAL_TYPES),
  body('food_items').trim().notEmpty(),
  body('date').isISO8601(),
  body('quantity').optional(),
  body('calories').optional().isFloat().toFloat(),
  body('protein').optional().isFloat().toFloat(),
  body('carbs').optional().isFloat().toFloat(),
  body('fat').optional().isFloat().toFloat(),
  body('notes').optional(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { meal_type, food_items, date, quantity, calories, protein, carbs, fat, notes } = req.body;

  const result = db.prepare(`
    INSERT INTO nutrition_logs (user_id, meal_type, food_items, quantity, calories, protein, carbs, fat, date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, meal_type, food_items, quantity || '', calories ?? null, protein ?? null, carbs ?? null, fat ?? null, date.split('T')[0], notes || '');

  const log = db.prepare('SELECT * FROM nutrition_logs WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(log);
});

router.get('/:id', (req, res) => {
  const log = db.prepare('SELECT * FROM nutrition_logs WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!log) return res.status(404).json({ error: 'Entry not found' });
  res.json(log);
});

router.put('/:id', [
  body('meal_type').optional().isIn(MEAL_TYPES),
  body('food_items').optional().trim().notEmpty(),
  body('date').optional().isISO8601(),
  body('quantity').optional(),
  body('calories').optional().isFloat().toFloat(),
  body('protein').optional().isFloat().toFloat(),
  body('carbs').optional().isFloat().toFloat(),
  body('fat').optional().isFloat().toFloat(),
  body('notes').optional(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const log = db.prepare('SELECT * FROM nutrition_logs WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!log) return res.status(404).json({ error: 'Entry not found' });

  const updates = [];
  const allowed = ['meal_type', 'food_items', 'date', 'quantity', 'calories', 'protein', 'carbs', 'fat', 'notes'];
  const values = [];
  for (const k of allowed) {
    if (req.body[k] !== undefined) {
      updates.push(`${k} = ?`);
      values.push(k === 'date' && req.body[k] ? req.body[k].split('T')[0] : req.body[k]);
    }
  }
  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  values.push(req.params.id);
  db.prepare(`UPDATE nutrition_logs SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  const updated = db.prepare('SELECT * FROM nutrition_logs WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM nutrition_logs WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Entry not found' });
  res.status(204).send();
});

export default router;
