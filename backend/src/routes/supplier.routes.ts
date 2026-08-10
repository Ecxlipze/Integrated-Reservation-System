import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '../models/User';
import {
  createInventory,
  updateInventory,
  getSupplierBookings,
  confirmSupplierBooking
} from '../controllers/supplier.controller';

const router = Router();

// Apply auth and role middleware to all routes in this router
router.use(requireAuth, requireRole([UserRole.Supplier]));

router.post('/inventory', createInventory);
router.put('/inventory/:productId', updateInventory);
router.get('/bookings', getSupplierBookings);
router.post('/bookings/:orderItemId/confirm', confirmSupplierBooking);

export default router;
