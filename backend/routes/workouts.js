import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import db from '../db.js';
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
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  let sql = 'SELECT * FROM workouts WHERE user_id = ?';
  const params = [req.user.id];

  if (req.query.search) {
    sql += ' AND (name LIKE ? OR notes LIKE ?)';
    const s = `%${req.query.search}%`;
    params.push(s, s);
  }
  if (req.query.category) {
    sql += ' AND category = ?';
    params.push(req.query.category);
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

  const workouts = db.prepare(sql).all(...params);

  workouts.forEach(w => {
    w.exercises = db.prepare('SELECT * FROM exercises WHERE workout_id = ?').all(w.id);
  });

  res.json(workouts);
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
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, category, date, tags, notes, exercises = [] } = req.body;

  const result = db.prepare(`
    INSERT INTO workouts (user_id, name, category, tags, date, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.user.id, name, category, typeof tags === 'string' ? tags : (tags || ''), date.split('T')[0], notes || '');

  const workoutId = result.lastInsertRowid;

  const insertEx = db.prepare(`
    INSERT INTO exercises (workout_id, exercise_name, sets, reps, weight, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const ex of exercises) {
    insertEx.run(workoutId, ex.exercise_name, ex.sets ?? 3, ex.reps ?? null, ex.weight ?? null, ex.notes ?? '');
  }

  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(workoutId);
  workout.exercises = db.prepare('SELECT * FROM exercises WHERE workout_id = ?').all(workoutId);
  res.status(201).json(workout);
});

router.get('/:id', (req, res) => {
  const workout = db.prepare('SELECT * FROM workouts WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!workout) return res.status(404).json({ error: 'Workout not found' });
  workout.exercises = db.prepare('SELECT * FROM exercises WHERE workout_id = ?').all(workout.id);
  res.json(workout);
});

router.put('/:id', [
  body('name').optional().trim().notEmpty(),
  body('category').optional().trim().notEmpty(),
  body('date').optional().isISO8601(),
  body('tags').optional(),
  body('notes').optional(),
  body('exercises').optional().isArray(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const workout = db.prepare('SELECT * FROM workouts WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!workout) return res.status(404).json({ error: 'Workout not found' });

  const { name, category, date, tags, notes, exercises } = req.body;
  if (name !== undefined) workout.name = name;
  if (category !== undefined) workout.category = category;
  if (date !== undefined) workout.date = date.split('T')[0];
  if (tags !== undefined) workout.tags = typeof tags === 'string' ? tags : JSON.stringify(tags || []);
  if (notes !== undefined) workout.notes = notes;

  db.prepare(`
    UPDATE workouts SET name = ?, category = ?, tags = ?, date = ?, notes = ? WHERE id = ?
  `).run(workout.name, workout.category, workout.tags, workout.date, workout.notes || '', workout.id);

  if (exercises !== undefined) {
    db.prepare('DELETE FROM exercises WHERE workout_id = ?').run(workout.id);
    const insertEx = db.prepare(`
      INSERT INTO exercises (workout_id, exercise_name, sets, reps, weight, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const ex of exercises) {
      insertEx.run(workout.id, ex.exercise_name, ex.sets ?? 3, ex.reps ?? null, ex.weight ?? null, ex.notes ?? '');
    }
  }

  const updated = db.prepare('SELECT * FROM workouts WHERE id = ?').get(workout.id);
  updated.exercises = db.prepare('SELECT * FROM exercises WHERE workout_id = ?').all(workout.id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM workouts WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Workout not found' });
  res.status(204).send();
});

export default router;
