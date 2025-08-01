'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, FileText, CreditCard, AlertCircle } from 'lucide-react';
import { PaymentMethodSelection, PaymentMethod } from './PaymentMethodSelection';
import { useToast } from '@/components/ui/use-toast';

interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Quote {
  id: string;
  quote_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  postcode: string;
  line_items: QuoteLineItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
  valid_until?: string;
  notes?: string;
}

interface EnhancedQuoteToPaymentFlowProps {
  quote: Quote;
  onPaymentSuccess?: (paymentDetails: any) => void;
  onQuoteAccepted?: (quote: Quote) => void;
}

type FlowStep = 'review' | 'payment_method' | 'payment' | 'confirmation';

interface StepIndicatorProps {
  steps: Array<{
    id: FlowStep;
    label: string;
    icon: React.ReactNode;
  }>;
  currentStep: FlowStep;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = index < currentIndex;
        const isUpcoming = index > currentIndex;
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                ${isActive ? 'border-blue-500 bg-blue-50 text-blue-600' : ''}
                ${isCompleted ? 'border-green-500 bg-green-50 text-green-600' : ''}
                ${isUpcoming ? 'border-gray-300 bg-gray-50 text-gray-400' : ''}
              `}>
                {isCompleted ? <CheckCircle className="h-5 w-5" /> : step.icon}
              </div>
              <span className={`
                text-xs mt-2 font-medium
                ${isActive ? 'text-blue-600' : ''}
                ${isCompleted ? 'text-green-600' : ''}
                ${isUpcoming ? 'text-gray-400' : ''}
              `}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`
                flex-1 h-0.5 mx-4 transition-all
                ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}
              `} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export function EnhancedQuoteToPaymentFlow({ 
  quote, 
  onPaymentSuccess, 
  onQuoteAccepted 
}: EnhancedQuoteToPaymentFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('review');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const steps = [
    { id: 'review' as FlowStep, label: 'Review Quote', icon: <FileText className="h-5 w-5" /> },
    { id: 'payment_method' as FlowStep, label: 'Payment Method', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'payment' as FlowStep, label: 'Payment', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'confirmation' as FlowStep, label: 'Confirmation', icon: <CheckCircle className="h-5 w-5" /> }
  ];

  const formatAmount = (amount: number) => {
    return `£${(amount / 100).toFixed(2)}`;
  };

  const handleAcceptQuote = () => {
    setIsProcessing(true);
    
    // Simulate API call to accept quote
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep('payment_method');
      onQuoteAccepted?.(quote);
      toast({
        title: "Quote Accepted",
        description: "You can now proceed with payment selection.",
      });
    }, 1000);
  };

  const handlePaymentMethodChange = useCallback((method: PaymentMethod, calculatedAmount: number) => {
    setSelectedPaymentMethod(method);
    setPaymentAmount(calculatedAmount);
  }, []);

  const handleProceedToPayment = () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to continue.",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = (paymentDetails?: any) => {
    setCurrentStep('confirmation');
    onPaymentSuccess?.(paymentDetails);
    toast({
      title: "Payment Successful",
      description: selectedPaymentMethod?.id === 'cash_on_collection' 
        ? "Your booking is confirmed for cash on collection."
        : "Your payment has been processed successfully.",
    });
  };

  const renderReviewStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quote Details</span>
            <Badge variant={quote.status === 'draft' ? 'secondary' : 'default'}>
              {quote.status.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Quote Number:</span>
              <p>{quote.quote_number}</p>
            </div>
            <div>
              <span className="font-medium">Customer:</span>
              <p>{quote.customer_name}</p>
            </div>
            <div>
              <span className="font-medium">Email:</span>
              <p>{quote.customer_email}</p>
            </div>
            <div>
              <span className="font-medium">Phone:</span>
              <p>{quote.customer_phone}</p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <span className="font-medium text-sm">Service Address:</span>
            <p className="text-sm text-gray-600">{quote.address}, {quote.postcode}</p>
          </div>

          <Separator />

          <div className="space-y-3">
            <span className="font-medium text-sm">Service Items:</span>
            {quote.line_items.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.description}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatAmount(item.total * 100)}</p>
                  <p className="text-sm text-gray-600">{formatAmount(item.unit_price * 100)} each</p>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2 text-right">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatAmount(quote.subtotal * 100)}</span>
            </div>
            {quote.tax_amount > 0 && (
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatAmount(quote.tax_amount * 100)}</span>
              </div>
            )}
            {quote.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-{formatAmount(quote.discount_amount * 100)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatAmount(quote.total_amount * 100)}</span>
            </div>
          </div>

          {quote.notes && (
            <>
              <Separator />
              <div>
                <span className="font-medium text-sm">Notes:</span>
                <p className="text-sm text-gray-600 mt-1">{quote.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleAcceptQuote}
          disabled={isProcessing}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? 'Accepting...' : 'Accept Quote & Continue'}
        </Button>
      </div>
    </div>
  );

  const renderPaymentMethodStep = () => (
    <div className="space-y-6">
      <PaymentMethodSelection
        invoiceId={quote.id}
        totalAmount={quote.total_amount * 100} // Convert to cents
        onMethodChange={handlePaymentMethodChange}
        onPaymentSuccess={handlePaymentSuccess}
      />
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep('review')}
        >
          Back to Review
        </Button>
        <Button 
          onClick={handleProceedToPayment}
          disabled={!selectedPaymentMethod || selectedPaymentMethod.id === 'cash_on_collection'}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {selectedPaymentMethod?.id === 'cash_on_collection' ? 'Booking Confirmed' : 'Proceed to Payment'}
        </Button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Complete Payment</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-lg">
            <span className="text-gray-600">Payment Amount:</span>
            <span className="font-bold ml-2 text-2xl">{formatAmount(paymentAmount)}</span>
          </div>
          
          <div className="text-sm text-gray-600">
            Payment Method: <span className="font-medium">{selectedPaymentMethod?.label}</span>
          </div>

          <PaymentMethodSelection
            invoiceId={quote.id}
            totalAmount={quote.total_amount * 100}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 text-center space-y-6">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-green-600">
              {selectedPaymentMethod?.id === 'cash_on_collection' ? 'Booking Confirmed!' : 'Payment Successful!'}
            </h3>
            <p className="text-gray-600">
              {selectedPaymentMethod?.id === 'cash_on_collection' 
                ? 'Your booking has been confirmed. We\'ll contact you to arrange collection.'
                : 'Your payment has been processed and your booking is confirmed.'
              }
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
            <h4 className="font-medium text-green-800 mb-2">Booking Summary</h4>
            <div className="space-y-1 text-sm text-green-700">
              <p><span className="font-medium">Quote Number:</span> {quote.quote_number}</p>
              <p><span className="font-medium">Total Amount:</span> {formatAmount(quote.total_amount * 100)}</p>
              <p><span className="font-medium">Payment Method:</span> {selectedPaymentMethod?.label}</p>
              {selectedPaymentMethod?.id !== 'cash_on_collection' && (
                <p><span className="font-medium">Amount Paid:</span> {formatAmount(paymentAmount)}</p>
              )}
            </div>
          </div>

          <div className="flex justify-center space-x-3">
            <Button variant="outline">
              Download Receipt
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              View Booking Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quote to Payment</h1>
        <p className="text-gray-600">Review your quote and complete your booking</p>
      </div>

      <StepIndicator steps={steps} currentStep={currentStep} />

      {currentStep === 'review' && renderReviewStep()}
      {currentStep === 'payment_method' && renderPaymentMethodStep()}
      {currentStep === 'payment' && renderPaymentStep()}
      {currentStep === 'confirmation' && renderConfirmationStep()}
    </div>
  );
} 