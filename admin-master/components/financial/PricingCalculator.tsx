import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, Save } from "lucide-react";
import {
  useCalculatePrice,
  useSavePricingCalculation,
} from "@/components/hooks/usePricingCalculation";

const PricingCalculator: React.FC = () => {
  const [inputData, setInputData] = useState({
    postcode: "",
    item_count: 1,
    item_types: [],
    access_difficulty: "normal",
    special_handling: false,
    collection_date: "",
    notes: "",
  });

  const [calculationResult, setCalculationResult] = useState<any>(null);

  const calculatePrice = useCalculatePrice();
  const savePricingCalculation = useSavePricingCalculation();

  const handleCalculate = () => {
    calculatePrice.mutate(inputData, {
      onSuccess: (result) => {
        setCalculationResult(result);
      },
    });
  };

  const handleSaveCalculation = () => {
    if (calculationResult) {
      savePricingCalculation.mutate({
        input_data: inputData,
        applied_rules: calculationResult.applied_rules,
        base_cost: calculationResult.base_cost,
        labor_cost: calculationResult.labor_cost,
        disposal_cost: calculationResult.disposal_cost,
        transport_cost: calculationResult.transport_cost,
        surcharges: calculationResult.surcharges,
        discounts: calculationResult.discounts,
        total_amount: calculationResult.total_amount,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Price Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                value={inputData.postcode}
                onChange={(e) =>
                  setInputData({ ...inputData, postcode: e.target.value })
                }
                placeholder="Enter postcode"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item_count">Number of Items</Label>
              <Input
                id="item_count"
                type="number"
                value={inputData.item_count}
                onChange={(e) =>
                  setInputData({
                    ...inputData,
                    item_count: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_difficulty">Access Difficulty</Label>
            <Select
              value={inputData.access_difficulty}
              onValueChange={(value) =>
                setInputData({ ...inputData, access_difficulty: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy Access</SelectItem>
                <SelectItem value="normal">Normal Access</SelectItem>
                <SelectItem value="difficult">Difficult Access</SelectItem>
                <SelectItem value="very_difficult">
                  Very Difficult Access
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="collection_date">Collection Date</Label>
            <Input
              id="collection_date"
              type="date"
              value={inputData.collection_date}
              onChange={(e) =>
                setInputData({ ...inputData, collection_date: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={inputData.notes}
              onChange={(e) =>
                setInputData({ ...inputData, notes: e.target.value })
              }
              placeholder="Any special requirements or notes"
            />
          </div>

          <Button
            onClick={handleCalculate}
            disabled={calculatePrice.isPending || !inputData.postcode}
            className="w-full"
          >
            {calculatePrice.isPending ? "Calculating..." : "Calculate Price"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Price Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {calculationResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Labor Cost</p>
                  <p className="text-lg font-semibold">
                    £{calculationResult.labor_cost}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Disposal Cost</p>
                  <p className="text-lg font-semibold">
                    £{calculationResult.disposal_cost}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Transport Cost
                  </p>
                  <p className="text-lg font-semibold">
                    £{calculationResult.transport_cost}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Base Cost</p>
                  <p className="text-lg font-semibold">
                    £{calculationResult.base_cost}
                  </p>
                </div>
              </div>

              {calculationResult.surcharges > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Surcharges</p>
                  <p className="text-lg font-semibold text-red-600">
                    +£{calculationResult.surcharges}
                  </p>
                </div>
              )}

              {calculationResult.discounts > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Discounts</p>
                  <p className="text-lg font-semibold text-green-600">
                    -£{calculationResult.discounts}
                  </p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">
                    £{calculationResult.total_amount}
                  </p>
                </div>
              </div>

              {calculationResult.applied_rules &&
                calculationResult.applied_rules.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Applied Rules:</h4>
                    <div className="space-y-2">
                      {calculationResult.applied_rules.map(
                        (rule: any, index: number) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm"
                          >
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
                        )
                      )}
                    </div>
                  </div>
                )}

              <Button
                onClick={handleSaveCalculation}
                disabled={savePricingCalculation.isPending}
                className="w-full mt-4"
              >
                <Save className="h-4 w-4 mr-2" />
                {savePricingCalculation.isPending
                  ? "Saving..."
                  : "Save Calculation"}
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Enter details and click "Calculate Price" to see the breakdown.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingCalculator;
