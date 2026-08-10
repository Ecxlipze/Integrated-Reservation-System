import { z } from 'zod';

export const checkoutSchema = z.object({
  body: z.object({
    couponCode: z.string().optional()
  }),
  headers: z.object({
    'idempotency-key': z.string().min(1, 'idempotency-key header is required')
  }).passthrough()
});
