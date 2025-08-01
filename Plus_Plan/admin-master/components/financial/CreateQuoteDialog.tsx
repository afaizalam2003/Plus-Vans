import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PricingCalculationResult } from "@/components/hooks/usePricingCalculation";
import QuoteForm from "./quote/QuoteForm";
import PriceCalculationDisplay from "./quote/PriceCalculationDisplay";

interface CreateQuoteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateQuoteDialog: React.FC<CreateQuoteDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const [calculatedPrice, setCalculatedPrice] =
    useState<PricingCalculationResult | null>(null);

  const handleSuccess = () => {
    setCalculatedPrice(null);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setCalculatedPrice(null);
    onOpenChange(false);
  };

  const handlePriceCalculated = (price: PricingCalculationResult | null) => {
    setCalculatedPrice(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Quote</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          <QuoteForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            onPriceCalculated={handlePriceCalculated}
          />

          <div className="space-y-4">
            <h3 className="font-semibold">Price Calculation</h3>
            <PriceCalculationDisplay calculatedPrice={calculatedPrice} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuoteDialog;
