import { Schema, model, Document } from 'mongoose';

export interface ISettings extends Document {
  siteName: { en: string; ar: string };
  logo: string;
  contactEmail: string;
  contactPhone: string;
  address: { en: string; ar: string };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  paymentMethods: {
    cod: boolean;
    instapay: boolean;
    vodafoneCash: boolean;
    orangeCash: boolean;
    etisalatCash: boolean;
  };
  shippingRates: Map<string, number>;
  maintenanceMode: boolean;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
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
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const Settings = model<ISettings>('Settings', SettingsSchema);
