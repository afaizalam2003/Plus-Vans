import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useCreatePaymentSession = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      quoteId,
      customerEmail,
      amount,
    }: {
      quoteId: string;
      customerEmail: string;
      amount: number;
    }) => {
      console.log("Creating payment session for quote:", quoteId);

      const { data, error } = await supabase.functions.invoke(
        "create-payment",
        {
          body: {
            quoteId,
            customerEmail,
            amount,
            currency: "gbp",
          },
        }
      );

      if (error) {
        console.error("Error creating payment session:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log("Payment session created successfully:", data);
      // Open Stripe checkout in a new tab
      if (data.url) {
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      console.error("Error creating payment session:", error);
      toast({
        title: "Payment Error",
        description: "Failed to create payment session",
        variant: "destructive",
      });
    },
  });
};

export const useVerifyPayment = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      console.log("Verifying payment session:", sessionId);

      const { data, error } = await supabase.functions.invoke(
        "verify-payment",
        {
          body: { sessionId },
        }
      );

      if (error) {
        console.error("Error verifying payment:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      if (data.status === "paid") {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully",
        });
      }
    },
    onError: (error) => {
      console.error("Error verifying payment:", error);
      toast({
        title: "Verification Error",
        description: "Failed to verify payment status",
        variant: "destructive",
      });
    },
  });
};

