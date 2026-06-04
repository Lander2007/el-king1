import { Router, Response } from 'express';
import { Message } from '../models/Message';
import { adminMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/contact (Submit contact form)
router.post('/contact', async (req: any, res: Response) => {
  const { name, email, phone, subject, message } = req.body;

  try {
    const newMessage = await Message.create({
      name,
      email,
      phone,
      subject,
      message,
      isRead: false,
    });

    // Notify admins in real-time
    const wsNamespace = req.app.get('wsNamespace');
    if (wsNamespace) {
      wsNamespace.emit('message:created', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/admin/messages (View messages - Admin only)
router.get('/admin/messages', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
