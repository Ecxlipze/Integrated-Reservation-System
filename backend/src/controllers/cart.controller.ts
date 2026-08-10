import { Request, Response, NextFunction } from 'express';
import { Cart } from '../models/Cart';
import { Flight } from '../models/Flight';
import { Hotel } from '../models/Hotel';
import { Bus } from '../models/Bus';
import { Tour } from '../models/Tour';

const getProductDetails = async (productType: string, productId: string) => {
  switch (productType) {
    case 'flight': return Flight.findById(productId);
    case 'hotel': return Hotel.findById(productId);
    case 'bus': return Bus.findById(productId);
    case 'tour': return Tour.findById(productId);
    default: return null;
  }
};

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    // Populate product details
    const populatedItems = await Promise.all(cart.items.map(async (item) => {
      const details = await getProductDetails(item.productType, item.productId);
      return {
        productType: item.productType,
        productId: item.productId,
        quantity: item.quantity,
        details
      };
    }));

    res.json({ cart: { id: cart.id, items: populatedItems } });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { productType, productId, quantity } = req.body;

    // Verify product exists
    const product = await getProductDetails(productType, productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productType === productType && item.productId === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ productType, productId, quantity });
    }

    await cart.save();
    res.status(200).json({ message: 'Added to cart', cart });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { productType, productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => !(item.productType === productType && item.productId === productId)
    );

    await cart.save();
    res.status(200).json({ message: 'Removed from cart', cart });
  } catch (error) {
    next(error);
  }
};
