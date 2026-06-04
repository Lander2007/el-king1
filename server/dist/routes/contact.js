"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Message_1 = require("../models/Message");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/contact (Submit contact form)
router.post('/contact', async (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    try {
        const newMessage = await Message_1.Message.create({
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
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// GET /api/admin/messages (View messages - Admin only)
router.get('/admin/messages', auth_1.adminMiddleware, async (req, res) => {
    try {
        const messages = await Message_1.Message.find().sort({ createdAt: -1 });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
