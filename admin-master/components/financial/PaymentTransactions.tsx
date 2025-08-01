import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CreditCard, 
  Download, 
  ExternalLink, 
  Filter,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import http from "@/services/http-common";
import { useToast } from "@/components/ui/use-toast";

interface PaymentTransaction {
  id: string;
  booking_id?: string;
  invoice_id?: string;
  customer_name?: string;
  customer_email?: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  payment_method_details?: string;
  created_at: string;
  description?: string;
  stripe_payment_intent_id: string;
  booking_address?: string;
}

const PaymentTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<PaymentTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch real payment data from API
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await http.get('/admin/payments');
      const paymentsData = response.data || [];
      
      // Transform the data to match our interface
      const transformedPayments: PaymentTransaction[] = paymentsData.map((payment: any) => ({
        id: payment.id || payment.stripe_payment_intent_id,
        booking_id: payment.booking_id,
        invoice_id: payment.invoice_id,
        customer_name: payment.customer_name || 'Unknown Customer',
        customer_email: payment.customer_email || '',
        amount: parseFloat(payment.amount) || 0, // Convert to number
        currency: (payment.currency || 'gbp').toUpperCase(),
        status: payment.status || 'unknown',
        payment_method: payment.payment_method || 'card',
        payment_method_details: payment.payment_method_details || 'Card Payment',
        created_at: payment.created_at || new Date().toISOString(),
        description: payment.description || 'Payment',
        stripe_payment_intent_id: payment.stripe_payment_intent_id || payment.id,
        booking_address: payment.booking_address || ''
      }));

      setTransactions(transformedPayments);
      setFilteredTransactions(transformedPayments);
      
      toast({
        title: "Success",
        description: `Loaded ${transformedPayments.length} payment transactions`,
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to load payment transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefresh = () => {
    fetchPayments();
  };

  // Calculate summary stats
  const summaryStats = React.useMemo(() => {
    const totalTransactions = transactions.length;
    const successfulTransactions = transactions.filter(t => t.status === 'succeeded');
    const totalRevenue = successfulTransactions.reduce((sum, t) => {
      const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount) || 0;
      return sum + amount;
    }, 0);
    const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
    const averageTransactionValue = successfulTransactions.length > 0 ? totalRevenue / successfulTransactions.length : 0;

    return {
      totalTransactions,
      totalRevenue,
      pendingTransactions,
      averageTransactionValue,
      successfulTransactions: successfulTransactions.length
    };
  }, [transactions]);

  // Filter transactions based on search and status
  React.useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.booking_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, statusFilter, transactions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'canceled':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'cash_on_collection':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const handleDownloadReceipt = (transaction: PaymentTransaction) => {
    // Generate receipt content
    const receiptContent = `
PAYMENT RECEIPT
=====================
Transaction ID: ${transaction.id}
Booking ID: ${transaction.booking_id}
Customer: ${transaction.customer_name}
Email: ${transaction.customer_email}
Address: ${transaction.booking_address}
Description: ${transaction.description}
Amount: £${transaction.amount.toFixed(2)} ${transaction.currency}
Payment Method: ${transaction.payment_method_details}
Status: ${transaction.status.toUpperCase()}
Date: ${format(new Date(transaction.created_at), 'PPP at p')}
=====================
Plus Vans Clearance Services
Thank you for your business!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${transaction.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openStripeTransaction = (paymentIntentId: string) => {
    const isTestMode = paymentIntentId.includes('test');
    const baseUrl = `https://dashboard.stripe.com${isTestMode ? '/test' : ''}`;
    window.open(`${baseUrl}/payments/${paymentIntentId}`, '_blank');
  };

  const handleExportData = () => {
    const csvContent = [
      ['Transaction ID', 'Booking ID', 'Customer', 'Email', 'Amount', 'Currency', 'Status', 'Payment Method', 'Date', 'Description'],
      ...filteredTransactions.map(t => [
        t.id,
        t.booking_id,
        t.customer_name,
        t.customer_email,
        t.amount.toFixed(2),
        t.currency,
        t.status,
        t.payment_method_details,
        format(new Date(t.created_at), 'yyyy-MM-dd HH:mm:ss'),
        t.description
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold">{summaryStats.totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">£{summaryStats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{summaryStats.pendingTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Transaction</p>
                <p className="text-2xl font-bold">£{summaryStats.averageTransactionValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Transactions
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
              <Button onClick={handleExportData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <CreditCard className="h-12 w-12 text-gray-400" />
                      <p className="text-gray-500">No payment transactions found</p>
                      <p className="text-sm text-gray-400">
                        {transactions.length === 0 
                          ? "No payments have been processed yet."
                          : "Try adjusting your search or filter criteria."
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="text-sm font-mono">{transaction.id.slice(0, 12)}...</div>
                        <div className="text-xs text-gray-500">{transaction.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.customer_name}</div>
                        <div className="text-sm text-gray-500">{transaction.customer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-mono">{transaction.booking_id}</div>
                        <div className="text-xs text-gray-500">{transaction.booking_address}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      £{(typeof transaction.amount === 'number' ? transaction.amount : parseFloat(transaction.amount) || 0).toFixed(2)} {transaction.currency}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(transaction.payment_method)}
                        <span className="text-sm">{transaction.payment_method_details}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(transaction.status)}>
                        {transaction.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">
                          {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(transaction.created_at), 'HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadReceipt(transaction)}
                          title="Download Receipt"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        {transaction.stripe_payment_intent_id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStripeTransaction(transaction.stripe_payment_intent_id!)}
                            title="View in Stripe"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTransactions;
