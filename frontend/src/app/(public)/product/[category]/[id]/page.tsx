'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore, type CartItem } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Page } from '@/components/broadsheet/Page';
import { Kicker, Plate, SectionLabel } from '@/components/broadsheet';
import { useToast } from '@/hooks/use-toast';

type Product = {
  _id: string;
  name?: string;
  airline?: string;
  flightNumber?: string;
  operator?: string;
  busType?: string;
  destination?: string;
  price?: number;
  basePrice?: number;
  rating?: number;
  reviewCount?: number;
  description?: string;
  amenities?: string[];
  availableRooms?: number;
  location?: { city?: string; country?: string };
  supplierId?: { firstName?: string; lastName?: string; companyName?: string };
};

/**
 * The room table. Rates are derived from the property's base rate — the search
 * API returns one price per property, not a room breakdown.
 * TODO(api): replace with real room inventory when the endpoint exists.
 */
function roomsFor(base: number) {
  return [
    {
      name: 'Standard Queen',
      sleeps: 2,
      board: 'Room only',
      cancel: 'Free to 48h',
      price: base,
    },
    {
      name: 'Garden Twin',
      sleeps: 2,
      board: 'Breakfast',
      cancel: 'Free to 48h',
      price: base + 22,
    },
    {
      name: 'Corner Suite',
      sleeps: 3,
      board: 'Breakfast',
      cancel: 'Non-refundable',
      price: base + 84,
    },
  ];
}

const NIGHTS = 4;

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const category = params.category as string;
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/v1/search/${category}/${id}`
        );
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

  const price = product?.price ?? product?.basePrice ?? 0;

  const addToCart = (unitPrice: number) => {
    if (!product) return;
    addItem({
      productId: product._id,
      productType: category as CartItem['productType'],
      quantity: 1,
      price: unitPrice,
    });
    toast({
      title: 'Added to cart',
      description: 'Held for 20 minutes. Rates are not guaranteed after that.',
    });
  };

  if (isLoading) {
    return (
      <Page>
        <p className="pt-[30px] text-[15px] text-ink-700">Loading…</p>
      </Page>
    );
  }

  if (!product) {
    return (
      <Page>
        <div className="pt-[30px]">
          <h1 className="mb-2.5 text-[44px] tracking-[-0.015em]">
            Property not found
          </h1>
          <Button variant="secondary" onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </Page>
    );
  }

  const title =
    category === 'hotel'
      ? product.name
      : category === 'flight'
        ? `${product.airline} (${product.flightNumber})`
        : category === 'bus'
          ? `${product.operator} — ${product.busType}`
          : product.name;

  const city = product.location?.city ?? product.destination ?? '';
  const place = [product.location?.city, product.location?.country]
    .filter(Boolean)
    .join(', ');
  const supplier =
    product.supplierId?.companyName ??
    [product.supplierId?.firstName, product.supplierId?.lastName]
      .filter(Boolean)
      .join(' ');

  return (
    <Page>
      <div className="pt-[26px]">
        <Button
          variant="ghost"
          className="-ml-[5px] px-[5px]"
          onClick={() => router.push('/search')}
        >
          ← All hotels{city ? ` in ${city}` : ''}
        </Button>

        <div className="grid gap-[46px] pt-3.5 md:grid-cols-[1fr_300px]">
          <div>
            <Kicker className="mb-2">
              {category} {city ? `· ${city}` : ''}
            </Kicker>
            <h1 className="mb-2.5 text-[58px] leading-[0.98] tracking-[-0.02em]">
              {title}
            </h1>
            <p className="mb-[22px] text-[18px] italic text-ink-700">
              {place}
              {product.rating ? ` · ${product.rating}` : ''}
              {product.reviewCount ? ` from ${product.reviewCount} reviews` : ''}
            </p>

            <Plate
              label="Photograph — plate"
              className="mb-2 h-[320px] p-3"
            />
            <div className="mb-7 grid grid-cols-3 gap-2">
              <Plate className="h-[92px]" />
              <Plate className="h-[92px]" />
              <Plate className="h-[92px]" />
            </div>

            {product.description ? (
              <p className="mb-[30px] max-w-[60ch] text-[18px] leading-[1.55] text-pretty">
                {product.description}
              </p>
            ) : null}

            <SectionLabel className="mb-3">Rooms</SectionLabel>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Sleeps</TableHead>
                  <TableHead>Board</TableHead>
                  <TableHead>Cancellation</TableHead>
                  <TableHead className="text-right">Per night</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomsFor(price).map((room) => (
                  <TableRow key={room.name}>
                    <TableCell className="font-semibold">{room.name}</TableCell>
                    <TableCell>{room.sleeps}</TableCell>
                    <TableCell>{room.board}</TableCell>
                    <TableCell>{room.cancel}</TableCell>
                    <TableCell className="text-right text-[17px]">
                      ${room.price}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => addToCart(room.price)}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {product.amenities?.length ? (
              <>
                <SectionLabel className="mt-[34px] mb-3">
                  Amenities
                </SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {product.amenities.map((amenity) => (
                    <Badge key={amenity}>{amenity}</Badge>
                  ))}
                </div>
              </>
            ) : null}

            <SectionLabel className="mt-[34px] mb-3">House rules</SectionLabel>
            <dl className="grid max-w-[640px] grid-cols-1 gap-x-10 gap-y-[18px] text-[14.5px] sm:grid-cols-2">
              <Rule label="Check in" value="From 15:00" />
              <Rule label="Check out" value="Until 11:00" />
              <Rule label="Cancellation" value="Free until 48h before arrival" />
              <Rule label="Supplier" value={supplier || '—'} />
            </dl>
          </div>

          {/* Your stay */}
          <aside className="self-start border-l border-border pl-[22px] md:sticky md:top-20">
            <div className="flex flex-col gap-3.5">
              <Kicker tone="muted">Your stay</Kicker>
              <div className="text-[15px]">
                14–18 September · {NIGHTS} nights
                <br />2 adults · 1 room
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[46px] leading-[0.9] font-semibold">
                  ${price}
                </span>
                <span className="text-[13px] text-ink-600">per night</span>
              </div>
              <div className="text-sm text-ink-700">
                ${price * NIGHTS} total including tax
              </div>
              <Button className="w-full" onClick={() => addToCart(price)}>
                Add to cart
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  addToCart(price);
                  router.push('/checkout');
                }}
              >
                Reserve now
              </Button>
              <p className="mt-1.5 text-[12.5px] leading-[1.45] text-ink-600">
                Free cancellation until 12 September. No card charged today.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </Page>
  );
}

function Rule({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-600">{label}</dt>
      <dd className="m-0">{value}</dd>
    </div>
  );
}
