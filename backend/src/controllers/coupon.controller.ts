import { Request, Response, NextFunction } from 'express';
import { validateCoupon } from '../services/coupon.service';
import { Cart } from '../models/Cart';
import { Flight } from '../models/Flight';
import { Hotel } from '../models/Hotel';
import { Bus } from '../models/Bus';
import { Tour } from '../models/Tour';

export const validateCouponController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    const userId = req.user!.userId;

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let cartTotal = 0;
    for (const item of cart.items) {
      let Model: any;
      switch (item.productType) {
        case 'flight': Model = Flight; break;
        case 'hotel': Model = Hotel; break;
        case 'bus': Model = Bus; break;
        case 'tour': Model = Tour; break;
      }
      const product = await Model.findById(item.productId);
      if (product) {
        const price = product.price || product.pricePerNight || 0;
        cartTotal += price * item.quantity;
      }
    }

    const validationResult = await validateCoupon(code, cart.items, cartTotal);

    if (!validationResult.isValid) {
      return res.status(400).json({ message: validationResult.error });
    }

    res.status(200).json({
      message: 'Coupon is valid',
      discountAmount: validationResult.discountAmount,
      netAmount: cartTotal - validationResult.discountAmount
    });
  } catch (error) {
    next(error);
  }
};
