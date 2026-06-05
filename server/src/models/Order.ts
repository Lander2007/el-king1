import { Schema, model, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      governorate: string;
      country: string;
    };
  };
  items: {
    product: Types.ObjectId;
    quantity: number;
    priceAtPurchase: number;
    currency: string;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  country: string;
  paymentMethod: 'cod' | 'instapay' | 'vodafone_cash' | 'orange_cash' | 'etisalat_cash';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: {
        type: String,
        required: true,
        validate: {
          validator: function (v: string) {
            return /^\+20[0-9]{10}$/.test(v);
          },
          message: (props: any) => `${props.value} is not a valid Egyptian phone number! (+20XXXXXXXXXX)`,
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
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
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
  },
  { timestamps: true }
);

// Indexes

OrderSchema.index({ 'customer.email': 1 });
OrderSchema.index({ 'customer.phone': 1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });

export const Order = model<IOrder>('Order', OrderSchema);
