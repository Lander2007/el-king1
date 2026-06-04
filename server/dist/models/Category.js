"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const CategorySchema = new mongoose_1.Schema({
    name: {
        en: { type: String, required: true },
        ar: { type: String, required: true },
    },
    slug: { type: String, required: true, unique: true },
    parentCategory: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', default: null },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
});
exports.Category = (0, mongoose_1.model)('Category', CategorySchema);
