import { Router } from 'express';
import { processPayment, webhookHandler } from '../controllers/payment.controller';
import { validate } from '../middlewares/validation.middleware';
import { requireAuth } from '../middlewares/auth.middleware';
import { processPaymentSchema, webhookSchema } from '../schemas/payment.schema';

const router = Router();

router.post('/process', requireAuth, validate(processPaymentSchema), processPayment);
router.post('/webhook', validate(webhookSchema), webhookHandler); // Webhooks often don't have user JWT

export default router;
