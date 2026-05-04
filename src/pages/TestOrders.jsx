import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import useStore from '../store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const statusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed': return 'success';
    case 'in progress': return 'info';
    case 'processing': return 'processing';
    default: return 'secondary';
  }
};

const TestOrders = () => {
  const navigate = useNavigate();
  const testOrders = useStore((state) => state.testOrders);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = testOrders.filter(order => {
    const q = searchTerm.toLowerCase();
    return order.patientName.toLowerCase().includes(q) || order.id.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Test Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">{testOrders.length} total orders</p>
        </div>
        <Button onClick={() => navigate('/test-orders/new')}>
          <Plus size={16} />
          New Order
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search by patient name or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Patient ID</TableHead>
                <TableHead>Physician</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Specimen</TableHead>
                <TableHead>Test</TableHead>
                <TableHead>Collection Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/test-orders/${order.id}`)}
                  >
                    <TableCell className="font-medium text-blue-600">{order.id}</TableCell>
                    <TableCell className="font-medium">{order.patientName}</TableCell>
                    <TableCell className="text-muted-foreground">{order.patientID}</TableCell>
                    <TableCell>{order.physicianName}</TableCell>
                    <TableCell>{order.hospitalName}</TableCell>
                    <TableCell>{order.specimenType}</TableCell>
                    <TableCell>{order.testName}</TableCell>
                    <TableCell>{new Date(order.collectionDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                    No test orders found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestOrders;
