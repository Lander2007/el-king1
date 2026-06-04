"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const mongoose_1 = require("mongoose");
const SettingsSchema = new mongoose_1.Schema({
    siteName: {
        en: { type: String, required: true },
        ar: { type: String, required: true },
    },
    logo: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    address: {
        en: { type: String, required: true },
        ar: { type: String, required: true },
    },
    socialLinks: {
        facebook: { type: String },
        instagram: { type: String },
        twitter: { type: String },
        whatsapp: { type: String },
    },
    paymentMethods: {
        cod: { type: Boolean, default: true },
        instapay: { type: Boolean, default: true },
        vodafoneCash: { type: Boolean, default: true },
        orangeCash: { type: Boolean, default: true },
        etisalatCash: { type: Boolean, default: true },
    },
    shippingRates: { type: Map, of: Number },
    maintenanceMode: { type: Boolean, default: false },
}, { timestamps: { createdAt: false, updatedAt: true } });
exports.Settings = (0, mongoose_1.model)('Settings', SettingsSchema);
