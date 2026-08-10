import { Router } from 'express';
import { getCart, addToCart, removeFromCart } from '../controllers/cart.controller';
import { validate } from '../middlewares/validation.middleware';
import { requireAuth } from '../middlewares/auth.middleware';
import { addToCartSchema } from '../schemas/cart.schema';

const router = Router();

router.use(requireAuth); // All cart routes require authentication

router.get('/', getCart);
router.post('/', validate(addToCartSchema), addToCart);
router.delete('/:productType/:productId', removeFromCart);

export default router;
