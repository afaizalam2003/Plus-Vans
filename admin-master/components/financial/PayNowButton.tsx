'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CreditCard, FileText, CheckCircle, DollarSign, Banknote } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

console.log('PayNowButton component loaded');

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

interface PayNowButtonProps {
  invoiceId: string;
  amount: number; // in cents
  currency?: string;
  onSuccess?: (result: { paymentIntentId: string; amount: number; currency: string; status: string; invoiceId: string }) => void;
}

interface PaymentMethod {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  calculateAmount: (total: number) => number;
  type: 'cash' | 'deposit' | 'full';
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'cash_on_collection',
    label: 'Cash on Collection',
    description: 'Pay in cash when we arrive',
    icon: <Banknote className="h-5 w-5" />,
    calculateAmount: () => 0, // No payment required upfront
    type: 'cash'
  },
  {
    id: 'deposit_50',
    label: 'Deposit (50%)',
    description: 'Pay 50% now, remainder on completion',
    icon: <CreditCard className="h-5 w-5" />,
    calculateAmount: (total) => Math.round(total * 0.5),
    type: 'deposit'
  },
  {
    id: 'full_payment',
    label: 'Full Payment',
    description: 'Pay the full amount now',
    icon: <DollarSign className="h-5 w-5" />,
    calculateAmount: (total) => total,
    type: 'full'
  }
];

interface CheckoutFormProps extends PayNowButtonProps {
  onClose: () => void;
}

function CheckoutForm({ invoiceId, amount, currency, onSuccess, onClose }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent using existing Next.js API route
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount / 100, // Convert from cents to dollars for the API
          currency: currency,
          invoiceId: invoiceId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Confirm the payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            // Add customer details here if available
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        setPaymentSucceeded(true);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess({
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            invoiceId
          });
        }
        
        // Show success message for 2 seconds before closing
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show success state
  if (paymentSucceeded) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-green-800">Payment Successful!</h3>
          <p className="text-sm text-gray-600">
            Your payment of £{(amount / 100).toFixed(2)} has been processed successfully.
          </p>
          <p className="text-xs text-gray-500 mt-2">This dialog will close automatically...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}
      
      <div className="flex space-x-3">
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay £{(amount / 100).toFixed(2)}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

// Main component with quote-to-payment flow
export function PayNowButton({ invoiceId, amount, currency = 'gbp', onSuccess }: PayNowButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<'method' | 'payment' | 'confirmation'>('method');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    const calculatedAmount = method.calculateAmount(amount);
    setPaymentAmount(calculatedAmount);
    
    if (method.type === 'cash') {
      // For cash payment, show confirmation directly
      setCurrentStep('confirmation');
      handleCashPayment();
    } else {
      // For card payments, proceed to Stripe checkout
      setCurrentStep('payment');
    }
  };

  const handleCashPayment = () => {
    // Handle cash on collection
    toast({
      title: "Cash Payment Selected",
      description: "Payment will be collected in cash on arrival.",
    });
    
    // Simulate success for cash payment
    onSuccess?.({
      paymentIntentId: 'cash_' + Date.now(),
      amount: 0, // No card payment
      currency: currency,
      status: 'cash_on_collection',
      invoiceId
    });
    
    setShowModal(false);
    setCurrentStep('method');
    setSelectedPaymentMethod(null);
  };

  const handleCardPaymentSuccess = (result: any) => {
    setCurrentStep('confirmation');
    setTimeout(() => {
      onSuccess?.(result);
      setShowModal(false);
      setCurrentStep('method');
      setSelectedPaymentMethod(null);
    }, 2000);
  };

  const formatAmount = (amountInCents: number) => {
    return `£${(amountInCents / 100).toFixed(2)}`;
  };

  // Simple button that opens the payment modal
  if (error) {
    return (
      <div className="inline-flex items-center text-red-600 text-sm bg-red-50 px-3 py-1 rounded-md">
        <AlertCircle className="h-4 w-4 mr-1" />
        {error}
      </div>
    );
  }

  return (
    <div className="inline-block">
      <Button 
        size="sm" 
        onClick={() => {
          console.log('Pay Now clicked');
          console.log('Invoice ID:', invoiceId);
          console.log('Amount:', amount, 'cents');
          setShowModal(true);
        }}
        disabled={!stripePromise}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm"
      >
        Pay Now
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Step Indicator */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-center space-x-4">
                <div className={`flex items-center space-x-2 ${currentStep === 'method' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <CreditCard className="h-5 w-5" />
                  <span className="text-sm font-medium">Payment Method</span>
                </div>
                <div className="h-px bg-gray-300 w-8"></div>
                <div className={`flex items-center space-x-2 ${currentStep === 'payment' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <FileText className="h-5 w-5" />
                  <span className="text-sm font-medium">Payment</span>
                </div>
                <div className="h-px bg-gray-300 w-8"></div>
                <div className={`flex items-center space-x-2 ${currentStep === 'confirmation' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Confirmation</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              
              {/* Payment Method Selection */}
              {currentStep === 'method' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Select Payment Method</h3>
                    <p className="text-gray-600">Invoice Total: {formatAmount(amount)}</p>
                  </div>
                  
                  <div className="grid gap-4">
                    {PAYMENT_METHODS.map((method) => {
                      const calculatedAmount = method.calculateAmount(amount);
                      return (
                        <Card 
                          key={method.id}
                          className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300"
                          onClick={() => handlePaymentMethodSelect(method)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {method.icon}
                                <div>
                                  <h4 className="font-medium">{method.label}</h4>
                                  <p className="text-sm text-gray-600">{method.description}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">
                                  {calculatedAmount === 0 ? 'No payment' : formatAmount(calculatedAmount)}
                                </div>
                                {method.type === 'deposit' && (
                                  <div className="text-xs text-gray-500">
                                    Remaining: {formatAmount(amount - calculatedAmount)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stripe Payment */}
              {currentStep === 'payment' && selectedPaymentMethod && stripePromise && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Complete Payment</h3>
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <Badge variant="outline">{selectedPaymentMethod.label}</Badge>
                      <span className="text-lg font-semibold">{formatAmount(paymentAmount)}</span>
                    </div>
                  </div>
                  
                  <Elements stripe={stripePromise}>
                    <CheckoutForm 
                      invoiceId={invoiceId}
                      amount={paymentAmount}
                      currency={currency}
                      onSuccess={handleCardPaymentSuccess}
                      onClose={() => setCurrentStep('method')}
                    />
                  </Elements>
                </div>
              )}

              {/* Confirmation */}
              {currentStep === 'confirmation' && (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-600">Payment Successful!</h3>
                  <p className="text-gray-600">
                    {selectedPaymentMethod?.type === 'cash' 
                      ? 'Your payment preference has been recorded. Payment will be collected in cash on arrival.'
                      : 'Your payment has been processed successfully. You will receive a confirmation email shortly.'
                    }
                  </p>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowModal(false);
                    setCurrentStep('method');
                    setSelectedPaymentMethod(null);
                  }}
                >
                  Close
                </Button>
                
                {currentStep === 'method' && (
                  <div className="text-sm text-gray-500">
                    Select a payment method to continue
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
