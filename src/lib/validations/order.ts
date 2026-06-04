import { z } from 'zod';

export const orderFormSchema = z.object({
  fullName: z.string().min(1, { message: 'required' }),
  email: z.string().email({ message: 'emailFormat' }),
  phone: z.string().regex(/^\+20[0-9]{10}$/, { message: 'phoneFormat' }),
  country: z.enum(['EG', 'SA', 'AE', 'US'], { errorMap: () => ({ message: 'required' }) }),
  city: z.string().min(1, { message: 'required' }),
  governorate: z.string().min(1, { message: 'required' }),
  address: z.string().min(1, { message: 'required' }),
  notes: z.string().optional(),
});

export type OrderFormData = z.infer<typeof orderFormSchema>;
