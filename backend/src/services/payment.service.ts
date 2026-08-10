import mongoose from 'mongoose';
import { Payment, PaymentStatus } from '../models/Payment';
import { Order, OrderStatus } from '../models/Order';
import { OrderItem, OrderItemStatus } from '../models/OrderItem';
import { releaseInventory, confirmInventory } from './inventory.service';

export const createPaymentIntent = async (orderId: string, paymentMethod: string) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status !== OrderStatus.PaymentPending) {
    throw new Error(`Cannot process payment for order in status: ${order.status}`);
  }

  const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const payment = new Payment({
    orderId,
    transactionId,
    amount: order.netAmount,
    paymentMethod,
    status: PaymentStatus.Pending
  });

  await payment.save();

  return payment;
};

export const confirmPayment = async (transactionId: string, success: boolean) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const payment = await Payment.findOne({ transactionId }).session(session);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== PaymentStatus.Pending) {
      throw new Error('Payment already processed');
    }

    const orderId = payment.orderId.toString();

    if (success) {
      payment.status = PaymentStatus.Completed;
      await payment.save({ session });

      await Order.findByIdAndUpdate(orderId, {
        status: OrderStatus.Confirmed,
        paymentStatus: 'paid'
      }, { session });

      await OrderItem.updateMany(
        { orderId },
        { status: OrderItemStatus.Confirmed },
        { session }
      );

      await confirmInventory(orderId, session);

    } else {
      payment.status = PaymentStatus.Failed;
      await payment.save({ session });

      await Order.findByIdAndUpdate(orderId, {
        status: OrderStatus.Cancelled,
        paymentStatus: 'failed'
      }, { session });

      await OrderItem.updateMany(
        { orderId },
        { status: OrderItemStatus.Cancelled },
        { session }
      );

      await releaseInventory(orderId, session);
    }

    await session.commitTransaction();
    session.endSession();

    return payment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
