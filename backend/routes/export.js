import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import Workout from '../models/Workout.js';
import Nutrition from '../models/Nutrition.js';
import Progress from '../models/Progress.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/report', [
  query('format').isIn(['json', 'csv']),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('type').optional().isIn(['workouts', 'nutrition', 'progress', 'all']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const userId = req.user.id;
    const { format, from, to, type = 'all' } = req.query;

    const report = { generated: new Date().toISOString(), from, to, data: {} };

    const query = { user_id: userId };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    if (type === 'all' || type === 'workouts') {
      report.data.workouts = await Workout.find(query).sort({ date: -1 });
    }

    if (type === 'all' || type === 'nutrition') {
      report.data.nutrition = await Nutrition.find(query).sort({ date: -1 });
    }

    if (type === 'all' || type === 'progress') {
      report.data.progress = await Progress.find(query).sort({ date: -1 });
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="fitness-report.json"');
      return res.send(JSON.stringify(report, null, 2));
    }

    if (format === 'csv') {
      const lines = ['Type,Date,Details'];
      for (const w of report.data.workouts || []) {
        lines.push(`Workout,${w.date.toISOString().split('T')[0]},"${w.name} - ${w.category}"`);
        for (const ex of w.exercises || []) {
          lines.push(`Exercise,${w.date.toISOString().split('T')[0]},"${ex.exercise_name} - ${ex.sets}x${ex.reps} @ ${ex.weight || 0}kg"`);
        }
      }
      for (const n of report.data.nutrition || []) {
        lines.push(`Nutrition,${n.date.toISOString().split('T')[0]},"${n.meal_type}: ${n.food_items} - ${n.calories || 0} cal"`);
      }
      for (const p of report.data.progress || []) {
        lines.push(`Progress,${p.date.toISOString().split('T')[0]},"Weight: ${p.weight || '-'}, Body fat: ${p.body_fat || '-'}"`);
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="fitness-report.csv"');
      return res.send(lines.join('\n'));
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
