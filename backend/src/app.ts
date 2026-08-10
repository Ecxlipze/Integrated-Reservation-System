import express, { Application } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.middleware';
import authRoutes from './routes/auth.routes';
import searchRoutes from './routes/search.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import couponRoutes from './routes/coupon.routes';
import supplierRoutes from './routes/supplier.routes';
import adminRoutes from './routes/admin.routes';
import mediaRoutes from './routes/media.routes';
import path from 'path';

const app: Application = express();

app.use(cors());
app.use(express.json());

// Serve uploads folder statically for mock media storage
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/supplier', supplierRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/media', mediaRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
