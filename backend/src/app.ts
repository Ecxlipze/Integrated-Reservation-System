import express, { Application } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.middleware';
import authRoutes from './routes/auth.routes';
import searchRoutes from './routes/search.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import couponRoutes from './routes/coupon.routes';

const app: Application = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/coupons', couponRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
