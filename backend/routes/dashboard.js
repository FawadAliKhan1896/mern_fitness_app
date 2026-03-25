import { Router } from 'express';
import Workout from '../models/Workout.js';
import Nutrition from '../models/Nutrition.js';
import Progress from '../models/Progress.js';
import Notification from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const [recentWorkouts, recentNutrition, recentProgress, unreadNotifications] = await Promise.all([
      Workout.find({ user_id: userId }).sort({ date: -1, createdAt: -1 }).limit(5),
      Nutrition.find({ user_id: userId }).sort({ date: -1, createdAt: -1 }).limit(10),
      Progress.find({ user_id: userId }).sort({ date: -1 }).limit(10),
      Notification.find({ user_id: userId, read: false }).sort({ createdAt: -1 }).limit(10)
    ]);

    res.json({
      recentWorkouts,
      recentNutrition,
      recentProgress,
      unreadNotifications,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
