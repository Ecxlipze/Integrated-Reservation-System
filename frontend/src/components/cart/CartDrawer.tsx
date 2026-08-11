'use client';

import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useSyncExternalStore } from 'react';

// The cart persists to localStorage, so its contents only exist on the client.
// Subscribing to a constant server snapshot keeps the first client render
// identical to the server's, then swaps in the real count after hydration —
// without the setState-in-effect that a `mounted` flag needs.
const emptySnapshot = () => false;
const clientSnapshot = () => true;
const noopSubscribe = () => () => {};

function useHydrated() {
  return useSyncExternalStore(noopSubscribe, clientSnapshot, emptySnapshot);
}

/**
 * The cart drawer, opened from the masthead's "Cart (n)". The trigger is text,
 * not an icon button — the redesign is near-iconless by intent.
 */
export function CartDrawer() {
  const router = useRouter();
  const { items, removeItem, getTotalPrice } = useCartStore();
  const hydrated = useHydrated();
  const [isOpen, setIsOpen] = useState(false);

  const count = hydrated ? items.length : 0;

  const handleCheckout = () => {
    setIsOpen(false);
    router.push('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        render={
          <button className="cursor-pointer border-0 bg-transparent p-0 font-sans text-sm text-primary">
            Cart ({count})
          </button>
        }
      />

      <SheetContent className="flex flex-col gap-0 p-[26px]">
        <SheetHeader className="gap-0 p-0">
          <SheetTitle className="text-[26px] leading-tight font-semibold">
            Your cart
          </SheetTitle>
          <SheetDescription className="mb-[18px] text-[13.5px] text-ink-700">
            Held for 20 minutes. Rates are not guaranteed after that.
          </SheetDescription>
        </SheetHeader>

        <div className="h-px bg-border" role="presentation" />

        <ScrollArea className="flex-1">
          {count === 0 ? (
            // Empty state is one line — no icon.
            <p className="pt-7 text-[15px] text-ink-600">Nothing reserved yet.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between gap-3 border-b border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] py-4"
              >
                <div>
                  <div className="text-[17px] font-semibold capitalize">
                    {item.productType}
                  </div>
                  <div className="text-[13px] text-ink-600">
                    {item.bookingDates
                      ? `${item.bookingDates.checkIn} – ${item.bookingDates.checkOut}`
                      : `Ref ${item.productId.substring(0, 8)}`}
                    {item.quantity > 1 ? ` · ${item.quantity} rooms` : null}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="-ml-[5px] mt-1 px-[5px]"
                    onClick={() => removeItem(item.productId)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="text-[18px] font-semibold whitespace-nowrap">
                  ${item.price * item.quantity}
                </div>
              </div>
            ))
          )}
        </ScrollArea>

        <div className="mb-[14px] h-px bg-border" role="presentation" />
        <div className="mb-[14px] flex items-baseline justify-between">
          <span className="text-[15px]">Total</span>
          <span className="text-[30px] font-semibold">${getTotalPrice()}</span>
        </div>
        <Button
          className="w-full"
          onClick={handleCheckout}
          disabled={count === 0}
        >
          Checkout
        </Button>
        <Button
          variant="secondary"
          className="mt-2 w-full"
          onClick={() => setIsOpen(false)}
        >
          Keep looking
        </Button>
      </SheetContent>
    </Sheet>
  );
}
