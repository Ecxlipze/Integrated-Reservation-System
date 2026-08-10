'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { CheckoutFlow } from '@/components/checkout/CheckoutFlow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { items, getTotalPrice } = useCartStore();
  const { toast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const basePrice = getTotalPrice();
  const finalPrice = Math.max(0, basePrice - discountAmount);

  if (items.length === 0) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Add some items before proceeding to checkout.</p>
        <Button onClick={() => router.push('/search')}>Browse Reservations</Button>
      </div>
    );
  }

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    if (!token) return;
    
    setIsApplyingCoupon(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          couponCode,
          cartItems: items
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid coupon');
      
      setDiscountAmount(data.discountAmount);
      toast({
        title: "Coupon Applied",
        description: `You saved $${data.discountAmount}!`,
      });
    } catch (error: any) {
      toast({
        title: "Invalid Coupon",
        description: error.message,
        variant: "destructive"
      });
      setDiscountAmount(0);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>{items.length} items in your cart</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map(item => (
                <div key={item.productId} className="flex justify-between items-start text-sm">
                  <div>
                    <p className="font-medium capitalize">{item.productType}</p>
                    <p className="text-muted-foreground">ID: {item.productId.substring(0, 8)}...</p>
                  </div>
                  <p className="font-semibold">${item.price} x {item.quantity}</p>
                </div>
              ))}
              
              <Separator className="my-4" />
              
              <div className="flex gap-2">
                <Input 
                  placeholder="Promo Code" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <Button variant="secondary" onClick={handleApplyCoupon} disabled={isApplyingCoupon || !couponCode}>
                  {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                </Button>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${basePrice}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span className="flex items-center"><Tag className="w-4 h-4 mr-1" /> Discount</span>
                    <span>-${discountAmount}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${finalPrice}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <CheckoutFlow finalPrice={finalPrice} />
        </div>
      </div>
    </div>
  );
}
