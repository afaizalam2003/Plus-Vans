'use client';

import React from 'react';
import { PaymentIntegrationExample } from '@/components/financial/PaymentIntegrationExample';

import { AutomaticInvoiceGenerator, type InvoiceData } from '@/components/financial/AutomaticInvoiceGenerator';
import { BookingInvoiceMigration } from '@/components/financial/BookingInvoiceMigration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, CreditCard, Receipt, Users, FileText, Download, Database } from 'lucide-react';

export default function PaymentTestPage() {
  const [generatedInvoice, setGeneratedInvoice] = React.useState<InvoiceData | null>(null);

  // Demo booking data for invoice generation
  const demoBooking = {
    id: 'demo-booking-001',
    customer_details: [{
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      contact_number: '+44 7700 900123',
      address: '456 Customer Street, London, SW2 1AA'
    }],
    address: '123 Service Road, London',
    postcode: 'SW1A 1AA',
    quote: {
      breakdown: {
        price_components: {
          base_rate: 120,
          hazard_surcharge: 25,
          access_fee: 15,
          dismantling_fee: 0,
          total: 160
        }
      }
    },
    created_at: new Date().toISOString(),
    status: 'completed'
  };

  const handleGenerateDemo = () => {
    const invoice = AutomaticInvoiceGenerator.generateInvoiceFromBooking(demoBooking);
    setGeneratedInvoice(invoice);
  };

  const handleDownloadDemo = () => {
    if (generatedInvoice) {
      AutomaticInvoiceGenerator.downloadInvoiceHTML(generatedInvoice);
    }
  };

  const handlePrintDemo = () => {
    if (generatedInvoice) {
      AutomaticInvoiceGenerator.printInvoice(generatedInvoice);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payment Integration Test</h1>
        <p className="text-gray-600 mt-2">
          Test and explore the complete Stripe payment integration with booking management, invoice generation, and receipt system.
        </p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Booking Payments
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <CreditCard className="h-3 w-3" />
            Stripe Integration
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Receipt className="h-3 w-3" />
            Receipt Generation
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Invoice Generation
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Customer Management
          </Badge>
        </div>
      </div>

              <Tabs defaultValue="invoice-generator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invoice-generator">Automatic Invoice System</TabsTrigger>
          <TabsTrigger value="stripe-demo">Stripe Integration Demo</TabsTrigger>
        </TabsList>



        <TabsContent value="invoice-generator" className="space-y-6">
          <Card>
            <CardHeader>
                          <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Unified Invoice System - Automatic Generation from Bookings
            </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">✅ Automatic Invoice Generation Features:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• <strong>Automatic Generation:</strong> Convert bookings to professional invoices instantly</li>
                    <li>• <strong>Smart Line Items:</strong> Breakdown pricing components (base rate, surcharges, fees)</li>
                    <li>• <strong>VAT Calculation:</strong> Automatic 20% VAT calculation on all line items</li>
                    <li>• <strong>Professional Templates:</strong> Company-branded HTML invoices with full styling</li>
                    <li>• <strong>Invoice Numbering:</strong> Automatic sequential numbering (INV-YYYYMMDD-XXX)</li>
                    <li>• <strong>Payment Terms:</strong> Configurable payment terms and due dates</li>
                    <li>• <strong>Multiple Formats:</strong> Download as HTML, print-ready, or batch processing</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Demo Invoice Generation:</h4>
                  <p className="text-sm text-blue-800 mb-4">
                    Try the invoice generation system with demo booking data. This demonstrates how bookings are automatically converted into professional invoices.
                  </p>
                  
                  <div className="flex gap-4">
                    <Button onClick={handleGenerateDemo} className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Generate Demo Invoice
                    </Button>
                    
                    {generatedInvoice && (
                      <>
                        <Button 
                          onClick={handleDownloadDemo} 
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download Invoice
                        </Button>
                        <Button 
                          onClick={handlePrintDemo} 
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Receipt className="h-4 w-4" />
                          Print Invoice
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {generatedInvoice && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Generated Invoice Details:</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Invoice Number:</strong> {generatedInvoice.invoice_number}</p>
                        <p><strong>Customer:</strong> {generatedInvoice.customer_name}</p>
                        <p><strong>Service Address:</strong> {generatedInvoice.service_address}</p>
                        <p><strong>Total Amount:</strong> £{generatedInvoice.total_amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p><strong>Status:</strong> {generatedInvoice.status.toUpperCase()}</p>
                        <p><strong>Payment Terms:</strong> {generatedInvoice.payment_terms}</p>
                        <p><strong>Line Items:</strong> {generatedInvoice.line_items.length}</p>
                        <p><strong>VAT Amount:</strong> £{generatedInvoice.tax_amount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Technical Implementation:</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• <strong>AutomaticInvoiceGenerator class:</strong> Centralized invoice generation logic</li>
                    <li>• <strong>Template Engine:</strong> Professional HTML templates with CSS styling</li>
                    <li>• <strong>Data Mapping:</strong> Intelligent conversion from booking data to invoice structure</li>
                    <li>• <strong>Calculation Engine:</strong> Automatic subtotal, VAT, and total calculations</li>
                    <li>• <strong>Export System:</strong> HTML download, print functionality, and batch processing</li>
                    <li>• <strong>Integration Ready:</strong> Hooks into existing booking and payment systems</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Migration Tool for Existing Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Migration Tool - Generate Invoices for Existing Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-900 mb-2">🔄 Automatic Migration Process:</h4>
                  <p className="text-sm text-amber-800 mb-2">
                    This migration tool will generate invoices for all existing bookings in your system. 
                    New bookings will automatically have invoices generated going forward.
                  </p>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Scans all existing bookings in the database</li>
                    <li>• Automatically generates professional invoices</li>
                    <li>• Skips bookings that already have invoices</li>
                    <li>• Links invoices to bookings for easy tracking</li>
                    <li>• Updates the Invoices tab in Financial dashboard</li>
                  </ul>
                </div>
                <BookingInvoiceMigration />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stripe-demo">
          <Card>
            <CardHeader>
              <CardTitle>Original Stripe Integration Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                This demonstrates the core Stripe payment components that power the booking payment system.
              </p>
            </CardContent>
          </Card>
          
          <PaymentIntegrationExample />
        </TabsContent>
      </Tabs>

      {/* Implementation Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Complete Implementation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="mb-4">
              This comprehensive payment integration successfully connects booking data to the financial management system with automatic invoice generation:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">✅ Payment & Billing Features</h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Booking Payment Integration:</strong> Display booking data in Payments & Billing section</li>
                  <li>• <strong>Enhanced Payment Transactions:</strong> Comprehensive transaction management with filtering</li>
                  <li>• <strong>Receipt Generation:</strong> Professional HTML receipts with download functionality</li>
                  <li>• <strong>Payment Method Selection:</strong> Cash on Collection, Deposit (50%), Full Payment</li>
                  <li>• <strong>Billing Categories:</strong> Organized billing data in financial dashboard</li>
                  <li>• <strong>Payment Status Sync:</strong> Webhook integration for real-time status updates</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">🆕 Invoice Generation System</h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Automatic Generation:</strong> Convert bookings to invoices automatically</li>
                  <li>• <strong>Professional Templates:</strong> Company-branded HTML invoices</li>
                  <li>• <strong>Smart Calculations:</strong> VAT, subtotals, and line item breakdowns</li>
                  <li>• <strong>Invoice Numbering:</strong> Sequential numbering system</li>
                  <li>• <strong>Multiple Formats:</strong> HTML download, print, and bulk processing</li>
                  <li>• <strong>Status Management:</strong> Draft, sent, paid, overdue tracking</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium mb-2">Complete Usage Flow:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Navigate to Admin → Financial → Payments & Billing → Booking Payments</li>
                <li>View all bookings with payment status and customer information</li>
                <li>Click &quot;Pay Now&quot; for pending payments to access payment method selection</li>
                <li>Choose from Cash on Collection, Deposit, or Full Payment options</li>
                <li>Generate professional invoices automatically from completed bookings</li>
                <li>Download receipts and invoices for any transactions</li>
                <li>Export data for accounting and reporting purposes</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 