import { Request, Response, NextFunction } from 'express';
import { createPaymentIntent, confirmPayment } from '../services/payment.service';

export const processPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, paymentMethod, simulateSuccess } = req.body;

    const payment = await createPaymentIntent(orderId, paymentMethod);

    // Simulate async webhook processing for manual verification
    if (simulateSuccess !== undefined) {
      setTimeout(async () => {
        try {
          await confirmPayment(payment.transactionId!, simulateSuccess);
          console.log(`[Webhook Simulation] Payment ${payment.transactionId} processed: Success=${simulateSuccess}`);
        } catch (err) {
          console.error(`[Webhook Simulation Error]`, err);
        }
      }, 1000);
    }

    res.status(200).json({
      message: 'Payment intent created',
      payment
    });
  } catch (error: any) {
    if (error.message.includes('Order not found') || error.message.includes('status')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const webhookHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transactionId, status } = req.body;
    
    const success = status === 'success';
    await confirmPayment(transactionId, success);

    res.status(200).json({ message: 'Webhook received and processed' });
  } catch (error) {
    next(error);
  }
};
