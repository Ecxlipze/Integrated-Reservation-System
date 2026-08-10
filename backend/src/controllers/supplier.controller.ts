import { Request, Response, NextFunction } from 'express';
import { Supplier } from '../models/Supplier';
import { Flight } from '../models/Flight';
import { Hotel } from '../models/Hotel';
import { Bus } from '../models/Bus';
import { Tour } from '../models/Tour';
import { OrderItem, OrderItemStatus } from '../models/OrderItem';

// Helper to get the supplier doc for the logged in user
const getSupplierForUser = async (userId: string) => {
  const supplier = await Supplier.findOne({ linkedUserId: userId });
  if (!supplier) {
    throw new Error('Supplier profile not found for this user');
  }
  return supplier;
};

export const createInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productType, data } = req.body;
    const supplier = await getSupplierForUser(req.user!.userId);

    let Model: any;
    switch (productType) {
      case 'flight': Model = Flight; break;
      case 'hotel': Model = Hotel; break;
      case 'bus': Model = Bus; break;
      case 'tour': Model = Tour; break;
      default: return res.status(400).json({ message: 'Invalid product type' });
    }

    const newInventory = new Model({
      ...data,
      supplierId: supplier._id
    });

    await newInventory.save();
    res.status(201).json({ message: `${productType} created successfully`, data: newInventory });
  } catch (error: any) {
    if (error.message === 'Supplier profile not found for this user') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const updateInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const { productType, data } = req.body;
    const supplier = await getSupplierForUser(req.user!.userId);

    let Model: any;
    switch (productType) {
      case 'flight': Model = Flight; break;
      case 'hotel': Model = Hotel; break;
      case 'bus': Model = Bus; break;
      case 'tour': Model = Tour; break;
      default: return res.status(400).json({ message: 'Invalid product type' });
    }

    const item = await Model.findOne({ _id: productId, supplierId: supplier._id });
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found or unauthorized' });
    }

    Object.assign(item, data);
    await item.save();

    res.status(200).json({ message: `${productType} updated successfully`, data: item });
  } catch (error: any) {
    if (error.message === 'Supplier profile not found for this user') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const getSupplierBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supplier = await getSupplierForUser(req.user!.userId);
    const bookings = await OrderItem.find({ supplierId: supplier._id }).sort({ createdAt: -1 });
    
    res.status(200).json({ bookings });
  } catch (error: any) {
    if (error.message === 'Supplier profile not found for this user') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const confirmSupplierBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderItemId } = req.params;
    const supplier = await getSupplierForUser(req.user!.userId);

    const booking = await OrderItem.findOne({ _id: orderItemId, supplierId: supplier._id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or unauthorized' });
    }

    if (booking.status !== OrderItemStatus.PendingSupplier) {
      return res.status(400).json({ message: `Cannot confirm booking in status: ${booking.status}` });
    }

    booking.status = OrderItemStatus.Confirmed;
    await booking.save();

    res.status(200).json({ message: 'Booking confirmed', booking });
  } catch (error: any) {
    if (error.message === 'Supplier profile not found for this user') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};
