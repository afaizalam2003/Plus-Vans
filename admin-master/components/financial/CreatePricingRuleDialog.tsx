import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useForm } from "react-hook-form";
import { useCreatePricingRule } from "../hooks/usePricingRules";

interface CreatePricingRuleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RuleFormData {
  rule_name: string;
  rule_type: string;
  condition_type: string;
  calculation_method: string;
  base_amount?: number;
  percentage_rate?: number;
  min_amount?: number;
  max_amount?: number;
  priority: number;
  description: string;
  applies_to: string;
}

const CreatePricingRuleDialog: React.FC<CreatePricingRuleDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RuleFormData>();
  const createPricingRule = useCreatePricingRule();

  const calculationMethod = watch("calculation_method");

  const onSubmit = (data: RuleFormData) => {
    const ruleData = {
      ...data,
      condition_values: {},
      is_active: true,
    };

    createPricingRule.mutate(ruleData, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Pricing Rule</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rule_name">Rule Name</Label>
              <Input
                id="rule_name"
                {...register("rule_name", {
                  required: "Rule name is required",
                })}
                placeholder="Enter rule name"
              />
              {errors.rule_name && (
                <p className="text-sm text-red-500">
                  {errors.rule_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule_type">Rule Type</Label>
              <Select
                onValueChange={(value) =>
                  register("rule_type").onChange({ target: { value } })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rule type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base_rate">Base Rate</SelectItem>
                  <SelectItem value="modifier">Modifier</SelectItem>
                  <SelectItem value="surcharge">Surcharge</SelectItem>
                  <SelectItem value="discount">Discount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condition_type">Condition Type</Label>
              <Select
                onValueChange={(value) =>
                  register("condition_type").onChange({ target: { value } })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postcode">Postcode</SelectItem>
                  <SelectItem value="item_type">Item Type</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="access_difficulty">
                    Access Difficulty
                  </SelectItem>
                  <SelectItem value="time_of_day">Time of Day</SelectItem>
                  <SelectItem value="day_of_week">Day of Week</SelectItem>
                  <SelectItem value="special_handling">
                    Special Handling
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calculation_method">Calculation Method</Label>
              <Select
                onValueChange={(value) =>
                  register("calculation_method").onChange({ target: { value } })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="per_unit">Per Unit</SelectItem>
                  <SelectItem value="tiered">Tiered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {calculationMethod === "fixed" && (
              <div className="space-y-2">
                <Label htmlFor="base_amount">Fixed Amount (£)</Label>
                <Input
                  id="base_amount"
                  type="number"
                  step="0.01"
                  {...register("base_amount", { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
            )}

            {calculationMethod === "percentage" && (
              <div className="space-y-2">
                <Label htmlFor="percentage_rate">Percentage Rate (%)</Label>
                <Input
                  id="percentage_rate"
                  type="number"
                  step="0.01"
                  {...register("percentage_rate", { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                {...register("priority", { valueAsNumber: true })}
                placeholder="100"
                defaultValue={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="applies_to">Applies To</Label>
              <Select
                onValueChange={(value) =>
                  register("applies_to").onChange({ target: { value } })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total">Total</SelectItem>
                  <SelectItem value="labor">Labor</SelectItem>
                  <SelectItem value="disposal">Disposal</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe when this rule applies"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createPricingRule.isPending}>
              {createPricingRule.isPending ? "Creating..." : "Create Rule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePricingRuleDialog;
