import { z } from 'zod';

export const serverOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^\+20[0-9]{10}$/, 'Egyptian phone format (+20XXXXXXXXXX) required'),
    address: z.object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      governorate: z.string().min(1, 'Governorate is required'),
      country: z.enum(['EG', 'SA', 'AE', 'US']),
    }),
  }),
  items: z.array(
    z.object({
      product: z.string().min(1, 'Product ID is required'),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      priceAtPurchase: z.number().min(0, 'Price must be positive'),
      currency: z.string(),
    })
  ).min(1, 'Order must contain at least one item'),
  subtotal: z.number().min(0),
  shipping: z.number().min(0),
  total: z.number().min(0),
  currency: z.enum(['EG', 'SA', 'AE', 'US']),
  country: z.enum(['EG', 'SA', 'AE', 'US']),
  paymentMethod: z.enum(['cod', 'instapay', 'vodafone_cash', 'orange_cash', 'etisalat_cash']),
  notes: z.string().optional(),
});
