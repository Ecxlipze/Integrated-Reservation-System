'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Inbox, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SupplierPanelPage() {
  const { token } = useAuthStore();
  const { toast } = useToast();
  
  const [inventory, setInventory] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingInv, setIsLoadingInv] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  const fetchInventory = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/v1/supplier/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setInventory(data.inventory || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingInv(false);
    }
  };

  const fetchBookings = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/v1/supplier/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchBookings();
  }, [token]);

  const confirmBooking = async (orderItemId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/supplier/bookings/${orderItemId}/confirm`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to confirm booking');
      
      toast({ title: 'Booking Confirmed', description: 'The booking has been successfully confirmed.' });
      fetchBookings(); // Refresh the list
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Supplier Operations</h1>
      
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="inventory"><Package className="w-4 h-4 mr-2" /> Inventory</TabsTrigger>
          <TabsTrigger value="bookings"><Inbox className="w-4 h-4 mr-2" /> Booking Queue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>View and manage your active products.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingInv ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
              ) : inventory.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">No inventory found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-mono text-xs">{item._id.substring(0, 8)}</TableCell>
                        <TableCell className="capitalize">{item.productType}</TableCell>
                        <TableCell>
                          {item.productType === 'hotel' ? item.name :
                           item.productType === 'flight' ? `${item.airline} ${item.flightNumber}` : 
                           item.productType === 'tour' ? item.name : `${item.operator}`}
                        </TableCell>
                        <TableCell>${item.price || item.basePrice || 0}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600 bg-green-50">Active</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bookings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Bookings</CardTitle>
              <CardDescription>Review and confirm incoming reservations.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBookings ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
              ) : bookings.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">No bookings found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Product Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell className="font-mono text-xs">{booking._id.substring(0, 8)}</TableCell>
                        <TableCell className="capitalize">{booking.productType}</TableCell>
                        <TableCell>{booking.quantity}</TableCell>
                        <TableCell>${booking.price}</TableCell>
                        <TableCell>
                          <Badge variant={booking.status === 'pending_supplier' ? 'secondary' : 'outline'}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {booking.status === 'pending_supplier' ? (
                            <Button size="sm" onClick={() => confirmBooking(booking._id)}>
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Confirm
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">Confirmed</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
