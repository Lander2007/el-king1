"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Settings_1 = require("../models/Settings");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/settings (Public settings)
router.get('/settings', async (req, res) => {
    try {
        let settings = await Settings_1.Settings.findOne();
        if (!settings) {
            return res.status(404).json({ message: 'Settings not found' });
        }
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// PUT /api/admin/settings (Update settings - Admin only)
router.put('/admin/settings', auth_1.adminMiddleware, async (req, res) => {
    try {
        let settings = await Settings_1.Settings.findOne();
        if (!settings) {
            settings = new Settings_1.Settings(req.body);
        }
        else {
            Object.assign(settings, req.body);
        }
        await settings.save();
        // Socket.io sync
        const wsNamespace = req.app.get('wsNamespace');
        if (wsNamespace) {
            wsNamespace.emit('settings:updated', settings);
        }
        res.json(settings);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.default = router;
