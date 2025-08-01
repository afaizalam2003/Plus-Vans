import React from "react";
import { PricingCalculationResult } from "@/hooks/usePricingCalculation";

interface PriceCalculationDisplayProps {
  calculatedPrice: PricingCalculationResult | null;
}

const PriceCalculationDisplay: React.FC<PriceCalculationDisplayProps> = ({
  calculatedPrice,
}) => {
  if (!calculatedPrice) {
    return (
      <div className="text-center text-muted-foreground p-8 border rounded-lg">
        Enter postcode and address, then click "Calculate Price" to see the
        breakdown.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Labor Cost</p>
          <p className="font-semibold">£{calculatedPrice.labor_cost}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Disposal Cost</p>
          <p className="font-semibold">£{calculatedPrice.disposal_cost}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Transport Cost</p>
          <p className="font-semibold">£{calculatedPrice.transport_cost}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Base Cost</p>
          <p className="font-semibold">£{calculatedPrice.base_cost}</p>
        </div>
      </div>

      {calculatedPrice.surcharges > 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Surcharges</span>
          <span className="font-semibold text-red-600">
            +£{calculatedPrice.surcharges}
          </span>
        </div>
      )}

      {calculatedPrice.discounts > 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Discounts</span>
          <span className="font-semibold text-green-600">
            -£{calculatedPrice.discounts}
          </span>
        </div>
      )}

      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="font-bold">Total Amount</span>
          <span className="text-xl font-bold text-primary">
            £{calculatedPrice.total_amount}
          </span>
        </div>
      </div>

      {calculatedPrice.applied_rules &&
        calculatedPrice.applied_rules.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-sm">Applied Rules:</h4>
            <div className="space-y-1">
              {calculatedPrice.applied_rules.map((rule: any, index: number) => (
                <div key={index} className="flex justify-between text-xs">
                  <span>{rule.rule_name}</span>
                  <span
                    className={
                      rule.rule_type === "discount"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {rule.rule_type === "discount" ? "-" : "+"}£
                    {rule.amount_applied}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};

export default PriceCalculationDisplay;
