"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverOrderSchema = void 0;
const zod_1 = require("zod");
exports.serverOrderSchema = zod_1.z.object({
    customer: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required'),
        email: zod_1.z.string().email('Invalid email address'),
        phone: zod_1.z.string().regex(/^\+20[0-9]{10}$/, 'Egyptian phone format (+20XXXXXXXXXX) required'),
        address: zod_1.z.object({
            street: zod_1.z.string().min(1, 'Street address is required'),
            city: zod_1.z.string().min(1, 'City is required'),
            governorate: zod_1.z.string().min(1, 'Governorate is required'),
            country: zod_1.z.enum(['EG', 'SA', 'AE', 'US']),
        }),
    }),
    items: zod_1.z.array(zod_1.z.object({
        product: zod_1.z.string().min(1, 'Product ID is required'),
        quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1'),
        priceAtPurchase: zod_1.z.number().min(0, 'Price must be positive'),
        currency: zod_1.z.string(),
    })).min(1, 'Order must contain at least one item'),
    subtotal: zod_1.z.number().min(0),
    shipping: zod_1.z.number().min(0),
    total: zod_1.z.number().min(0),
    currency: zod_1.z.enum(['EG', 'SA', 'AE', 'US']),
    country: zod_1.z.enum(['EG', 'SA', 'AE', 'US']),
    paymentMethod: zod_1.z.enum(['cod', 'instapay', 'vodafone_cash', 'orange_cash', 'etisalat_cash']),
    notes: zod_1.z.string().optional(),
});
