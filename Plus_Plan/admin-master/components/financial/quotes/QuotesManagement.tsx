import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Download, Send, Edit, MoreHorizontal } from 'lucide-react';

const QuotesManagement = () => {
  // Mock data - replace with real data from your API
  const quotes = [
    { id: 'QT-001', customer: 'Acme Inc.', amount: 2500, status: 'draft', expiryDate: '2023-07-15' },
    { id: 'QT-002', customer: 'Globex Corp', amount: 3200, status: 'sent', expiryDate: '2023-07-20' },
    { id: 'QT-003', customer: 'Soylent Corp', amount: 1800, status: 'accepted', expiryDate: '2023-07-10' },
    { id: 'QT-004', customer: 'Initech LLC', amount: 4200, status: 'expired', expiryDate: '2023-06-30' },
    { id: 'QT-005', customer: 'Umbrella Corp', amount: 2900, status: 'sent', expiryDate: '2023-07-25' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-800">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getActionButton = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <Button variant="outline" size="sm" className="mr-2">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        );
      case 'sent':
        return (
          <Button variant="outline" size="sm" className="mr-2">
            <Send className="h-4 w-4 mr-1" />
            Resend
          </Button>
        );
      default:
        return (
          <Button variant="outline" size="sm" className="mr-2" disabled>
            View
          </Button>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Quotes</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Quote
        </Button>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell className="font-medium">{quote.id}</TableCell>
                <TableCell>{quote.customer}</TableCell>
                <TableCell>${quote.amount.toLocaleString()}</TableCell>
                <TableCell>{new Date(quote.expiryDate).toLocaleDateString()}</TableCell>
                <TableCell>{getStatusBadge(quote.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    {getActionButton(quote.status)}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Showing <span className="font-medium">1</span> to <span className="font-medium">{quotes.length}</span> of <span className="font-medium">{quotes.length}</span> quotes</div>
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

export default QuotesManagement;
