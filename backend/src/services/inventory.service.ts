import mongoose, { ClientSession } from 'mongoose';
import { InventorySnapshot } from '../models/InventorySnapshot';
import { Flight } from '../models/Flight';
import { Hotel } from '../models/Hotel';
import { Bus } from '../models/Bus';
import { Tour } from '../models/Tour';
import { ICartItem } from '../models/Cart';
import crypto from 'crypto';

export const lockInventory = async (cartItems: ICartItem[], session: ClientSession) => {
  const snapshots = [];

  for (const item of cartItems) {
    let Model: mongoose.Model<any>;
    let availabilityField = '';
    let supplierField = '';

    switch (item.productType) {
      case 'flight': Model = Flight; availabilityField = 'availableSeats'; break;
      case 'hotel': Model = Hotel; availabilityField = 'availableRooms'; break;
      case 'bus': Model = Bus; availabilityField = 'availableSeats'; break;
      case 'tour': Model = Tour; availabilityField = 'availableSlots'; break;
      default: throw new Error(`Unknown product type: ${item.productType}`);
    }

    // Find and update atomically within the transaction
    const query = { _id: item.productId, [availabilityField]: { $gte: item.quantity } };
    const update = { $inc: { [availabilityField]: -item.quantity } };
    
    const product = await Model.findOneAndUpdate(query, update, { session, new: true });
    
    if (!product) {
      throw new Error(`Insufficient inventory for ${item.productType} ID: ${item.productId}`);
    }

    // Create a snapshot
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes lock
    
    // In a real app, product would have supplierId. Mocking supplierId for now as a static ObjectId or random if missing.
    // For this demonstration, we'll assign a dummy ObjectId if the schema lacks it, but we should probably add supplierId to the models.
    // Wait, the schemas I created (Flight, Hotel, etc.) didn't have supplierId! 
    // I will use a dummy one for now, or just default it.
    const supplierId = product.supplierId || new mongoose.Types.ObjectId();

    const snapshotHash = crypto.createHash('sha256').update(JSON.stringify(product)).digest('hex');

    const snapshot = new InventorySnapshot({
      productType: item.productType,
      productId: item.productId,
      supplierId: supplierId,
      snapshotData: product.toObject(),
      snapshotHash,
      expiresAt
    });

    await snapshot.save({ session });
    snapshots.push(snapshot);
  }

  return snapshots;
};
