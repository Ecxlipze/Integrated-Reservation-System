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
import { SectionLabel, Standfirst } from '@/components/broadsheet';
import { PlateNumeral } from '@/components/broadsheet/PlateNumeral';
import { useToast } from '@/hooks/use-toast';

type SupplierBooking = {
  supplierId: string;
  supplierName?: string;
  totalBookings: number;
};

type Analytics = {
  gmv?: number;
  totalOrders?: number;
  walletLiabilities?: number;
  supplierBookings?: SupplierBooking[];
};

type Supplier = {
  _id: string;
  name?: string;
  status?: string;
  companyDetails?: { registrationNumber?: string; propertyCount?: number };
};

/**
 * Coupon liability. GET /admin/analytics does not return coupon aggregates and
 * there is no coupon-reporting endpoint, so this is seeded.
 * TODO(api): back with a real aggregate over the Coupon model.
 */
const COUPON_LIABILITY = [
  { code: 'SUMMER15', rule: '15% off, max $60', redeemed: 412, liability: '$18,240' },
  { code: 'WELCOME20', rule: '$20 off first stay', redeemed: 1108, liability: '$22,160' },
  { code: 'REFER20', rule: '$20 referral credit', redeemed: 264, liability: '$5,280' },
  { code: 'CITYBREAK', rule: '10% off, city hotels', redeemed: 97, liability: '$3,410' },
];

export default function AdminConsolePage() {
  const { token } = useAuthStore();
  const { toast } = useToast();

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [reportWindow, setReportWindow] = useState('');

  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/v1/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [token]);

  const fetchSuppliers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/v1/admin/suppliers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSuppliers(data.suppliers || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingSuppliers(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAnalytics();
    fetchSuppliers();
  }, [fetchAnalytics, fetchSuppliers]);

  // Formatted client-side after mount: the standfirst names today's date, and
  // rendering it during SSR would disagree with the client.
  useEffect(() => {
    setReportWindow(
      new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date())
    );
  }, []);

  const approveSupplier = async (supplierId: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/v1/admin/suppliers/${supplierId}/approve`,
        { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to approve supplier');

      toast({
        title: 'Supplier approved',
        description: 'Their inventory is now live.',
      });
      fetchSuppliers();
    } catch (error) {
      toast({
        title: 'Could not approve',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  const bookings = analytics?.supplierBookings ?? [];
  const leader = Math.max(1, ...bookings.map((b) => b.totalBookings));

  return (
    <Page>
      <div className="pt-[30px]">
        <Tabs defaultValue="analytics">
          <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-[44px] tracking-[-0.015em]">Admin console</h1>
            <TabsList>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            </TabsList>
          </div>
          <Standfirst className="mb-[30px]">
            Trailing thirty days{reportWindow ? ` to ${reportWindow}` : ''}.
          </Standfirst>

          <TabsContent value="analytics">
            {isLoadingAnalytics ? (
              <p className="text-[15px] text-ink-700">Loading…</p>
            ) : (
              <>
                {/* KPIs as plate numerals — no cards. */}
                <div className="mb-10 grid grid-cols-1 gap-[34px] sm:grid-cols-2 md:grid-cols-3">
                  <Kpi
                    label="GMV"
                    value={`$${(analytics?.gmv ?? 0).toLocaleString()}`}
                    note="Gross merchandise value, all products"
                  />
                  <Kpi
                    label="Total orders"
                    value={(analytics?.totalOrders ?? 0).toLocaleString()}
                    note="Confirmed and paid"
                  />
                  <Kpi
                    label="Wallet liabilities"
                    value={`$${(
                      analytics?.walletLiabilities ?? 0
                    ).toLocaleString()}`}
                    note="Outstanding internal credit"
                  />
                </div>

                <div className="grid gap-[46px] md:grid-cols-2">
                  <div>
                    <SectionLabel className="mb-3">
                      Bookings by supplier
                    </SectionLabel>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Supplier</TableHead>
                          <TableHead className="text-right">Bookings</TableHead>
                          <TableHead className="w-[45%]" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((sb) => (
                          <TableRow key={sb.supplierId}>
                            <TableCell className="font-semibold">
                              {sb.supplierName || 'Unknown'}
                            </TableCell>
                            <TableCell className="text-right">
                              {sb.totalBookings}
                            </TableCell>
                            <TableCell>
                              <div
                                className="h-[9px] bg-primary"
                                style={{
                                  width: `${(sb.totalBookings / leader) * 100}%`,
                                }}
                                role="presentation"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        {bookings.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-ink-700"
                            >
                              No bookings in this window.
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <SectionLabel className="mb-3">
                      Coupon liability
                    </SectionLabel>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Rule</TableHead>
                          <TableHead className="text-right">Redeemed</TableHead>
                          <TableHead className="text-right">
                            Liability
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {COUPON_LIABILITY.map((coupon) => (
                          <TableRow key={coupon.code}>
                            <TableCell className="font-mono text-[12.5px]">
                              {coupon.code}
                            </TableCell>
                            <TableCell className="text-[13px] text-ink-700">
                              {coupon.rule}
                            </TableCell>
                            <TableCell className="text-right">
                              {coupon.redeemed}
                            </TableCell>
                            <TableCell className="text-right">
                              {coupon.liability}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="suppliers">
            {isLoadingSuppliers ? (
              <p className="text-[15px] text-ink-700">Loading…</p>
            ) : suppliers.length === 0 ? (
              <p className="text-[15px] text-ink-700">
                No suppliers registered yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier._id}>
                      <TableCell className="font-semibold">
                        {supplier.name}
                      </TableCell>
                      <TableCell className="font-mono text-[12.5px] text-ink-700">
                        {supplier.companyDetails?.registrationNumber || '—'}
                      </TableCell>
                      <TableCell>
                        {supplier.companyDetails?.propertyCount ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            supplier.status === 'active'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {supplier.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {supplier.status === 'pending' ? (
                          <Button
                            size="sm"
                            onClick={() => approveSupplier(supplier._id)}
                          >
                            Approve
                          </Button>
                        ) : (
                          <span className="text-sm text-ink-600">Active</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Page>
  );
}

function Kpi({
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
      <div className="mb-2.5 text-[11.5px] tracking-[0.09em] uppercase text-ink-600">
        {label}
      </div>
      <PlateNumeral className="text-[54px]">{value}</PlateNumeral>
      <div className="mt-3 text-[12.5px] text-ink-600">{note}</div>
    </div>
  );
}
