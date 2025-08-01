'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Banknote, HandCoins, InfoIcon } from 'lucide-react';
import { PayNowButton } from './PayNowButton';

export interface PaymentMethod {
  id: 'cash_on_collection' | 'deposit' | 'full_payment';
  label: string;
  description: string;
  icon: React.ReactNode;
  calculation: (amount: number) => number;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface PaymentMethodSelectionProps {
  invoiceId: string;
  totalAmount: number;
  currency?: string;
  onPaymentSuccess?: (paymentDetails?: any) => void;
  onMethodChange?: (method: PaymentMethod, calculatedAmount: number) => void;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'cash_on_collection',
    label: 'Cash on Collection',
    description: 'Pay with cash when your items are collected',
    icon: <HandCoins className="h-5 w-5" />,
    calculation: () => 0, // No online payment required
    badge: 'No payment now',
    badgeVariant: 'secondary'
  },
  {
    id: 'deposit',
    label: 'Pay Deposit',
    description: 'Pay 50% now, remainder on collection',
    icon: <CreditCard className="h-5 w-5" />,
    calculation: (amount) => Math.round(amount * 0.5),
    badge: '50% now',
    badgeVariant: 'outline'
  },
  {
    id: 'full_payment',
    label: 'Pay in Full',
    description: 'Pay the complete amount now',
    icon: <Banknote className="h-5 w-5" />,
    calculation: (amount) => amount,
    badge: 'Recommended',
    badgeVariant: 'default'
  }
];

export function PaymentMethodSelection({
  invoiceId,
  totalAmount,
  currency = 'gbp',
  onPaymentSuccess,
  onMethodChange
}: PaymentMethodSelectionProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod['id']>('full_payment');
  const [isProcessing, setIsProcessing] = useState(false);

  const currentMethod = PAYMENT_METHODS.find(method => method.id === selectedMethod)!;
  const calculatedAmount = currentMethod.calculation(totalAmount);

  React.useEffect(() => {
    onMethodChange?.(currentMethod, calculatedAmount);
  }, [selectedMethod, totalAmount, currentMethod, calculatedAmount, onMethodChange]);

  const handleMethodChange = (methodId: PaymentMethod['id']) => {
    setSelectedMethod(methodId);
  };

  const handleCashOnCollection = () => {
    setIsProcessing(true);
    
    // For cash on collection, we just need to update the booking/invoice status
    // to indicate payment method selected but no immediate payment required
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess?.({
        paymentMethod: 'cash_on_collection',
        amount: 0,
        currency: 'gbp',
        status: 'reserved',
        invoiceId
      });
    }, 1000);
  };

  const formatAmount = (amount: number) => {
    return `£${(amount / 100).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Select Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <InfoIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Total Amount: {formatAmount(totalAmount)}</p>
                  <p>Choose how you&apos;d like to handle payment for this service.</p>
                </div>
              </div>
            </div>

            <RadioGroup 
              value={selectedMethod} 
              onValueChange={handleMethodChange}
              className="space-y-3"
            >
              {PAYMENT_METHODS.map((method) => {
                const methodAmount = method.calculation(totalAmount);
                
                return (
                  <div key={method.id} className="relative">
                    <Label
                      htmlFor={method.id}
                      className={`
                        flex items-center space-x-4 rounded-lg border p-4 cursor-pointer transition-all
                        ${selectedMethod === method.id 
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {method.icon}
                            <span className="font-medium">{method.label}</span>
                          </div>
                          {method.badge && (
                            <Badge variant={method.badgeVariant}>
                              {method.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {method.description}
                        </p>
                        <div className="text-sm">
                          {method.id === 'cash_on_collection' ? (
                            <span className="text-green-600 font-medium">
                              No payment required now
                            </span>
                          ) : (
                            <span className="text-blue-600 font-medium">
                              Pay now: {formatAmount(methodAmount)}
                              {method.id === 'deposit' && (
                                <span className="text-gray-500 ml-2">
                                  (Remaining: {formatAmount(totalAmount - methodAmount)} on collection)
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Payment Action */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Selected Method:</span>
              <span>{currentMethod.label}</span>
            </div>
            
            {selectedMethod === 'cash_on_collection' ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    Your booking is confirmed. Please have {formatAmount(totalAmount)} ready for payment when we collect your items.
                  </p>
                </div>
                <Button 
                  onClick={handleCashOnCollection}
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {isProcessing ? 'Confirming...' : 'Confirm Cash on Collection'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    Amount to pay now: <span className="font-semibold">{formatAmount(calculatedAmount)}</span>
                    {selectedMethod === 'deposit' && (
                      <span className="block mt-1">
                        You&apos;ll pay the remaining {formatAmount(totalAmount - calculatedAmount)} when we collect your items.
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex justify-center">
                  <PayNowButton
                    invoiceId={invoiceId}
                    amount={calculatedAmount}
                    currency={currency}
                    onSuccess={onPaymentSuccess}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 