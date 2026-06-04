import { Schema, model } from 'mongoose';

export interface IProduct {
  name: { en: string; ar: string };
  slug: string;
  description: { en: string; ar: string };
  category: 'apple' | 'samsung' | 'accessories';
  brand: string;
  model: string;
  images: { url: string; alt: { en: string; ar: string } }[];
  pricing: {
    EG: number; // EGP
    SA: number; // SAR
    AE: number; // AED
    US: number; // USD
    default: number;
  };
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  specs: Map<string, string>;
  seo: {
    metaTitle: { en: string; ar: string };
    metaDescription: { en: string; ar: string };
    ogImage?: string;
    keywords?: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    slug: { type: String, required: true, unique: true },
    description: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    category: { type: String, enum: ['apple', 'samsung', 'accessories'], required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    images: [
      {
        url: { type: String, required: true },
        alt: {
          en: { type: String, required: true },
          ar: { type: String, required: true },
        },
      },
    ],
    pricing: {
      EG: { type: Number, required: true },
      SA: { type: Number, required: true },
      AE: { type: Number, required: true },
      US: { type: Number, required: true },
      default: { type: Number, required: true },
    },
    stock: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    specs: { type: Map, of: String },
    seo: {
      metaTitle: {
        en: { type: String, required: true },
        ar: { type: String, required: true },
      },
      metaDescription: {
        en: { type: String, required: true },
        ar: { type: String, required: true },
      },
      ogImage: { type: String },
      keywords: [{ type: String }],
    },
  },
  { timestamps: true }
);

// Indexes
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ 'name.en': 'text', 'name.ar': 'text', model: 'text' });

export const Product = model<IProduct>('Product', ProductSchema);
