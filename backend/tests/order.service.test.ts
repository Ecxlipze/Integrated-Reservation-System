import mongoose from 'mongoose';
import { processCheckout } from '../src/services/order.service';
import { User, UserRole } from '../src/models/User';
import { Hotel } from '../src/models/Hotel';
import { Cart } from '../src/models/Cart';
import { Order } from '../src/models/Order';
import { InventorySnapshot } from '../src/models/InventorySnapshot';
import crypto from 'crypto';

describe('Order Service Tests', () => {
  let userId: string;
  let hotelId: string;
  let supplierId: string;

  beforeEach(async () => {
    // 1. Create a dummy supplier (User)
    const supplierUser = new User({
      firstName: 'Supplier',
      lastName: 'One',
      email: 'supplier@test.com',
      passwordHash: 'hashed',
      role: UserRole.Supplier,
      referralCode: 'SUP-123'
    });
    await supplierUser.save();
    supplierId = supplierUser._id.toString();

    // 2. Create a customer
    const user = new User({
      firstName: 'Customer',
      lastName: 'Test',
      email: 'customer@test.com',
      passwordHash: 'hashed',
      role: UserRole.Customer,
      referralCode: 'CUS-123'
    });
    await user.save();
    userId = user._id.toString();

    // 3. Create a Hotel with exactly 1 available room
    const hotel = new Hotel({
      name: 'Test Hotel',
      location: 'Test City',
      availableRooms: 1, // Only 1 room available
      pricePerNight: 100,
      amenities: [],
      supplierId: supplierUser._id
    });
    await hotel.save();
    hotelId = hotel._id.toString();

    // 4. Create a Cart for the customer requesting 1 room
    const cart = new Cart({
      userId,
      items: [
        {
          productId: hotel._id,
          productType: 'hotel',
          quantity: 1,
          bookingDates: {
            checkIn: new Date(),
            checkOut: new Date(Date.now() + 86400000)
          }
        }
      ]
    });
    await cart.save();
  });

  describe('Concurrency / Race Conditions', () => {
    it('should successfully process exactly one checkout when two concurrent requests are made for the last item', async () => {
      // Simulate two concurrent checkout attempts from the same or different sessions
      // We will use two different idempotency keys to simulate two unique checkout intents
      // Wait, if it's the exact same cart, we can simulate two different checkouts for the same user or different users.
      // Let's create a second user and cart for the same hotel
      const user2 = new User({
        firstName: 'Customer2',
        lastName: 'Test2',
        email: 'customer2@test.com',
        passwordHash: 'hashed',
        role: UserRole.Customer,
        referralCode: 'CUS-456'
      });
      await user2.save();

      const cart2 = new Cart({
        userId: user2._id,
        items: [
          {
            productId: hotelId,
            productType: 'hotel',
            quantity: 1,
            bookingDates: {
              checkIn: new Date(),
              checkOut: new Date(Date.now() + 86400000)
            }
          }
        ]
      });
      await cart2.save();

      // Fire both checkouts concurrently
      const promise1 = processCheckout(userId, crypto.randomUUID());
      const promise2 = processCheckout(user2._id.toString(), crypto.randomUUID());

      const results = await Promise.allSettled([promise1, promise2]);

      const fulfilled = results.filter(r => r.status === 'fulfilled');
      const rejected = results.filter(r => r.status === 'rejected');

      // Assert exactly one succeeds and one fails
      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(1);
      
      if (rejected[0].status === 'rejected') {
        const errorMsg = rejected[0].reason.message;
        // Depending on timing, MongoDB will either throw a WriteConflict or our Insufficient inventory error
        expect(errorMsg.includes('Insufficient inventory') || errorMsg.includes('Write conflict')).toBe(true);
      }

      // Check database to ensure hotel availableRooms is 0
      const updatedHotel = await Hotel.findById(hotelId);
      expect(updatedHotel!.availableRooms).toBe(0);

      // Check that exactly one Snapshot exists
      const snapshots = await InventorySnapshot.find({ productId: hotelId });
      expect(snapshots.length).toBe(1);
    });
  });

  describe('Idempotency', () => {
    it('should not create a second order or decrement inventory twice when given the same idempotencyKey', async () => {
      const idempotencyKey = crypto.randomUUID();

      // Fire the first checkout
      const order1 = await processCheckout(userId, idempotencyKey);

      // Fire the second checkout with identical key
      const order2 = await processCheckout(userId, idempotencyKey);

      // Assert they are the same order
      expect(order1._id.toString()).toBe(order2._id.toString());
      expect(order1.orderNumber).toBe(idempotencyKey);

      // Assert only one order exists in total
      const allOrders = await Order.find({});
      expect(allOrders.length).toBe(1);

      // Assert inventory was only decremented by 1
      const updatedHotel = await Hotel.findById(hotelId);
      expect(updatedHotel!.availableRooms).toBe(0); // Started with 1, decremented by 1
    });
  });
});
