import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '../models/User';
import {
  approveSupplier,
  getAnalytics,
  getSuppliers
} from '../controllers/admin.controller';

const router = Router();

// Apply auth and admin role middleware
router.use(requireAuth, requireRole([UserRole.Admin]));

router.get('/suppliers', getSuppliers);
router.put('/suppliers/:supplierId/approve', approveSupplier);
router.get('/analytics', getAnalytics);

export default router;
