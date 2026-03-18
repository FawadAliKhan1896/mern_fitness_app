import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/report', [
  query('format').isIn(['json', 'csv']),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('type').optional().isIn(['workouts', 'nutrition', 'progress', 'all']),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const userId = req.user.id;
  const { format, from, to, type = 'all' } = req.query;

  const report = { generated: new Date().toISOString(), from, to, data: {} };

  if (type === 'all' || type === 'workouts') {
    let sql = 'SELECT * FROM workouts WHERE user_id = ?';
    const params = [userId];
    if (from) { sql += ' AND date >= ?'; params.push(from); }
    if (to) { sql += ' AND date <= ?'; params.push(to); }
    sql += ' ORDER BY date DESC';
    const workouts = db.prepare(sql).all(...params);
    workouts.forEach(w => {
      w.exercises = db.prepare('SELECT * FROM exercises WHERE workout_id = ?').all(w.id);
    });
    report.data.workouts = workouts;
  }

  if (type === 'all' || type === 'nutrition') {
    let sql = 'SELECT * FROM nutrition_logs WHERE user_id = ?';
    const params = [userId];
    if (from) { sql += ' AND date >= ?'; params.push(from); }
    if (to) { sql += ' AND date <= ?'; params.push(to); }
    sql += ' ORDER BY date DESC';
    report.data.nutrition = db.prepare(sql).all(...params);
  }

  if (type === 'all' || type === 'progress') {
    let sql = 'SELECT * FROM progress WHERE user_id = ?';
    const params = [userId];
    if (from) { sql += ' AND date >= ?'; params.push(from); }
    if (to) { sql += ' AND date <= ?'; params.push(to); }
    sql += ' ORDER BY date DESC';
    report.data.progress = db.prepare(sql).all(...params);
  }

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="fitness-report.json"');
    return res.send(JSON.stringify(report, null, 2));
  }

  if (format === 'csv') {
    const lines = ['Type,Date,Details'];
    for (const w of report.data.workouts || []) {
      lines.push(`Workout,${w.date},"${w.name} - ${w.category}"`);
      for (const ex of w.exercises || []) {
        lines.push(`Exercise,${w.date},"${ex.exercise_name} - ${ex.sets}x${ex.reps} @ ${ex.weight || 0}kg"`);
      }
    }
    for (const n of report.data.nutrition || []) {
      lines.push(`Nutrition,${n.date},"${n.meal_type}: ${n.food_items} - ${n.calories || 0} cal"`);
    }
    for (const p of report.data.progress || []) {
      lines.push(`Progress,${p.date},"Weight: ${p.weight || '-'}, Body fat: ${p.body_fat || '-'}"`);
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fitness-report.csv"');
    return res.send(lines.join('\n'));
  }

  res.json(report);
});

export default router;
