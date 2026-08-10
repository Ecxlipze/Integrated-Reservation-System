import { Router } from 'express';
import { checkout } from '../controllers/order.controller';
import { validate } from '../middlewares/validation.middleware';
import { requireAuth } from '../middlewares/auth.middleware';
import { checkoutSchema } from '../schemas/order.schema';

const router = Router();

router.use(requireAuth); // Protect all order routes

router.post('/checkout', validate(checkoutSchema), checkout);

export default router;
