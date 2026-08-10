import { z } from 'zod';

export const processPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Order ID format'),
    paymentMethod: z.string().min(1),
    simulateSuccess: z.boolean().optional()
  })
});

export const webhookSchema = z.object({
  body: z.object({
    transactionId: z.string().min(1),
    status: z.enum(['success', 'failed']),
    gatewayResponse: z.any().optional()
  })
});
