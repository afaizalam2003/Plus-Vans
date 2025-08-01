import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, Brain, Sparkles } from "lucide-react";
import { useCalculateAIEnhancedQuote } from "@/components/hooks/useAIQuoteScenarios";
import { useCalculateEnhancedPrice } from "@/components/hooks/useEnhancedQuotes";
import { useItemTypes } from "@/components/hooks/useItemTypes";
import AIConfidenceDisplay from "./AIConfidenceDisplay";

const EnhancedPricingCalculator: React.FC = () => {
  const [useAI, setUseAI] = useState(false);
  const [formData, setFormData] = useState({
    pickup_postcode: "",
    access_difficulty: "normal",
    items: [{ item_type_id: "", quantity: 1 }],
  });
  const [calculationResult, setCalculationResult] = useState<any>(null);

  const { data: itemTypes } = useItemTypes();
  const calculateEnhancedPrice = useCalculateEnhancedPrice();
  const calculateAIPrice = useCalculateAIEnhancedQuote();

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_type_id: "", quantity: 1 }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = formData.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, items: updatedItems });
  };

  const handleCalculate = () => {
    const calculationData = {
      items_data: formData.items,
      pickup_postcode: formData.pickup_postcode,
      access_difficulty: formData.access_difficulty,
    };

    if (useAI) {
      calculateAIPrice.mutate(calculationData, {
        onSuccess: (result) => {
          setCalculationResult(result);
        },
      });
    } else {
      calculateEnhancedPrice.mutate(calculationData, {
        onSuccess: (result) => {
          setCalculationResult(result);
        },
      });
    }
  };

  const isLoading =
    calculateEnhancedPrice.isPending || calculateAIPrice.isPending;
  const hasValidItems = formData.items.every(
    (item) => item.item_type_id && item.quantity > 0
  );
  const canCalculate = formData.pickup_postcode && hasValidItems;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Enhanced Pricing Calculator
            </span>
            <Button
              variant={useAI ? "default" : "outline"}
              size="sm"
              onClick={() => setUseAI(!useAI)}
              className="flex items-center gap-1"
            >
              <Brain className="h-4 w-4" />
              {useAI ? "AI Mode" : "Standard"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location and Access */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postcode">Pickup Postcode</Label>
              <Input
                id="postcode"
                value={formData.pickup_postcode}
                onChange={(e) =>
                  setFormData({ ...formData, pickup_postcode: e.target.value })
                }
                placeholder="Enter London postcode"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="access">Access Difficulty</Label>
              <Select
                value={formData.access_difficulty}
                onValueChange={(value) =>
                  setFormData({ ...formData, access_difficulty: value })
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
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Items to Collect</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                Add Item
              </Button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Select
                    value={item.item_type_id}
                    onValueChange={(value) =>
                      updateItem(index, "item_type_id", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select item type" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} ({type.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "quantity",
                        parseInt(e.target.value) || 1
                      )
                    }
                    placeholder="Qty"
                  />
                </div>
                {formData.items.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={handleCalculate}
            disabled={!canCalculate || isLoading}
            className="w-full"
          >
            {isLoading ? (
              "Calculating..."
            ) : (
              <span className="flex items-center gap-2">
                {useAI && <Sparkles className="h-4 w-4" />}
                Calculate {useAI ? "AI" : "Enhanced"} Price
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {/* Price Breakdown */}
        {calculationResult && (
          <Card>
            <CardHeader>
              <CardTitle>Price Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Base Collection Fee</p>
                    <p className="font-semibold">
                      £{calculationResult.base_collection_fee}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Item Disposal</p>
                    <p className="font-semibold">
                      £{calculationResult.item_disposal_costs}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Labour Costs</p>
                    <p className="font-semibold">
                      £{calculationResult.labor_costs}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Transport</p>
                    <p className="font-semibold">
                      £{calculationResult.transport_costs}
                    </p>
                  </div>
                </div>

                {calculationResult.london_charges > 0 && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">London Charges</p>
                    <p className="font-semibold">
                      £{calculationResult.london_charges}
                    </p>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">
                      £{calculationResult.total_amount}
                    </span>
                  </div>
                </div>

                {calculationResult.estimated_duration_hours && (
                  <div className="text-sm text-muted-foreground">
                    Estimated Duration:{" "}
                    {calculationResult.estimated_duration_hours} hours
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Confidence Display */}
        {useAI && calculationResult?.ai_confidence_scores && (
          <AIConfidenceDisplay
            quoteId=""
            aiConfidenceScores={calculationResult.ai_confidence_scores}
          />
        )}
      </div>
    </div>
  );
};

export default EnhancedPricingCalculator;
