import mongoose from 'mongoose';
import { Cart } from '../models/Cart';
import { Order, OrderStatus, PaymentStatus } from '../models/Order';
import { OrderItem, OrderItemStatus } from '../models/OrderItem';
import { lockInventory } from './inventory.service';
import { validateCoupon } from './coupon.service';
import crypto from 'crypto';

export const processCheckout = async (userId: string, idempotencyKey: string, couponCode?: string) => {
  // 1. Idempotency Check: Prevent duplicate master orders
  const existingOrder = await Order.findOne({ 'orderNumber': idempotencyKey });
  if (existingOrder) {
    return existingOrder;
  }

  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    // 2. Fetch User Cart
    const cart = await Cart.findOne({ userId }).session(session);
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // 3. Lock Inventory (Throws if out of stock, which rolls back transaction)
    const snapshots = await lockInventory(cart.items, session);

    // 4. Generate Master Order
    let totalAmount = 0;
    
    // Calculate total from snapshots
    for (const snap of snapshots) {
      const item = cart.items.find(i => i.productId.toString() === snap.productId.toString());
      const quantity = item?.quantity || 1;
      
      const price = snap.snapshotData.price || snap.snapshotData.pricePerNight || 0;
      totalAmount += price * quantity;
    }

    let discountAmount = 0;
    if (couponCode) {
      const validationResult = await validateCoupon(couponCode, cart.items, totalAmount);
      if (!validationResult.isValid) {
        throw new Error(`Invalid coupon: ${validationResult.error}`);
      }
      discountAmount = validationResult.discountAmount;
    }

    const netAmount = totalAmount - discountAmount;

    const masterOrder = new Order({
      orderNumber: idempotencyKey, 
      customerId: userId,
      totalAmount,
      discountAmount,
      netAmount,
      currency: 'USD',
      paymentStatus: PaymentStatus.Pending,
      status: OrderStatus.PaymentPending,
      couponCode: discountAmount > 0 ? couponCode : undefined
    });

    await masterOrder.save({ session });

    // Link snapshots to the order
    for (const snap of snapshots) {
      snap.orderId = masterOrder._id as mongoose.Types.ObjectId;
      await snap.save({ session });
    }

    // 5. Generate Child OrderItems
    const orderItems = [];
    for (const snap of snapshots) {
      const item = cart.items.find(i => i.productId.toString() === snap.productId.toString());
      const quantity = item?.quantity || 1;
      const price = snap.snapshotData.price || snap.snapshotData.pricePerNight || 0;

      const orderItem = new OrderItem({
        orderId: masterOrder._id,
        supplierId: snap.supplierId,
        productType: snap.productType,
        productId: snap.productId,
        productDetails: snap.snapshotData,
        quantity,
        unitPrice: price,
        totalPrice: price * quantity,
        status: OrderItemStatus.PendingSupplier
      });

      await orderItem.save({ session });
      orderItems.push(orderItem);
    }

    // 6. Clear Cart
    cart.items = [];
    await cart.save({ session });

    // 7. Commit Transaction
    await session.commitTransaction();
    session.endSession();

    return masterOrder;
  } catch (error) {
    // 8. Rollback Transaction on any failure
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
