'use client';

import { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { CheckoutFlow } from '@/components/checkout/CheckoutFlow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Page } from '@/components/broadsheet/Page';
import { Kicker, Plate, SectionLabel, Standfirst } from '@/components/broadsheet';
import { useToast } from '@/hooks/use-toast';

// TODO(api): no wallet endpoint exists yet — see the handoff's data table.
const WALLET_BALANCE = 248;

export default function CheckoutPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { items, removeItem, getTotalPrice } = useCartStore();
  const { toast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // The cart lives in localStorage, so totals only exist on the client. A
  // constant server snapshot keeps the first render in step with the server's.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const subtotal = hydrated ? getTotalPrice() : 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode || !token) return;

    setIsApplyingCoupon(true);
    try {
      const res = await fetch(
        'http://localhost:5000/api/v1/coupons/validate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ couponCode, cartItems: items }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid coupon');

      setDiscountAmount(data.discountAmount);
      setAppliedCode(couponCode.toUpperCase());
      toast({
        title: 'Coupon applied',
        description: `You saved $${data.discountAmount}.`,
      });
    } catch (error) {
      toast({
        title: 'Invalid coupon',
        description:
          error instanceof Error ? error.message : 'Could not apply that code.',
        variant: 'destructive',
      });
      setDiscountAmount(0);
      setAppliedCode('');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  if (!hydrated) {
    return (
      <Page>
        <p className="pt-[30px] text-[15px] text-ink-700">Loading…</p>
      </Page>
    );
  }

  return (
    <Page>
      <div className="pt-[30px]">
        <h1 className="mb-1 text-[48px] tracking-[-0.015em]">Checkout</h1>
        <Standfirst className="mb-[30px]">
          {items.length} reservation{items.length === 1 ? '' : 's'}.
          Confirmation is instant for direct inventory.
        </Standfirst>

        <div className="grid gap-[46px] md:grid-cols-[1fr_300px]">
          <div>
            {items.length === 0 ? (
              <p className="text-[17px] text-ink-700">
                Your cart is empty.{' '}
                <button
                  className="cursor-pointer border-0 bg-transparent p-0 font-sans text-[17px] text-primary underline-offset-[3px] hover:underline"
                  onClick={() => router.push('/search')}
                >
                  Browse hotels
                </button>
                .
              </p>
            ) : (
              // A borderless line-item table — not a card.
              <table className="w-full border-collapse">
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.productId}
                      className="border-b border-[color-mix(in_srgb,var(--foreground)_8%,transparent)]"
                    >
                      <td className="w-[70px] py-2 pr-2">
                        <Plate className="h-[52px] p-0" />
                      </td>
                      <td className="py-2">
                        <div className="text-[18px] font-semibold capitalize">
                          {item.productType}
                        </div>
                        <div className="text-[13px] text-ink-600">
                          {item.bookingDates
                            ? `${item.bookingDates.checkIn} – ${item.bookingDates.checkOut}`
                            : '14–18 Sep'}{' '}
                          · 2 adults · ref{' '}
                          <span className="font-mono">
                            {item.productId.substring(0, 8)}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 text-right text-[17px]">
                        ${item.price * item.quantity}
                      </td>
                      <td className="w-10 py-2 text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(item.productId)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <SectionLabel className="mt-[34px] mb-3">
              Lead traveller
            </SectionLabel>
            <div className="grid max-w-[640px] grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Field label="First name">
                <Input autoComplete="given-name" />
              </Field>
              <Field label="Last name">
                <Input autoComplete="family-name" />
              </Field>
              <Field label="Email">
                <Input type="email" autoComplete="email" />
              </Field>
              <Field label="Phone">
                <Input type="tel" autoComplete="tel" />
              </Field>
            </div>
            <div className="mt-3.5 max-w-[640px]">
              <Field label="Special requests">
                <textarea
                  className="min-h-[90px] w-full resize-y rounded-[2px] border border-input bg-card px-2.5 py-1.5 font-sans text-sm text-foreground caret-primary outline-none hover:border-[color-mix(in_srgb,var(--foreground)_45%,transparent)] focus-visible:border-primary focus-visible:outline-offset-0"
                  placeholder="Late arrival, around 22:00."
                />
              </Field>
            </div>
          </div>

          {/* Price breakdown — behind a hairline, not in a card. */}
          <aside className="self-start border-l border-border pl-[22px]">
            <div className="flex flex-col gap-3">
              <Kicker tone="muted">Price breakdown</Kicker>
              <Line label="Room subtotal" value={`$${subtotal}`} />
              <Line label="Taxes & fees" value="Included" />
              {discountAmount > 0 ? (
                <div className="flex justify-between text-[15px] text-magenta-700">
                  <span>Coupon {appliedCode}</span>
                  <span>−${discountAmount}</span>
                </div>
              ) : null}

              <div className="my-1 h-px bg-border" role="presentation" />

              <div className="flex items-baseline justify-between">
                <span className="text-[15px]">Total</span>
                <span className="text-[34px] font-semibold">${total}</span>
              </div>

              <div className="mt-2 flex gap-2">
                <Input
                  placeholder="Promo code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <Button
                  variant="secondary"
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponCode}
                >
                  {isApplyingCoupon ? '…' : 'Apply'}
                </Button>
              </div>

              <CheckoutFlow finalPrice={total} />

              <p className="mt-1 text-[12.5px] leading-[1.45] text-ink-600">
                Authorised with your device biometrics. Wallet balance $
                {WALLET_BALANCE}.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </Page>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[15px]">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-[5px] block text-xs text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
        {label}
      </span>
      {children}
    </label>
  );
}
