import { Router } from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
  const userId = req.user.id;

  const recentWorkouts = db.prepare(`
    SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC, created_at DESC LIMIT 5
  `).all(userId);

  recentWorkouts.forEach(w => {
    w.exercises = db.prepare('SELECT * FROM exercises WHERE workout_id = ?').all(w.id);
  });

  const recentNutrition = db.prepare(`
    SELECT * FROM nutrition_logs WHERE user_id = ? ORDER BY date DESC, created_at DESC LIMIT 10
  `).all(userId);

  const recentProgress = db.prepare(`
    SELECT * FROM progress WHERE user_id = ? ORDER BY date DESC LIMIT 10
  `).all(userId);

  const unreadNotifications = db.prepare(`
    SELECT * FROM notifications WHERE user_id = ? AND read = 0 ORDER BY created_at DESC LIMIT 10
  `).all(userId);

  res.json({
    recentWorkouts,
    recentNutrition,
    recentProgress,
    unreadNotifications,
  });
});

export default router;
