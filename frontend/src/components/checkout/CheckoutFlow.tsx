'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { triggerBiometricAuth } from '@/lib/webauthn';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Fingerprint, Wallet } from 'lucide-react';

export function CheckoutFlow() {
  const { token } = useAuthStore();
  const { getTotalPrice } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleWalletCheckout = async () => {
    if (!token) return;
    
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      // 1. Native Biometric Challenge
      const isVerified = await triggerBiometricAuth(token);
      
      if (!isVerified) {
        throw new Error('Biometric authentication failed or was cancelled.');
      }

      // 2. Call backend checkout & payment webhooks (mocked for this draft)
      // await processBackendCheckout(token);
      
      setCheckoutStatus('success');
    } catch (err: any) {
      setCheckoutStatus('failed');
      setErrorMessage(err.message || 'Payment failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl">Checkout</CardTitle>
        <CardDescription>Securely complete your reservation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center py-4 border-b">
          <span className="text-muted-foreground">Total Amount</span>
          <span className="text-2xl font-bold">${getTotalPrice()}</span>
        </div>

        <div className="pt-4">
          <Dialog>
            <DialogTrigger render={
              <Button className="w-full" size="lg">
                <Wallet className="mr-2 h-5 w-5" />
                Pay with Wallet
              </Button>
            } />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Authorize Wallet Payment</DialogTitle>
                <DialogDescription>
                  Confirm your purchase of ${getTotalPrice()} using your biometric credentials.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="bg-primary/10 p-4 rounded-full text-primary animate-pulse">
                  <Fingerprint className="h-12 w-12" />
                </div>
                {checkoutStatus === 'failed' && (
                  <p className="text-sm text-destructive">{errorMessage}</p>
                )}
                {checkoutStatus === 'success' && (
                  <p className="text-sm text-green-500 font-medium">Payment Successful!</p>
                )}
              </div>

              <DialogFooter>
                <Button 
                  onClick={handleWalletCheckout} 
                  disabled={isProcessing || checkoutStatus === 'success'}
                  className="w-full"
                >
                  {isProcessing ? 'Verifying...' : 'Authorize Payment'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
