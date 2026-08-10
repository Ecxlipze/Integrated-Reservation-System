import { Router } from 'express';
import { validateCouponController } from '../controllers/coupon.controller';
import { validate } from '../middlewares/validation.middleware';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateCouponSchema } from '../schemas/coupon.schema';

const router = Router();

router.post('/validate', requireAuth, validate(validateCouponSchema), validateCouponController);

export default router;
