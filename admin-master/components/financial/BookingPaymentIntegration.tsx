'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CreditCard, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Download,
  Receipt,
  Eye,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useBookings, type Booking } from '@/components/hooks/useBooking';
import { PaymentMethodSelection } from './PaymentMethodSelection';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { EnhancedReceiptGenerator, type ReceiptData } from './EnhancedReceiptGenerator';
import { AutomaticInvoiceGenerator } from './AutomaticInvoiceGenerator';

interface BookingWithPayment extends Booking {
  payment_status?: 'pending' | 'paid' | 'partially_paid' | 'failed';
  payment_method?: string;
  total_amount?: number;
  stripe_payments?: any[];
  price?: number;
}

interface PaymentSummary {
  totalBookings: number;
  totalRevenue: number;
  pendingPayments: number;
  paidBookings: number;
}

const BookingPaymentIntegration: React.FC = () => {
  const { data: bookings = [], isLoading, refetch } = useBookings();
  const [selectedBooking, setSelectedBooking] = useState<BookingWithPayment | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const { toast } = useToast();

  // Calculate payment summary
  const paymentSummary: PaymentSummary = React.useMemo(() => {
    const totalBookings = bookings.length;
    const paidBookings = bookings.filter((b: BookingWithPayment) => 
      b.payment_status === 'paid' || b.status === 'completed'
    ).length;
    const pendingPayments = bookings.filter((b: BookingWithPayment) => 
      b.payment_status === 'pending' || b.status === 'confirmed' || b.status === 'pending'
    ).length;
    const totalRevenue = bookings
      .filter((b: BookingWithPayment) => b.payment_status === 'paid' || b.status === 'completed')
      .reduce((sum: number, b: BookingWithPayment) => 
        sum + (b.quote?.breakdown?.price_components?.total || b.price || 0), 0);

    return {
      totalBookings,
      totalRevenue,
      pendingPayments,
      paidBookings
    };
  }, [bookings]);

  const getPaymentStatus = (booking: BookingWithPayment): 'pending' | 'paid' | 'partially_paid' | 'failed' => {
    if (booking.payment_status) return booking.payment_status;
    if (booking.status === 'completed') return 'paid';
    if (booking.status === 'confirmed' || booking.status === 'pending') return 'pending';
    if (booking.status === 'cancelled') return 'failed';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'default';
      case 'pending':
      case 'confirmed':
        return 'secondary';
      case 'partially_paid':
        return 'default';
      case 'failed':
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handlePayNow = (booking: BookingWithPayment) => {
    setSelectedBooking(booking);
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = async (paymentDetails: any) => {
    setShowPaymentDialog(false);
    setSelectedBooking(null);
    toast({
      title: 'Payment Successful',
      description: 'Payment has been processed successfully.',
    });
    await refetch();
  };

  const generateInvoice = async (booking: BookingWithPayment) => {
    setProcessingPayment(booking.id);
    try {
      // Generate invoice using the AutomaticInvoiceGenerator
      const invoice = AutomaticInvoiceGenerator.generateInvoiceFromBooking(booking);
      
      // Save to database (in real implementation)
      const saved = await AutomaticInvoiceGenerator.saveInvoiceToDatabase(invoice);
      
      if (saved) {
        // Download the generated invoice
        AutomaticInvoiceGenerator.downloadInvoiceHTML(invoice);
        
        toast({
          title: 'Invoice Generated',
          description: `Invoice ${invoice.invoice_number} has been created and downloaded.`,
        });
      } else {
        throw new Error('Failed to save invoice');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate invoice.',
        variant: 'destructive',
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  const downloadReceipt = async (booking: BookingWithPayment) => {
    try {
      const receiptData: ReceiptData = {
        id: `receipt-${booking.id}`,
        booking_id: booking.id,
        customer_name: booking.customer_details?.[0]?.full_name || 'Unknown Customer',
        customer_email: booking.customer_details?.[0]?.email || '',
        customer_phone: booking.customer_details?.[0]?.contact_number || '',
        address: booking.address,
        postcode: booking.postcode,
        amount: booking.quote?.breakdown?.price_components?.total || booking.price || 0,
        currency: 'GBP',
        payment_method: booking.payment_method || 'Card Payment',
        payment_status: getPaymentStatus(booking),
        created_at: booking.created_at,
        description: 'Clearance Service',
        line_items: booking.quote?.breakdown ? [
          {
            description: 'Clearance Service',
            quantity: 1,
            unit_price: booking.quote.breakdown.price_components.total,
            total: booking.quote.breakdown.price_components.total
          }
        ] : undefined
      };

      // Download HTML receipt by default
      EnhancedReceiptGenerator.downloadHTMLReceipt(receiptData);

      toast({
        title: 'Receipt Downloaded',
        description: 'Receipt has been downloaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download receipt.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading booking payments...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Receipt className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold">{paymentSummary.totalBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">£{paymentSummary.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Paid Bookings</p>
                <p className="text-2xl font-bold">{paymentSummary.paidBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Payments</p>
                <p className="text-2xl font-bold">{paymentSummary.pendingPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Payment Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Booking Payments & Billing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking: BookingWithPayment) => {
                const paymentStatus = getPaymentStatus(booking);
                const amount = booking.quote?.breakdown?.price_components?.total || booking.price || 0;
                
                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {booking.customer_details?.[0]?.full_name || 'Unknown Customer'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {booking.customer_details?.[0]?.email || 'No email'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {booking.customer_details?.[0]?.contact_number || 'No phone'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        <div>
                          <div className="text-sm">{booking.address}</div>
                          <div className="text-xs text-gray-500">{booking.postcode}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      £{amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(paymentStatus)}>
                        {paymentStatus.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => downloadReceipt(booking)}
                          title="Download Receipt"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        {paymentStatus === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handlePayNow(booking)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pay Now
                          </Button>
                        )}
                        
                        {paymentStatus === 'paid' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => generateInvoice(booking)}
                            disabled={processingPayment === booking.id}
                          >
                            {processingPayment === booking.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Receipt className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    No bookings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      {showPaymentDialog && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Payment Options</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowPaymentDialog(false)}
              >
                ×
              </Button>
            </div>
            
            <PaymentMethodSelection
              invoiceId={selectedBooking.id}
              totalAmount={(selectedBooking.quote?.breakdown?.price_components?.total || selectedBooking.price || 0) * 100}
              currency="gbp"
              onPaymentSuccess={handlePaymentSuccess}
              onMethodChange={(method, amount) => {
                console.log('Payment method selected:', method.label, 'Amount:', amount);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPaymentIntegration; 