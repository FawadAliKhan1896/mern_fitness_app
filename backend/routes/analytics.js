import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import Workout from '../models/Workout.js';
import Nutrition from '../models/Nutrition.js';
import Progress from '../models/Progress.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/workouts', [
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const userId = req.user.id;
    const query = { user_id: userId };

    if (req.query.from || req.query.to) {
      query.date = {};
      if (req.query.from) query.date.$gte = new Date(req.query.from);
      if (req.query.to) query.date.$lte = new Date(req.query.to);
    }

    const workouts = await Workout.find(query).sort({ date: 1 });

    const byCategory = {};
    const byDate = {};
    let totalWorkouts = 0;

    for (const w of workouts) {
      totalWorkouts++;
      byCategory[w.category] = (byCategory[w.category] || 0) + 1;
      const dateStr = w.date.toISOString().split('T')[0];
      byDate[dateStr] = (byDate[dateStr] || 0) + 1;
    }

    const liftData = [];
    for (const w of workouts) {
      for (const ex of w.exercises) {
        if (ex.weight) {
          liftData.push({
            date: w.date.toISOString().split('T')[0],
            exercise: ex.exercise_name,
            weight: ex.weight,
            sets: ex.sets,
            reps: ex.reps
          });
        }
      }
    }

    res.json({
      totalWorkouts,
      byCategory,
      byDate: Object.entries(byDate).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)),
      liftProgress: liftData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/nutrition', [
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const userId = req.user.id;
    const query = { user_id: userId };

    if (req.query.from || req.query.to) {
      query.date = {};
      if (req.query.from) query.date.$gte = new Date(req.query.from);
      if (req.query.to) query.date.$lte = new Date(req.query.to);
    }

    const logs = await Nutrition.find(query).sort({ date: 1 });

    const byDate = {};
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;

    for (const log of logs) {
      const d = log.date.toISOString().split('T')[0];
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
