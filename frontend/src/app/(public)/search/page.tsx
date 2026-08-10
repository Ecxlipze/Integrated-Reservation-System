'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search as SearchIcon } from 'lucide-react';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [category, setCategory] = useState(searchParams.get('category') || 'hotel');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResults = async (cat: string, min?: string, max?: string) => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({ category: cat });
      if (min) query.append('minPrice', min);
      if (max) query.append('maxPrice', max);
      
      const res = await fetch(`http://localhost:5000/api/v1/search?${query.toString()}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.data || []);
    } catch (error) {
      console.error(error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(category, minPrice, maxPrice);
  }, [category]); // Fetch on mount and category change

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?category=${category}&minPrice=${minPrice}&maxPrice=${maxPrice}`);
    fetchResults(category, minPrice, maxPrice);
  };

  return (
    <div className="container py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Filters</h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={(val) => val && setCategory(val as string)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotel">Hotels</SelectItem>
                  <SelectItem value="flight">Flights</SelectItem>
                  <SelectItem value="bus">Buses</SelectItem>
                  <SelectItem value="tour">Tours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Min Price</label>
              <Input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Price</label>
              <Input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="1000" />
            </div>
            <Button type="submit" className="w-full">
              <SearchIcon className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Search Results</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No {category}s found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item) => (
              <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/product/${category}/${item._id}`)}>
                <div className="h-48 bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">Image Placeholder</span>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl line-clamp-1">
                      {category === 'hotel' && item.name}
                      {category === 'flight' && `${item.airline} (${item.flightNumber})`}
                      {category === 'bus' && `${item.operator} - ${item.busType}`}
                      {category === 'tour' && item.name}
                    </CardTitle>
                    <Badge variant="secondary">${item.price || item.basePrice || 0}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {category === 'hotel' && `${item.location.city}, ${item.location.country}`}
                    {category === 'flight' && `${item.departure.airportCode} ➔ ${item.arrival.airportCode}`}
                    {category === 'bus' && `${item.departure.city} ➔ ${item.arrival.city}`}
                    {category === 'tour' && item.destination}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full">View Details</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
