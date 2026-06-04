import { Router, Response } from 'express';
import { Settings } from '../models/Settings';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// GET /api/settings (Public settings)
router.get('/settings', async (req: any, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/settings (Update settings - Admin only)
router.put('/admin/settings', verifyToken, async (req: any, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();

    // Socket.io sync
    const wsNamespace = req.app.get('wsNamespace');
    if (wsNamespace) {
      wsNamespace.emit('settings:updated', settings);
    }

    res.json(settings);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
