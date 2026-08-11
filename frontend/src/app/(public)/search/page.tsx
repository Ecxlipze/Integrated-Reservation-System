'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Page } from '@/components/broadsheet/Page';
import { Kicker, Plate, Standfirst } from '@/components/broadsheet';

type SearchResult = {
  _id: string;
  name?: string;
  price?: number;
  basePrice?: number;
  rating?: number;
  reviewCount?: number;
  description?: string;
  amenities?: string[];
  location?: { city?: string; country?: string };
};

const BOARD_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: 'breakfast', label: 'Breakfast included' },
  { value: 'free-cancellation', label: 'Free cancellation' },
];

// useSearchParams() opts the subtree out of prerendering, so it has to sit
// inside a Suspense boundary for the page to build.
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <Page>
          <p className="pt-[30px] text-[15px] text-ink-700">Loading…</p>
        </Page>
      }
    >
      <SearchResults />
    </Suspense>
  );
}

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get('category') || 'hotel';
  const [destination, setDestination] = useState('Lisbon, Portugal');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2 adults, 1 room');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [board, setBoard] = useState('any');
  const [sort, setSort] = useState('recommended');

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResults = useCallback(
    async (cat: string, min?: string, max?: string) => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({ category: cat });
        if (min) query.append('minPrice', min);
        if (max) query.append('maxPrice', max);

        const res = await fetch(
          `http://localhost:5000/api/v1/search?${query.toString()}`
        );
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setResults(data.data || []);
      } catch (error) {
        console.error(error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchResults(category, minPrice, maxPrice);
    // Refetch on category change only; the rail applies explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/search?category=${category}&minPrice=${minPrice}&maxPrice=${maxPrice}`
    );
    fetchResults(category, minPrice, maxPrice);
  };

  const sorted = [...results].sort((a, b) => {
    const priceOf = (r: SearchResult) => r.price ?? r.basePrice ?? 0;
    if (sort === 'price') return priceOf(a) - priceOf(b);
    if (sort === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
    return 0;
  });

  const city = destination.split(',')[0]?.trim() || 'Lisbon';

  return (
    <Page>
      <div className="grid gap-10 pt-[30px] md:grid-cols-[250px_1fr]">
        {/* Refine rail */}
        <aside>
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <Kicker>Refine</Kicker>

            <Field label="Destination">
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Check in">
                <Input
                  value={checkIn}
                  placeholder="14 Sep"
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </Field>
              <Field label="Check out">
                <Input
                  value={checkOut}
                  placeholder="18 Sep"
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </Field>
            </div>

            <Field label="Guests">
              <Input
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Min price">
                <Input
                  type="number"
                  value={minPrice}
                  placeholder="0"
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </Field>
              <Field label="Max price">
                <Input
                  type="number"
                  value={maxPrice}
                  placeholder="400"
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </Field>
            </div>

            <fieldset className="border-0 p-0">
              <legend className="mb-2 text-xs text-ink-700">Board</legend>
              <div className="flex flex-col gap-[7px]">
                {BOARD_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="board"
                      value={option.value}
                      checked={board === option.value}
                      onChange={() => setBoard(option.value)}
                      className="size-4 shrink-0 accent-primary"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <Button type="submit" className="w-full">
              Apply
            </Button>
          </form>
        </aside>

        {/* Results */}
        <main>
          <div className="mb-1.5 flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-[44px] leading-[1.02] tracking-[-0.015em]">
              Hotels in {city}
            </h1>
            <Tabs value={sort} onValueChange={(v) => setSort(v as string)}>
              <TabsList>
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                <TabsTrigger value="price">Price</TabsTrigger>
                <TabsTrigger value="rating">Rating</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Standfirst className="mb-[26px]">
            {isLoading
              ? 'Searching…'
              : `${sorted.length} ${
                  sorted.length === 1 ? 'property' : 'properties'
                }, ${guests}. Prices are per night including tax.`}
          </Standfirst>

          {!isLoading && sorted.length === 0 ? (
            <p className="border-t border-border pt-[22px] text-[15px] text-ink-700">
              No properties match those filters. Widen the price range or clear
              the board filter.
            </p>
          ) : null}

          {sorted.map((item) => {
            const price = item.price ?? item.basePrice ?? 0;
            return (
              <article
                key={item._id}
                onClick={() => router.push(`/product/${category}/${item._id}`)}
                className="grid cursor-pointer grid-cols-1 gap-[22px] border-t border-border py-[22px] md:grid-cols-[180px_1fr_160px]"
              >
                <Plate label="Plate" className="h-[130px]" />

                <div>
                  <div className="flex flex-wrap items-baseline gap-2.5">
                    <h2 className="text-[26px] leading-[1.1]">{item.name}</h2>
                    {item.rating ? (
                      <span className="text-[13px] text-cyan-700">
                        {item.rating}
                      </span>
                    ) : null}
                    {item.reviewCount ? (
                      <span className="text-[13px] text-ink-600">
                        {item.reviewCount} reviews
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 text-[15px] italic text-ink-700">
                    {[item.location?.city, item.location?.country]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                  {item.description ? (
                    <p className="my-2.5 max-w-[52ch] text-[14.5px] leading-[1.5] text-pretty">
                      {item.description}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-1.5">
                    {(item.amenities ?? []).slice(0, 4).map((amenity) => (
                      <Badge key={amenity} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end md:text-right">
                  <div className="text-[11px] tracking-[0.08em] uppercase text-ink-600">
                    From
                  </div>
                  <div className="text-[38px] leading-[0.9] font-semibold">
                    ${price}
                  </div>
                  <div className="text-xs text-ink-600">per night</div>
                  <Button variant="secondary" className="mt-1.5">
                    View rooms
                  </Button>
                </div>
              </article>
            );
          })}

          {sorted.length > 0 ? (
            <div className="h-px bg-border" role="presentation" />
          ) : null}
        </main>
      </div>
    </Page>
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
