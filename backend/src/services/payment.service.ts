import mongoose from 'mongoose';
import { Payment, PaymentStatus } from '../models/Payment';
import { Order, OrderStatus } from '../models/Order';
import { OrderItem, OrderItemStatus } from '../models/OrderItem';
import { WalletTransaction, TransactionType } from '../models/WalletTransaction';
import { releaseInventory, confirmInventory } from './inventory.service';
import { processReferralBonus } from './referral.service';

export const getWalletBalance = async (userId: string, session?: mongoose.ClientSession) => {
  const transactions = await WalletTransaction.find({ userId }).session(session || null);
  return transactions.reduce((acc, curr) => {
    return curr.type === TransactionType.Credit ? acc + curr.amount : acc - curr.amount;
  }, 0);
};

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
    const order = await Order.findById(orderId).session(session);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (success) {
      if (payment.paymentMethod === 'Wallet') {
        const balance = await getWalletBalance(order.customerId.toString(), session);
        if (balance < payment.amount) {
          throw new Error('Insufficient wallet balance');
        }

        const debitTx = new WalletTransaction({
          userId: order.customerId,
          amount: payment.amount,
          type: TransactionType.Debit,
          description: `Payment for order ${order.orderNumber}`,
          relatedOrderId: order._id
        });
        await debitTx.save({ session });
      }

      payment.status = PaymentStatus.Completed;
      await payment.save({ session });

      order.status = OrderStatus.Confirmed;
      order.paymentStatus = 'paid' as any; // Cast as PaymentStatus string to avoid TS error
      await order.save({ session });

      await OrderItem.updateMany(
        { orderId },
        { status: OrderItemStatus.Confirmed },
        { session }
      );

      await confirmInventory(orderId, session);

      // Trigger referral bonus check
      await processReferralBonus(order.customerId, session);

    } else {
      payment.status = PaymentStatus.Failed;
      await payment.save({ session });

      order.status = OrderStatus.Cancelled;
      order.paymentStatus = 'failed' as any;
      await order.save({ session });

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
