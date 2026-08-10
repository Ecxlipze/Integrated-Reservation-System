import { Request, Response, NextFunction } from 'express';
import { processCheckout } from '../services/order.service';

export const checkout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const idempotencyKey = req.headers['idempotency-key'] as string;

    const order = await processCheckout(userId, idempotencyKey);

    res.status(200).json({
      message: 'Checkout successful, pending payment',
      order
    });
  } catch (error: any) {
    if (error.message.includes('Insufficient inventory') || error.message.includes('Cart is empty')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};
