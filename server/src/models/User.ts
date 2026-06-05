import { Schema, model, Document, Types } from 'mongoose';

const AddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  governorate: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'customer' | 'admin' | 'superadmin';
  preferredLanguage: 'en' | 'ar';
  preferredTheme: 'light' | 'dark';
  country?: string;
  addresses: typeof AddressSchema[];
  orderHistory: Types.ObjectId[];
  isVerified: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin', 'superadmin'], default: 'customer' },
    preferredLanguage: { type: String, enum: ['en', 'ar'], default: 'en' },
    preferredTheme: { type: String, enum: ['light', 'dark'], default: 'light' },
    country: { type: String },
    addresses: [AddressSchema],
    orderHistory: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Indexes

if (process.env.NODE_ENV !== 'test') {
  UserSchema.index({ phone: 1 }, { sparse: true });
}

export const User = model<IUser>('User', UserSchema);
