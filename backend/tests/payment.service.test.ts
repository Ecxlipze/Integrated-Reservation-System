import mongoose from 'mongoose';
import { createPaymentIntent, confirmPayment } from '../src/services/payment.service';
import { processCheckout } from '../src/services/order.service';
import { User, UserRole } from '../src/models/User';
import { Flight } from '../src/models/Flight';
import { Cart } from '../src/models/Cart';
import { Order, OrderStatus, PaymentStatus as OrderPaymentStatus } from '../src/models/Order';
import { Payment, PaymentStatus } from '../src/models/Payment';
import { WalletTransaction, TransactionType } from '../src/models/WalletTransaction';
import { OrderItem, OrderItemStatus } from '../src/models/OrderItem';
import { InventorySnapshot } from '../src/models/InventorySnapshot';
import crypto from 'crypto';

describe('Payment Service Tests', () => {
  let userId: string;
  let flightId: string;
  let orderId: string;

  beforeEach(async () => {
    // 1. Create User
    const user = new User({
      firstName: 'Payment',
      lastName: 'Tester',
      email: 'payment@test.com',
      passwordHash: 'hashed',
      role: UserRole.Customer,
      referralCode: 'PAY-123'
    });
    await user.save();
    userId = user._id.toString();

    // 2. Create a Flight
    const flight = new Flight({
      airline: 'Test Airlines',
      flightNumber: 'TST-101',
      origin: 'JFK',
      destination: 'LHR',
      departureTime: new Date(),
      arrivalTime: new Date(Date.now() + 36000000),
      availableSeats: 50,
      price: 500,
      supplierId: new mongoose.Types.ObjectId()
    });
    await flight.save();
    flightId = flight._id.toString();

    // 3. Create a Cart
    const cart = new Cart({
      userId,
      items: [
        {
          productId: flight._id,
          productType: 'flight',
          quantity: 1
        }
      ]
    });
    await cart.save();

    // 4. Generate Master Order via checkout
    const idempotencyKey = crypto.randomUUID();
    const order = await processCheckout(userId, idempotencyKey);
    orderId = order._id.toString();
  });

  describe('Rollback on Failure', () => {
    it('should transition order to failed, cancel items, and release inventory on payment failure', async () => {
      // 1. Create Payment Intent
      const paymentIntent = await createPaymentIntent(orderId, 'CreditCard');

      // 2. Simulate Payment Webhook Failure
      await confirmPayment(paymentIntent.transactionId!, false);

      // 3. Assert Order State
      const updatedOrder = await Order.findById(orderId);
      expect(updatedOrder!.status).toBe(OrderStatus.Cancelled);
      expect(updatedOrder!.paymentStatus).toBe('failed');

      // 4. Assert OrderItem State
      const orderItems = await OrderItem.find({ orderId });
      expect(orderItems[0].status).toBe(OrderItemStatus.Cancelled);

      // 5. Assert Inventory Released (seats go from 49 back to 50)
      const updatedFlight = await Flight.findById(flightId);
      expect(updatedFlight!.availableSeats).toBe(50);

      // 6. Assert Snapshot State
      const snapshot = await InventorySnapshot.findOne({ orderId });
      expect(snapshot!.status).toBe('released');
    });
  });

  describe('Wallet Concurrency & Payment', () => {
    it('should block purchase if wallet balance is insufficient', async () => {
      // 1. Create Payment Intent using Wallet
      const paymentIntent = await createPaymentIntent(orderId, 'Wallet');

      // 2. Attempt to confirm payment with Wallet (but user has $0 balance)
      await expect(confirmPayment(paymentIntent.transactionId!, true)).rejects.toThrow('Insufficient wallet balance');
    });

    it('should deduct balance and succeed if wallet balance is sufficient', async () => {
      // 1. Give User some wallet balance
      const credit = new WalletTransaction({
        userId,
        amount: 1000,
        type: TransactionType.Credit,
        description: 'Test Funding'
      });
      await credit.save();

      // 2. Create Payment Intent using Wallet
      const paymentIntent = await createPaymentIntent(orderId, 'Wallet');
      expect(paymentIntent.amount).toBe(500); // Flight price is 500

      // 3. Confirm payment with Wallet
      await confirmPayment(paymentIntent.transactionId!, true);

      // 4. Assert Wallet Balance was deducted (debit transaction created)
      const debits = await WalletTransaction.find({ userId, type: TransactionType.Debit });
      expect(debits.length).toBe(1);
      expect(debits[0].amount).toBe(500);

      // 5. Assert Order State
      const updatedOrder = await Order.findById(orderId);
      expect(updatedOrder!.status).toBe(OrderStatus.Confirmed);
      expect(updatedOrder!.paymentStatus).toBe(OrderPaymentStatus.Captured);

      // 6. Assert Snapshot State
      const snapshot = await InventorySnapshot.findOne({ orderId });
      expect(snapshot!.status).toBe('fulfilled');
    });
  });
});
