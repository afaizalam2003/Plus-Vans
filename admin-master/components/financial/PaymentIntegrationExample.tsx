'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedQuoteToPaymentFlow } from './EnhancedQuoteToPaymentFlow';
import { PaymentMethodSelection } from './PaymentMethodSelection';
import { PayNowButton } from './PayNowButton';

// Example data for demonstration
const exampleQuote = {
  id: 'quote_123',
  quote_number: 'QUO-2024-001',
  customer_name: 'John Doe',
  customer_email: 'john.doe@example.com',
  customer_phone: '+44 7700 900123',
  address: '123 Example Street, London',
  postcode: 'SW1A 1AA',
  line_items: [
    {
      id: 'item_1',
      description: 'House Clearance Service',
      quantity: 1,
      unit_price: 150.00,
      total: 150.00
    },
    {
      id: 'item_2',
      description: 'Large Items Disposal',
      quantity: 3,
      unit_price: 25.00,
      total: 75.00
    }
  ],
  subtotal: 225.00,
  tax_amount: 45.00,
  discount_amount: 0.00,
  total_amount: 270.00,
  status: 'draft' as const,
  created_at: '2024-01-15T10:00:00Z',
  notes: 'Please ensure access to rear garden for large items collection.'
};

const exampleInvoice = {
  id: 'inv_456',
  invoice_number: 'INV-2024-001',
  amount: 27000, // £270.00 in cents
  currency: 'gbp',
  status: 'pending'
};

export function PaymentIntegrationExample() {
  const [activeTab, setActiveTab] = useState('overview');

  const handlePaymentSuccess = (paymentDetails: any) => {
    console.log('Payment successful:', paymentDetails);
    alert('Payment processed successfully!');
  };

  const handleQuoteAccepted = (quote: any) => {
    console.log('Quote accepted:', quote);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Stripe Payment Integration</h1>
        <p className="text-xl text-gray-600">
          Complete quote-to-payment flow with multiple payment options
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="default">Stripe Checkout</Badge>
          <Badge variant="secondary">Payment Methods</Badge>
          <Badge variant="outline">Security</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quote-flow">Quote to Payment</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="simple-payment">Simple Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Integration Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">🔄 Quote to Payment Flow</h3>
                  <p className="text-sm text-gray-600">
                    Complete workflow from quote review to payment completion with step-by-step guidance.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">💳 Multiple Payment Methods</h3>
                  <p className="text-sm text-gray-600">
                    Cash on Collection, Deposit (50%), or Full Payment options with clear pricing.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">🔒 Secure Processing</h3>
                  <p className="text-sm text-gray-600">
                    PCI-compliant Stripe integration with comprehensive security measures.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Implementation Status</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>PayNowButton Component</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>Payment Method Selection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>Enhanced Quote Flow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>Stripe Checkout Integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>Webhook Security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>Error Handling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Test Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Environment Setup</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
                  <li>Ensure Stripe environment variables are configured</li>
                  <li>Set up webhook endpoint for payment processing</li>
                  <li>Configure Supabase database tables</li>
                  <li>Test with Stripe test card numbers</li>
                </ol>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Test Card Numbers</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-800">
                  <div>
                    <strong>Success:</strong> 4242 4242 4242 4242
                  </div>
                  <div>
                    <strong>Decline:</strong> 4000 0000 0000 0002
                  </div>
                  <div>
                    <strong>3D Secure:</strong> 4000 0025 0000 3155
                  </div>
                  <div>
                    <strong>Exp/CVC:</strong> Any future date / Any 3 digits
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quote-flow">
          <Card>
            <CardHeader>
              <CardTitle>Complete Quote to Payment Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedQuoteToPaymentFlow
                quote={exampleQuote}
                onPaymentSuccess={handlePaymentSuccess}
                onQuoteAccepted={handleQuoteAccepted}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-methods">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentMethodSelection
                invoiceId={exampleInvoice.id}
                totalAmount={exampleInvoice.amount}
                currency={exampleInvoice.currency}
                onPaymentSuccess={handlePaymentSuccess}
                onMethodChange={(method, amount) => {
                  console.log('Payment method changed:', method.label, 'Amount:', amount);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simple-payment">
          <Card>
            <CardHeader>
              <CardTitle>Simple Pay Now Button</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-semibold">Invoice Payment</h3>
                <div className="bg-gray-50 border rounded-lg p-4 inline-block">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Invoice:</span>
                      <span className="font-medium">{exampleInvoice.invoice_number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-bold text-xl">
                        £{(exampleInvoice.amount / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={exampleInvoice.status === 'pending' ? 'secondary' : 'default'}>
                        {exampleInvoice.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <PayNowButton
                    invoiceId={exampleInvoice.id}
                    amount={exampleInvoice.amount}
                    currency={exampleInvoice.currency}
                    onSuccess={handlePaymentSuccess}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Usage Example</h4>
                <pre className="text-sm text-blue-800 bg-blue-100 p-2 rounded overflow-x-auto">
{`<PayNowButton
  invoiceId="inv_456"
  amount={27000} // £270.00 in cents
  currency="gbp"
  onSuccess={(paymentDetails) => {
    console.log('Payment successful:', paymentDetails);
    // Handle success logic
  }}
/>`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Integration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p>
              This Stripe payment integration provides a complete solution for processing payments
              in the Plus Vans platform. The implementation includes:
            </p>
            
            <ul className="list-disc list-inside space-y-1 mt-4">
              <li><strong>Secure Payment Processing:</strong> PCI-compliant integration using Stripe Elements</li>
              <li><strong>Multiple Payment Options:</strong> Cash on Collection, Deposit, and Full Payment</li>
              <li><strong>Comprehensive Flow:</strong> From quote review to payment confirmation</li>
              <li><strong>Error Handling:</strong> Robust error handling with user-friendly messages</li>
              <li><strong>Security Measures:</strong> Webhook validation and secure data handling</li>
              <li><strong>Responsive Design:</strong> Works across all device sizes</li>
            </ul>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium mb-2">Next Steps for Implementation:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Configure Stripe account and obtain API keys</li>
                <li>Set up webhook endpoints in Stripe dashboard</li>
                <li>Configure environment variables in your deployment</li>
                <li>Test payment flows with Stripe test cards</li>
                <li>Deploy to production with live Stripe keys</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 