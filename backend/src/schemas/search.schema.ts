import { z } from 'zod';

export const searchSchema = z.object({
  query: z.object({
    category: z.enum(['flight', 'hotel', 'bus', 'tour']),
    minPrice: z.string().optional().transform(val => val ? Number(val) : undefined),
    maxPrice: z.string().optional().transform(val => val ? Number(val) : undefined),
    rating: z.string().optional().transform(val => val ? Number(val) : undefined),
    date: z.string().optional(), // YYYY-MM-DD
    sortBy: z.enum(['lowest_price', 'highest_rating', 'recommended']).optional(),
    page: z.string().optional().transform(val => val ? Number(val) : 1),
    limit: z.string().optional().transform(val => val ? Number(val) : 10),
  })
});
