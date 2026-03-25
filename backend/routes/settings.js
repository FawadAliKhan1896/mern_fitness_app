import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', [
  body('units').optional().isIn(['metric', 'imperial']),
  body('theme').optional().isIn(['light', 'dark', 'system']),
  body('notifications_enabled').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { units, theme, notifications_enabled } = req.body;
    const updates = {};
    if (units !== undefined) updates['settings.units'] = units;
    if (theme !== undefined) updates['settings.theme'] = theme;
    if (notifications_enabled !== undefined) updates['settings.notifications_enabled'] = notifications_enabled;
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No valid fields' });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('settings');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user.settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
