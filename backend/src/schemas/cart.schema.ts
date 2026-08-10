import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    productType: z.enum(['flight', 'hotel', 'bus', 'tour']),
    productId: z.string(),
    quantity: z.number().int().positive().default(1)
  })
});
