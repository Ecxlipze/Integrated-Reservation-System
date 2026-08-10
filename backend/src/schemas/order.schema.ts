import { z } from 'zod';

export const checkoutSchema = z.object({
  body: z.object({
    // Additional info could go here, like billing address
  }),
  headers: z.object({
    'idempotency-key': z.string().min(1, 'idempotency-key header is required')
  }).passthrough()
});
