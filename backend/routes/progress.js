import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', [
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('metric_type').optional().trim(),
  query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let sql = 'SELECT * FROM progress WHERE user_id = ?';
  const params = [req.user.id];

  if (req.query.from) {
    sql += ' AND date >= ?';
    params.push(req.query.from);
  }
  if (req.query.to) {
    sql += ' AND date <= ?';
    params.push(req.query.to);
  }
  if (req.query.metric_type) {
    sql += ' AND metric_type = ?';
    params.push(req.query.metric_type);
  }

  sql += ' ORDER BY date DESC, created_at DESC';
  const limit = req.query.limit || 50;
  const offset = req.query.offset || 0;
  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const entries = db.prepare(sql).all(...params);
  res.json(entries);
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
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { date, weight, body_fat, chest, waist, hips, biceps, thighs, run_time_minutes, lifting_weight, metric_type, notes } = req.body;

  const result = db.prepare(`
    INSERT INTO progress (user_id, weight, body_fat, chest, waist, hips, biceps, thighs, run_time_minutes, lifting_weight, metric_type, date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.id,
    weight ?? null, body_fat ?? null, chest ?? null, waist ?? null, hips ?? null,
    biceps ?? null, thighs ?? null, run_time_minutes ?? null, lifting_weight ?? null,
    metric_type || 'general', date.split('T')[0], notes || ''
  );

  const entry = db.prepare('SELECT * FROM progress WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(entry);
});

router.get('/:id', (req, res) => {
  const entry = db.prepare('SELECT * FROM progress WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!entry) return res.status(404).json({ error: 'Entry not found' });
  res.json(entry);
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
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const entry = db.prepare('SELECT * FROM progress WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!entry) return res.status(404).json({ error: 'Entry not found' });

  const updates = [];
  const values = [];
  const allowed = ['weight', 'body_fat', 'chest', 'waist', 'hips', 'biceps', 'thighs', 'run_time_minutes', 'lifting_weight', 'metric_type', 'notes', 'date'];
  for (const k of allowed) {
    if (req.body[k] !== undefined) {
      updates.push(`${k} = ?`);
      values.push(k === 'date' && req.body[k] ? req.body[k].split('T')[0] : req.body[k]);
    }
  }
  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  values.push(req.params.id);
  db.prepare(`UPDATE progress SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  const updated = db.prepare('SELECT * FROM progress WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM progress WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Entry not found' });
  res.status(204).send();
});

export default router;
