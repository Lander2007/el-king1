"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const OrderSchema = new mongoose_1.Schema({
    orderNumber: { type: String, required: true, unique: true },
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^\+20[0-9]{10}$/.test(v);
                },
                message: (props) => `${props.value} is not a valid Egyptian phone number! (+20XXXXXXXXXX)`,
            },
        },
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            governorate: { type: String, required: true },
            country: { type: String, required: true },
        },
    },
    items: [
        {
            product: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true, min: 1 },
            priceAtPurchase: { type: Number, required: true },
            currency: { type: String, required: true },
        },
    ],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    currency: { type: String, required: true },
    country: { type: String, required: true },
    paymentMethod: {
        type: String,
        enum: ['cod', 'instapay', 'vodafone_cash', 'orange_cash', 'etisalat_cash'],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
    notes: { type: String },
}, { timestamps: true });
// Indexes
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ 'customer.email': 1 });
OrderSchema.index({ 'customer.phone': 1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
exports.Order = (0, mongoose_1.model)('Order', OrderSchema);
