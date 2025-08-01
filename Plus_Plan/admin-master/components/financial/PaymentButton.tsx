import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { useCreatePaymentSession } from "../hooks/useStripePayments";

interface PaymentButtonProps {
  quoteId: string;
  customerEmail: string;
  amount: number;
  disabled?: boolean;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  quoteId,
  customerEmail,
  amount,
  disabled = false,
}) => {
  const createPaymentSession = useCreatePaymentSession();

  const handlePayment = () => {
    createPaymentSession.mutate({
      quoteId,
      customerEmail,
      amount,
    });
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || createPaymentSession.isPending}
      className="flex items-center gap-2"
    >
      {createPaymentSession.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4" />
      )}
      {createPaymentSession.isPending
        ? "Processing..."
        : `Pay £${amount.toFixed(2)}`}
    </Button>
  );
};

export default PaymentButton;
