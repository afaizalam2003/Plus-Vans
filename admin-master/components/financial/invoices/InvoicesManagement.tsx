import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, FileText, Download, Printer, Mail, CheckCircle, RefreshCw, Database } from 'lucide-react';
import { PayNowButton } from '@/components/financial/PayNowButton';
import { toast } from '@/components/ui/use-toast';
import { useFinancialInvoices, type NormalizedInvoice } from '@/components/hooks/useFinancialInvoices';
import { format } from 'date-fns';
import { AutomaticInvoiceService } from '../AutomaticInvoiceService';
import { AutomaticInvoiceGenerator, type InvoiceData } from '../AutomaticInvoiceGenerator';
import { BookingInvoiceMigration } from '../BookingInvoiceMigration';

const InvoicesManagement = () => {
  const { data: invoices = [], isLoading, error } = useFinancialInvoices();
  const [bookingInvoices, setBookingInvoices] = useState<InvoiceData[]>([]);
  const [loadingBookingInvoices, setLoadingBookingInvoices] = useState(false);
  const [showMigration, setShowMigration] = useState(false);

  // Load booking-generated invoices
  useEffect(() => {
    const loadBookingInvoices = async () => {
      setLoadingBookingInvoices(true);
      try {
        const invoices = await AutomaticInvoiceService.getAllBookingInvoices();
        setBookingInvoices(invoices);
      } catch (error) {
        console.error('Error loading booking invoices:', error);
      } finally {
        setLoadingBookingInvoices(false);
      }
    };

    loadBookingInvoices();
  }, []);

  const handleDownloadInvoice = (invoice: InvoiceData) => {
    try {
      AutomaticInvoiceGenerator.downloadInvoiceHTML(invoice);
      toast({
        title: 'Invoice Downloaded',
        description: `Invoice ${invoice.invoice_number} has been downloaded.`,
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download invoice.',
        variant: 'destructive',
      });
    }
  };

  const handlePrintInvoice = (invoice: InvoiceData) => {
    try {
      AutomaticInvoiceGenerator.printInvoice(invoice);
      toast({
        title: 'Printing Invoice',
        description: `Sending invoice ${invoice.invoice_number} to printer.`,
      });
    } catch (error) {
      console.error('Error printing invoice:', error);
      toast({
        title: 'Print Failed',
        description: 'Failed to print invoice.',
        variant: 'destructive',
      });
    }
  };

  const refreshBookingInvoices = async () => {
    setLoadingBookingInvoices(true);
    try {
      const invoices = await AutomaticInvoiceService.getAllBookingInvoices();
      setBookingInvoices(invoices);
      toast({
        title: 'Invoices Refreshed',
        description: 'Booking invoices have been updated.',
      });
    } catch (error) {
      console.error('Error refreshing booking invoices:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh invoices.',
        variant: 'destructive',
      });
    } finally {
      setLoadingBookingInvoices(false);
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      overdue: { label: 'Overdue', className: 'bg-red-100 text-red-800' },
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
      sent: { label: 'Sent', className: 'bg-blue-100 text-blue-800' },
    };

    const statusConfig = statusMap[status] || { label: status, className: 'bg-gray-100' };
    
    return (
      <Badge className={statusConfig.className}>
        {statusConfig.label}
      </Badge>
    );
  };

  // Debug: Log the raw data
  React.useEffect(() => {
    if (invoices && invoices.length > 0) {
      console.log('Invoices data:', invoices);
      console.log('First invoice:', invoices[0]);
      console.log('First invoice status:', invoices[0]?.status);
    } else {
      console.log('No invoices found or still loading...');
    }
  }, [invoices]);

  if (isLoading) {
    return <div>Loading invoices...</div>;
  }

  if (error) {
    return <div>Error loading invoices: {error.message}</div>;
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No invoices found</h3>
        <p className="text-sm text-gray-500">Get started by creating a new invoice</p>
      </div>
    );
  }

  // Debug log with more details
  console.log('=== INVOICES DATA ===');
  console.log('Number of invoices:', invoices.length);
  invoices.forEach((invoice, index) => {
    console.log(`Invoice ${index + 1}:`, {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      status: invoice.status,
      amount: invoice.total_amount,
      customer_name: invoice.customer_name,
      due_date: invoice.due_date
    });
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      overdue: { label: 'Overdue', className: 'bg-red-100 text-red-800' },
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
      sent: { label: 'Sent', className: 'bg-blue-100 text-blue-800' },
    };

    const statusConfig = statusMap[status] || { label: status, className: 'bg-gray-100' };
    
    return (
      <Badge className={statusConfig.className}>
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Invoices</h2>
          <p className="text-muted-foreground">
            Manage all invoices including automatically generated booking invoices
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowMigration(!showMigration)}
            variant="outline"
            size="sm"
          >
            <Database className="h-4 w-4 mr-2" />
            {showMigration ? 'Hide' : 'Show'} Migration
          </Button>
          <Button 
            onClick={refreshBookingInvoices}
            disabled={loadingBookingInvoices}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingBookingInvoices ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Migration Component */}
      {showMigration && (
        <div className="mb-6">
          <BookingInvoiceMigration />
        </div>
      )}

      {/* Booking Invoices Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Booking Invoices ({bookingInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingBookingInvoices ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Loading booking invoices...</p>
            </div>
          ) : bookingInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No booking invoices found</h3>
              <p className="text-sm text-gray-500">Run the migration to generate invoices for existing bookings</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service Address</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.customer_name}</div>
                        <div className="text-sm text-muted-foreground">{invoice.customer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {invoice.service_address}
                    </TableCell>
                    <TableCell>
                      £{invoice.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {getInvoiceStatusBadge(invoice.status)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.due_date), 'PPP')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadInvoice(invoice)}
                          title="Download Invoice"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePrintInvoice(invoice)}
                          title="Print Invoice"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        {(invoice.status === 'sent' || invoice.status === 'draft') && (
                          <PayNowButton 
                            amount={invoice.total_amount}
                            invoiceId={invoice.id}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default InvoicesManagement;
