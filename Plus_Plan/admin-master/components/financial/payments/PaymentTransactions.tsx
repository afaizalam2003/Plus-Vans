import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, FileText, MoreHorizontal, Download, Plus } from 'lucide-react';

const PaymentTransactions = () => {
  // Mock data - replace with real data from your API
  const payments = [
    { id: 'PAY-001', invoice: 'INV-001', amount: 1200, method: 'Credit Card', status: 'completed', date: '2023-06-10' },
    { id: 'PAY-002', invoice: 'INV-002', amount: 850, method: 'Bank Transfer', status: 'pending', date: '2023-06-12' },
    { id: 'PAY-003', invoice: 'INV-003', amount: 2350, method: 'PayPal', status: 'completed', date: '2023-06-15' },
    { id: 'PAY-004', invoice: 'INV-004', amount: 1750, method: 'Credit Card', status: 'failed', date: '2023-06-18' },
    { id: 'PAY-005', invoice: 'INV-005', amount: 3200, method: 'Bank Transfer', status: 'completed', date: '2023-06-20' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'credit card':
        return <CreditCard className="h-4 w-4 mr-2" />;
      case 'bank transfer':
        return <FileText className="h-4 w-4 mr-2" />;
      default:
        return <FileText className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Payment Transactions</h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="ml-auto">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.id}</TableCell>
                <TableCell>{payment.invoice}</TableCell>
                <TableCell>${payment.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {getMethodIcon(payment.method)}
                    {payment.method}
                  </div>
                </TableCell>
                <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                <TableCell>{getStatusBadge(payment.status)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Showing <span className="font-medium">1</span> to <span className="font-medium">{payments.length}</span> of <span className="font-medium">{payments.length}</span> payments</div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentTransactions;
