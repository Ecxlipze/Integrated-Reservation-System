'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const { toast } = useToast();
  
  const category = params.category as string;
  const id = params.id as string;
  
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/v1/search/${category}/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        setProduct(data.product);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (category && id) fetchProduct();
  }, [category, id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const price = product.price || product.basePrice || 0;
    
    addItem({
      productId: product._id,
      productType: category as any,
      quantity: 1,
      price: price
    });
    
    toast({
      title: "Added to Cart",
      description: "Item has been successfully added to your cart.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-12 text-center text-muted-foreground">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Button onClick={() => router.back()} variant="outline">Go Back</Button>
      </div>
    );
  }

  const title = category === 'hotel' ? product.name :
                category === 'flight' ? `${product.airline} (${product.flightNumber})` :
                category === 'bus' ? `${product.operator} - ${product.busType}` :
                category === 'tour' ? product.name : 'Unknown Product';
                
  const price = product.price || product.basePrice || 0;

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-4 text-muted-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-64 md:h-96 bg-muted rounded-xl flex items-center justify-center overflow-hidden">
          <span className="text-muted-foreground">Main Image Placeholder</span>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-3xl font-bold">{title}</h1>
              <Badge variant="default" className="text-lg py-1">${price}</Badge>
            </div>
            
            <p className="text-muted-foreground text-lg">
              {category === 'hotel' && `${product.location.city}, ${product.location.country}`}
              {category === 'flight' && `${product.departure.airportCode} ➔ ${product.arrival.airportCode}`}
              {category === 'bus' && `${product.departure.city} ➔ ${product.arrival.city}`}
              {category === 'tour' && product.destination}
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {category === 'hotel' && (
                <>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Available Rooms</span>
                    <span className="font-medium">{product.availableRooms}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Amenities</span>
                    <span className="font-medium text-right">{product.amenities?.join(', ')}</span>
                  </div>
                </>
              )}
              {category === 'flight' && (
                <>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Departure Time</span>
                    <span className="font-medium">{new Date(product.departure.time).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Arrival Time</span>
                    <span className="font-medium">{new Date(product.arrival.time).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Available Seats</span>
                    <span className="font-medium">{product.availableSeats}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between pt-2">
                <span className="text-muted-foreground">Supplier</span>
                <span className="font-medium">{product.supplierId?.firstName} {product.supplierId?.lastName}</span>
              </div>
            </CardContent>
          </Card>
          
          <Button onClick={handleAddToCart} size="lg" className="w-full h-14 text-lg">
            <ShoppingCart className="mr-2 h-6 w-6" /> Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
