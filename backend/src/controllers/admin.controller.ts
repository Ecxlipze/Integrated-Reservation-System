import { Request, Response, NextFunction } from 'express';
import { Supplier } from '../models/Supplier';
import { Order, OrderStatus, PaymentStatus } from '../models/Order';
import { OrderItem } from '../models/OrderItem';
import { WalletTransaction, TransactionType } from '../models/WalletTransaction';

export const approveSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { supplierId } = req.params;
    
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    supplier.status = 'active';
    await supplier.save();

    res.status(200).json({ message: 'Supplier approved successfully', supplier });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. GMV: Aggregate Orders in Confirmed/Paid status
    const gmvResult = await Order.aggregate([
      { 
        $match: { 
          $or: [{ status: OrderStatus.Confirmed }, { paymentStatus: PaymentStatus.Captured }]
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalGMV: { $sum: '$netAmount' },
          totalOrders: { $sum: 1 }
        } 
      }
    ]);
    const gmv = gmvResult.length > 0 ? gmvResult[0].totalGMV : 0;
    const totalOrders = gmvResult.length > 0 ? gmvResult[0].totalOrders : 0;

    // 2. Supplier Bookings: Count OrderItems per supplier
    const supplierBookings = await OrderItem.aggregate([
      {
        $group: {
          _id: '$supplierId',
          totalBookings: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'suppliers',
          localField: '_id',
          foreignField: '_id',
          as: 'supplierInfo'
        }
      },
      {
        $project: {
          supplierId: '$_id',
          supplierName: { $arrayElemAt: ['$supplierInfo.name', 0] },
          totalBookings: 1,
          _id: 0
        }
      }
    ]);

    // 3. Wallet Liabilities: Aggregate credits and debits
    const walletStats = await WalletTransaction.aggregate([
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    let credits = 0;
    let debits = 0;
    for (const stat of walletStats) {
      if (stat._id === TransactionType.Credit) credits = stat.totalAmount;
      if (stat._id === TransactionType.Debit) debits = stat.totalAmount;
    }
    const walletLiabilities = credits - debits;

    res.status(200).json({
      gmv,
      totalOrders,
      walletLiabilities,
      supplierBookings
    });
  } catch (error) {
    next(error);
  }
};

export const getSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const suppliers = await Supplier.find().populate('linkedUserId', 'firstName lastName email');
    res.status(200).json({ suppliers });
  } catch (error) {
    next(error);
  }
};
