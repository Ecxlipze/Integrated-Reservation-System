'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Page } from '@/components/broadsheet/Page';
import { Kicker } from '@/components/broadsheet';
import { useToast } from '@/hooks/use-toast';

type InventoryItem = {
  _id: string;
  productType?: string;
  name?: string;
  airline?: string;
  flightNumber?: string;
  operator?: string;
  price?: number;
  basePrice?: number;
  availableRooms?: number;
  totalRooms?: number;
};

type Booking = {
  _id: string;
  productType?: string;
  productName?: string;
  quantity?: number;
  price?: number;
  status?: string;
  guestName?: string;
  bookingDates?: { checkIn?: string; checkOut?: string };
};

export default function SupplierPanelPage() {
  const { token, user } = useAuthStore();
  const { toast } = useToast();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingInv, setIsLoadingInv] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  const fetchInventory = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(
        'http://localhost:5000/api/v1/supplier/inventory',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setInventory(data.inventory || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingInv(false);
    }
  }, [token]);

  const fetchBookings = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/v1/supplier/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingBookings(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInventory();
    fetchBookings();
  }, [fetchInventory, fetchBookings]);

  const confirmBooking = async (orderItemId: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/v1/supplier/bookings/${orderItemId}/confirm`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to confirm booking');

      toast({
        title: 'Booking confirmed',
        description: 'The guest has been issued a voucher.',
      });
      fetchBookings();
    } catch (error) {
      toast({
        title: 'Could not confirm',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  // The stat row is derived from the two lists already fetched — there is no
  // dedicated stats endpoint.
  const pending = bookings.filter((b) => b.status === 'pending_supplier');
  const roomsLive = inventory.reduce(
    (sum, item) => sum + (item.availableRooms ?? 0),
    0
  );
  const totalRooms = inventory.reduce(
    (sum, item) => sum + (item.totalRooms ?? item.availableRooms ?? 0),
    0
  );
  const occupancy =
    totalRooms > 0
      ? Math.round(((totalRooms - roomsLive) / totalRooms) * 100)
      : 0;

  const company =
    user ? `${user.firstName} ${user.lastName}`.trim() : 'Your company';

  return (
    <Page>
      <div className="pt-[30px]">
        <Tabs defaultValue="inventory">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Kicker>Supplier · {company}</Kicker>
              <h1 className="mt-1 text-[44px] tracking-[-0.015em]">
                Operations
              </h1>
            </div>
            <TabsList>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="bookings">Booking queue</TabsTrigger>
            </TabsList>
          </div>

          {/* Stat row — no KPI cards. */}
          <div className="mb-[34px] grid grid-cols-2 gap-[34px] md:grid-cols-3">
            <Stat
              label="Rooms live"
              value={String(roomsLive)}
              note={`Across ${inventory.length} ${
                inventory.length === 1 ? 'property' : 'properties'
              }`}
            />
            <Stat
              label="Occupancy"
              value={`${occupancy}%`}
              note="Next 30 nights"
            />
            <Stat
              label="Awaiting confirmation"
              value={String(pending.length)}
              note={
                pending.length > 0
                  ? 'Oldest is waiting on you'
                  : 'Queue is clear'
              }
            />
          </div>

          <TabsContent value="inventory">
            {isLoadingInv ? (
              <p className="text-[15px] text-ink-700">Loading…</p>
            ) : inventory.length === 0 ? (
              <p className="text-[15px] text-ink-700">
                No inventory yet. Add a property to start taking reservations.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rooms</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-semibold">
                        {item.name ??
                          (item.airline
                            ? `${item.airline} ${item.flightNumber}`
                            : item.operator) ??
                          '—'}
                      </TableCell>
                      <TableCell className="capitalize">
                        {item.productType ?? 'hotel'}
                      </TableCell>
                      <TableCell>{item.availableRooms ?? '—'}</TableCell>
                      <TableCell>
                        ${item.price ?? item.basePrice ?? 0}
                      </TableCell>
                      <TableCell>
                        {item.totalRooms && item.availableRooms !== undefined
                          ? `${Math.round(
                              ((item.totalRooms - item.availableRooms) /
                                item.totalRooms) *
                                100
                            )}%`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge>Active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Edit rates
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="bookings">
            {isLoadingBookings ? (
              <p className="text-[15px] text-ink-700">Loading…</p>
            ) : bookings.length === 0 ? (
              <p className="text-[15px] text-ink-700">
                Nothing in the queue. Confirmed reservations move to your
                ledger.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => {
                    const isPending = booking.status === 'pending_supplier';
                    return (
                      <TableRow key={booking._id}>
                        <TableCell className="font-mono text-xs text-ink-600">
                          {booking._id.substring(0, 8)}
                        </TableCell>
                        <TableCell className="font-semibold capitalize">
                          {booking.productName ?? booking.productType ?? '—'}
                        </TableCell>
                        <TableCell>{booking.guestName ?? '—'}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {booking.bookingDates?.checkIn
                            ? `${booking.bookingDates.checkIn} – ${booking.bookingDates.checkOut}`
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          ${booking.price ?? 0}
                        </TableCell>
                        <TableCell>
                          {isPending ? (
                            <Badge variant="destructive">Pending</Badge>
                          ) : (
                            <Badge variant="secondary">
                              {booking.status ?? 'Confirmed'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {isPending ? (
                            <Button
                              size="sm"
                              onClick={() => confirmBooking(booking._id)}
                            >
                              Confirm
                            </Button>
                          ) : (
                            <span className="text-sm text-ink-600">
                              Confirmed
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Page>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[11.5px] tracking-[0.09em] uppercase text-ink-600">
        {label}
      </div>
      <div className="text-[36px] leading-none font-semibold">{value}</div>
      <div className="mt-1 text-[12.5px] text-ink-600">{note}</div>
    </div>
  );
}
