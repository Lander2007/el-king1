"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const AddressSchema = new mongoose_1.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    governorate: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
});
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin', 'superadmin'], default: 'customer' },
    preferredLanguage: { type: String, enum: ['en', 'ar'], default: 'en' },
    preferredTheme: { type: String, enum: ['light', 'dark'], default: 'light' },
    country: { type: String },
    addresses: [AddressSchema],
    orderHistory: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Order' }],
    isVerified: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });
// Indexes
UserSchema.index({ email: 1 }, { unique: true });
if (process.env.NODE_ENV !== 'test') {
    UserSchema.index({ phone: 1 }, { sparse: true });
}
exports.User = (0, mongoose_1.model)('User', UserSchema);
