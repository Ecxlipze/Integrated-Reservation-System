import { Coupon, DiscountType, ICoupon } from '../models/Coupon';
import { ICartItem } from '../models/Cart';

export const validateCoupon = async (code: string, cartItems: ICartItem[], cartTotal: number): Promise<{ isValid: boolean; discountAmount: number; error?: string; coupon?: ICoupon }> => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  
  if (!coupon) {
    return { isValid: false, discountAmount: 0, error: 'Invalid coupon code' };
  }

  const now = new Date();
  if (now < coupon.startDate || now > coupon.endDate) {
    return { isValid: false, discountAmount: 0, error: 'Coupon is expired or not yet active' };
  }

  if (cartTotal < coupon.minCartAmount) {
    return { isValid: false, discountAmount: 0, error: `Minimum cart amount of $${coupon.minCartAmount} required` };
  }

  // Check if cart has applicable items
  const hasApplicableItems = cartItems.some(item => 
    coupon.applicableProductTypes.length === 0 || 
    coupon.applicableProductTypes.includes(item.productType)
  );

  if (!hasApplicableItems) {
    return { isValid: false, discountAmount: 0, error: 'Coupon does not apply to any items in your cart' };
  }

  let discountAmount = 0;
  if (coupon.discountType === DiscountType.Flat) {
    discountAmount = coupon.value;
  } else if (coupon.discountType === DiscountType.Percentage) {
    discountAmount = cartTotal * (coupon.value / 100);
  }

  // Ensure discount doesn't exceed cart total
  discountAmount = Math.min(discountAmount, cartTotal);

  return { isValid: true, discountAmount, coupon };
};
