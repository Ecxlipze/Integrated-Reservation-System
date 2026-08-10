import { z } from 'zod';

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Coupon code is required')
  })
});
