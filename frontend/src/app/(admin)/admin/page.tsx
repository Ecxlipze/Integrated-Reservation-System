'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, LineChart, Users, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminConsolePage() {
  const { token } = useAuthStore();
  const { toast } = useToast();
  
  const [analytics, setAnalytics] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);

  const fetchAnalytics = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/v1/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const fetchSuppliers = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/v1/admin/suppliers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSuppliers(data.suppliers || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchSuppliers();
  }, [token]);

  const approveSupplier = async (supplierId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/admin/suppliers/${supplierId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to approve supplier');
      
      toast({ title: 'Supplier Approved', description: 'Supplier status has been updated to active.' });
      fetchSuppliers(); // Refresh
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
      
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="analytics"><LineChart className="w-4 h-4 mr-2" /> Analytics</TabsTrigger>
          <TabsTrigger value="suppliers"><Users className="w-4 h-4 mr-2" /> Suppliers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="mt-6 space-y-6">
          {isLoadingAnalytics ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Gross Merchandise Value (GMV)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">${analytics?.gmv?.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total revenue processed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{analytics?.totalOrders || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Confirmed & Paid</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Wallet Liabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">${analytics?.walletLiabilities?.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Outstanding internal credits</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Supplier Booking Overview</CardTitle>
                  <CardDescription>Total bookings confirmed per supplier</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Supplier Name</TableHead>
                        <TableHead>Total Bookings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics?.supplierBookings?.map((sb: any) => (
                        <TableRow key={sb.supplierId}>
                          <TableCell className="font-medium">{sb.supplierName || 'Unknown'}</TableCell>
                          <TableCell>{sb.totalBookings}</TableCell>
                        </TableRow>
                      ))}
                      {!analytics?.supplierBookings?.length && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-muted-foreground py-4">No data available.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="suppliers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Approvals</CardTitle>
              <CardDescription>Manage supplier registrations and statuses.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSuppliers ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
              ) : suppliers.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">No suppliers registered.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier._id}>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell>{supplier.companyDetails?.registrationNumber || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                            {supplier.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {supplier.status === 'pending' ? (
                            <Button size="sm" onClick={() => approveSupplier(supplier._id)}>
                              <CheckCircle className="w-4 h-4 mr-1" /> Approve
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1 text-green-500" /> Active
                            </span>
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
