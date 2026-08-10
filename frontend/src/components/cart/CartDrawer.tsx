'use client';

import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

export function CartDrawer() {
  const router = useRouter();
  const { items, removeItem, getTotalPrice, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleCheckout = () => {
    setIsOpen(false);
    router.push('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger render={
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {items.length > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs rounded-full">
              {items.length}
            </Badge>
          )}
        </Button>
      } />
      
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>
            Review your selected reservations before proceeding to checkout.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-hidden mt-6 flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground pt-12">
                <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
                <p>Your cart is empty.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium leading-none capitalize">{item.productType}</p>
                      <p className="text-sm text-muted-foreground">ID: {item.productId.substring(0, 8)}...</p>
                      <p className="text-sm font-semibold">${item.price} x {item.quantity}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.productId)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        
        <div className="pt-6">
          <Separator className="mb-4" />
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span>${getTotalPrice()}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={clearCart} disabled={items.length === 0}>
              Clear Cart
            </Button>
            <Button onClick={handleCheckout} disabled={items.length === 0}>
              Checkout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
