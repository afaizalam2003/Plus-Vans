import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useCreateFinancialQuote } from "@/components/hooks/useFinancialQuotes";
import {
  useCalculatePrice,
  type PricingCalculationResult,
} from "@/components/hooks/usePricingCalculation";
import QuoteFormFields from "./QuoteFormFields";

interface QuoteFormData {
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  postcode: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  notes: string;
}

interface QuoteFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  onPriceCalculated: (price: PricingCalculationResult | null) => void;
}

const QuoteForm: React.FC<QuoteFormProps> = ({
  onSuccess,
  onCancel,
  onPriceCalculated,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuoteFormData>();
  const [calculatedPrice, setCalculatedPrice] =
    useState<PricingCalculationResult | null>(null);
  const createQuote = useCreateFinancialQuote();
  const calculatePrice = useCalculatePrice();

  const postcode = watch("postcode");
  const address = watch("address");

  const handleCalculatePrice = () => {
    if (postcode) {
      const inputData = {
        postcode,
        address,
        item_count: 1,
        access_difficulty: "normal",
      };

      calculatePrice.mutate(inputData, {
        onSuccess: (result) => {
          setCalculatedPrice(result);
          onPriceCalculated(result);
          setValue("subtotal", parseFloat(result.total_amount.toString()));
          setValue("tax_amount", 0);
          setValue("discount_amount", 0);
        },
      });
    }
  };

  const onSubmit = (data: QuoteFormData) => {
    const total_amount = data.subtotal + data.tax_amount - data.discount_amount;

    createQuote.mutate(
      {
        customer_email: data.customer_email,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        address: data.address,
        postcode: data.postcode,
        line_items: calculatedPrice?.applied_rules || [],
        subtotal: data.subtotal,
        tax_amount: data.tax_amount,
        discount_amount: data.discount_amount,
        total_amount,
        status: "draft",
        notes: data.notes,
      },
      {
        onSuccess: () => {
          reset();
          setCalculatedPrice(null);
          onPriceCalculated(null);
          onSuccess();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <QuoteFormFields
        register={register}
        errors={errors}
        postcode={postcode}
        onCalculatePrice={handleCalculatePrice}
        isCalculating={calculatePrice.isPending}
      />

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={createQuote.isPending}>
          {createQuote.isPending ? "Creating..." : "Create Quote"}
        </Button>
      </div>
    </form>
  );
};

export default QuoteForm;
