import { Schema, model, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  name: { en: string; ar: string };
  slug: string;
  parentCategory: Types.ObjectId | null;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}

const CategorySchema = new Schema<ICategory>({
  name: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },
  slug: { type: String, required: true, unique: true },
  parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
});

export const Category = model<ICategory>('Category', CategorySchema);
