import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/workouts', [
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const userId = req.user.id;
  let sql = 'SELECT * FROM workouts WHERE user_id = ?';
  const params = [userId];

  if (req.query.from) { sql += ' AND date >= ?'; params.push(req.query.from); }
  if (req.query.to) { sql += ' AND date <= ?'; params.push(req.query.to); }
  sql += ' ORDER BY date ASC';

  const workouts = db.prepare(sql).all(...params);

  const byCategory = {};
  const byDate = {};
  let totalWorkouts = 0;

  for (const w of workouts) {
    totalWorkouts++;
    byCategory[w.category] = (byCategory[w.category] || 0) + 1;
    byDate[w.date] = (byDate[w.date] || 0) + 1;
  }

  const liftData = [];
  for (const w of workouts) {
    const exercises = db.prepare('SELECT * FROM exercises WHERE workout_id = ?').all(w.id);
    for (const ex of exercises) {
      if (ex.weight) {
        liftData.push({ date: w.date, exercise: ex.exercise_name, weight: ex.weight, sets: ex.sets, reps: ex.reps });
      }
    }
  }

  res.json({
    totalWorkouts,
    byCategory,
    byDate: Object.entries(byDate).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)),
    liftProgress: liftData,
  });
});

router.get('/nutrition', [
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const userId = req.user.id;
  let sql = 'SELECT * FROM nutrition_logs WHERE user_id = ?';
  const params = [userId];

  if (req.query.from) { sql += ' AND date >= ?'; params.push(req.query.from); }
  if (req.query.to) { sql += ' AND date <= ?'; params.push(req.query.to); }
  sql += ' ORDER BY date ASC';

  const logs = db.prepare(sql).all(...params);

  const byDate = {};
  let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;

  for (const log of logs) {
    const d = log.date;
    if (!byDate[d]) byDate[d] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    byDate[d].calories += log.calories || 0;
    byDate[d].protein += log.protein || 0;
    byDate[d].carbs += log.carbs || 0;
    byDate[d].fat += log.fat || 0;
    totalCalories += log.calories || 0;
    totalProtein += log.protein || 0;
    totalCarbs += log.carbs || 0;
    totalFat += log.fat || 0;
  }

  const dailyTrends = Object.entries(byDate).map(([date, v]) => ({
    date,
    calories: v.calories,
    protein: v.protein,
    carbs: v.carbs,
    fat: v.fat,
  })).sort((a, b) => a.date.localeCompare(b.date));

  res.json({
    totals: { calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fat: totalFat },
    dailyTrends,
  });
});

export default router;
