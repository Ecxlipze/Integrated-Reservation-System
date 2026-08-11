'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { triggerBiometricAuth } from '@/lib/webauthn';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type PaymentStatus = 'idle' | 'verifying' | 'success' | 'failed';

// The circle's label cycles through these as the authorisation proceeds.
const PLATE_WORD: Record<PaymentStatus, string> = {
  idle: 'Touch',
  verifying: 'Reading',
  success: 'Approved',
  failed: 'Failed',
};

/**
 * The wallet authorisation. Replaces the pulsing-fingerprint dialog with the
 * outlined process circle; the WebAuthn call itself is unchanged.
 */
export function CheckoutFlow({
  finalPrice,
  walletBalance,
}: {
  finalPrice?: number;
  walletBalance?: number;
}) {
  const router = useRouter();
  const { token } = useAuthStore();
  const { getTotalPrice, clearCart } = useCartStore();
  const displayPrice = finalPrice !== undefined ? finalPrice : getTotalPrice();

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleWalletCheckout = async () => {
    if (!token) return;

    setStatus('verifying');
    setErrorMessage('');

    try {
      const isVerified = await triggerBiometricAuth(token);
      if (!isVerified) {
        throw new Error('Biometric authentication failed or was cancelled.');
      }

      setStatus('success');
      // Let the circle read Approved before clearing and routing away.
      setTimeout(() => {
        clearCart();
        router.push('/orders');
      }, 1100);
    } catch (err) {
      setStatus('failed');
      setErrorMessage(
        err instanceof Error ? err.message : 'Payment failed.'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button className="mt-2.5 w-full">Pay with wallet</Button>}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[20px]">Authorise payment</DialogTitle>
          <DialogDescription>
            Confirm ${displayPrice} from your Almanac wallet using this
            device&rsquo;s biometrics.
          </DialogDescription>
        </DialogHeader>

        <div className="grid place-items-center py-[26px]">
          <div
            className="grid size-24 place-items-center rounded-full border-2 border-primary text-xs tracking-[0.1em] uppercase text-cyan-700"
            aria-live="polite"
          >
            {PLATE_WORD[status]}
          </div>
          {status === 'failed' ? (
            <p className="mt-4 text-sm text-magenta-700">{errorMessage}</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={status === 'verifying' || status === 'success'}
          >
            Cancel
          </Button>
          <Button
            onClick={handleWalletCheckout}
            disabled={status === 'verifying' || status === 'success'}
          >
            {status === 'verifying' ? 'Verifying…' : 'Authorise payment'}
          </Button>
        </DialogFooter>

        {walletBalance !== undefined ? (
          <p className="text-[12.5px] leading-[1.45] text-ink-600">
            Wallet balance ${walletBalance}.
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
