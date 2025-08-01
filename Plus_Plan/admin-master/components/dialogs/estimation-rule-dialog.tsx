"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { EstimationRule } from "@/services/types";
import { useAppDispatch } from "@/redux/hooks";
import {
  createNewEstimationRule,
  updateEstimationRule,
  fetchEstimationRules,
} from "@/redux/slices/adminSlice";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface EstimationRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: EstimationRule | null;
  mode: "create" | "edit";
}

export function EstimationRuleDialog({
  open,
  onOpenChange,
  rule,
  mode,
}: EstimationRuleDialogProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<
    Omit<EstimationRule, "id" | "created_at" | "updated_at">
  >({
    rule_name: "",
    rule_description: null,
    rule_type: "base_rate_adjustment",
    min_value: null,
    max_value: null,
    multiplier: 1,
    active: true,
    currency: "GBP",
    zipcode: null,
    postcode_prefix: null,
    base_rate: null,
    hazard_surcharge: null,
    access_fee: null,
    dismantling_fee: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form data when the dialog opens or the rule changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && rule) {
        setFormData({
          rule_name: rule.rule_name,
          rule_description: rule.rule_description,
          rule_type: rule.rule_type,
          min_value: rule.min_value,
          max_value: rule.max_value,
          multiplier: rule.multiplier,
          active: rule.active,
          currency: rule.currency,
          zipcode: rule.zipcode,
          postcode_prefix: rule.postcode_prefix,
          base_rate: rule.base_rate,
          hazard_surcharge: rule.hazard_surcharge,
          access_fee: rule.access_fee,
          dismantling_fee: rule.dismantling_fee,
        });
      } else {
        // Reset form data for create mode
        setFormData({
          rule_name: "",
          rule_description: null,
          rule_type: "base_rate_adjustment",
          min_value: null,
          max_value: null,
          multiplier: 1,
          active: true,
          currency: "GBP",
          zipcode: null,
          postcode_prefix: null,
          base_rate: null,
          hazard_surcharge: null,
          access_fee: null,
          dismantling_fee: null,
        });
      }
      // Clear any previous errors
      setErrors({});
    }
  }, [open, rule, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.rule_name.trim()) {
      newErrors.rule_name = "Rule name is required";
    }

    if (formData.min_value !== null && formData.max_value !== null) {
      if (formData.min_value > formData.max_value) {
        newErrors.min_value = "Min value must be less than max value";
      }
    }

    if (formData.multiplier <= 0) {
      newErrors.multiplier = "Multiplier must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === "create") {
        await dispatch(createNewEstimationRule(formData)).unwrap();
        toast.success("Rule created successfully");
      } else if (rule?.id) {
        await dispatch(
          updateEstimationRule({
            ruleId: rule.id,
            ruleData: formData,
          })
        ).unwrap();
        toast.success("Rule updated successfully");
      }

      await dispatch(fetchEstimationRules());
      onOpenChange(false);
    } catch (error) {
      toast.error(`Failed to ${mode === "create" ? "create" : "update"} rule`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#635bff]">
            {mode === "create" ? "Create New Rule" : "Edit Rule"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new pricing rule to the estimation engine"
              : "Modify the existing pricing rule properties"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="rule_name" className="text-[#635bff]">
              Rule Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="rule_name"
              value={formData.rule_name}
              onChange={(e) =>
                setFormData({ ...formData, rule_name: e.target.value })
              }
              className={cn(
                "border-[#635bff]/20 focus-visible:ring-[#635bff]/50",
                errors.rule_name && "border-red-500"
              )}
              placeholder="Enter a descriptive name"
              required
            />
            {errors.rule_name && (
              <div className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-4 w-4" />
                {errors.rule_name}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="rule_type" className="text-[#635bff]">
              Rule Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.rule_type}
              onValueChange={(value: EstimationRule["rule_type"]) =>
                setFormData({ ...formData, rule_type: value })
              }
            >
              <SelectTrigger className="border-[#635bff]/20 focus-visible:ring-[#635bff]/50">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="base_rate_adjustment">
                  Base Rate Adjustment
                </SelectItem>
                <SelectItem value="hazard_multiplier">
                  Hazard Multiplier
                </SelectItem>
                <SelectItem value="location_modifier">
                  Location Modifier
                </SelectItem>
                <SelectItem value="dismantling_fee_adjustment">
                  Dismantling Fee Adjustment
                </SelectItem>
                <SelectItem value="volume_estimation">
                  Volume Estimation
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rule_description" className="text-[#635bff]">
              Description
            </Label>
            <Textarea
              id="rule_description"
              value={formData.rule_description || ""}
              onChange={(e) =>
                setFormData({ ...formData, rule_description: e.target.value })
              }
              placeholder="Enter an optional description"
              className="border-[#635bff]/20 focus-visible:ring-[#635bff]/50 min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_value" className="text-[#635bff]">
                Min Value
              </Label>
              <Input
                id="min_value"
                type="number"
                value={formData.min_value ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_value: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  })
                }
                placeholder="Minimum value"
                className={cn(
                  "border-[#635bff]/20 focus-visible:ring-[#635bff]/50",
                  errors.min_value && "border-red-500"
                )}
              />
              {errors.min_value && (
                <div className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.min_value}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_value" className="text-[#635bff]">
                Max Value
              </Label>
              <Input
                id="max_value"
                type="number"
                value={formData.max_value ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_value: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  })
                }
                placeholder="Maximum value"
                className="border-[#635bff]/20 focus-visible:ring-[#635bff]/50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="multiplier" className="text-[#635bff]">
              Multiplier <span className="text-red-500">*</span>
            </Label>
            <Input
              id="multiplier"
              type="number"
              step="0.01"
              value={formData.multiplier}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  multiplier: parseFloat(e.target.value) || 1,
                })
              }
              className={cn(
                "border-[#635bff]/20 focus-visible:ring-[#635bff]/50",
                errors.multiplier && "border-red-500"
              )}
              required
            />
            {errors.multiplier && (
              <div className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-4 w-4" />
                {errors.multiplier}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="active" className="text-[#635bff]">
              Active
            </Label>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, active: checked })
              }
              className="data-[state=checked]:bg-[#635bff]"
            />
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-[#635bff]">
                Location Settings
              </h3>
              <div className="space-y-2">
                <Label
                  htmlFor="postcode_prefix"
                  className="text-muted-foreground text-sm"
                >
                  Postcode Prefix
                </Label>
                <Input
                  id="postcode_prefix"
                  value={formData.postcode_prefix || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      postcode_prefix: e.target.value,
                    })
                  }
                  placeholder="E.g., SW1, NW3"
                  className="border-[#635bff]/20 focus-visible:ring-[#635bff]/50"
                />
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-medium text-[#635bff] mb-2">
                Fee Components
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {formData.rule_type === "base_rate_adjustment" && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="base_rate"
                      className="text-muted-foreground text-sm"
                    >
                      Base Rate
                    </Label>
                    <Input
                      id="base_rate"
                      type="number"
                      step="0.01"
                      value={formData.base_rate ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          base_rate: e.target.value
                            ? parseFloat(e.target.value)
                            : null,
                        })
                      }
                      placeholder="Base fee amount"
                      className="border-[#635bff]/20 focus-visible:ring-[#635bff]/50"
                    />
                  </div>
                )}
                {formData.rule_type === "hazard_multiplier" && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="hazard_surcharge"
                      className="text-muted-foreground text-sm"
                    >
                      Hazard Surcharge
                    </Label>
                    <Input
                      id="hazard_surcharge"
                      type="number"
                      step="0.01"
                      value={formData.hazard_surcharge ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hazard_surcharge: e.target.value
                            ? parseFloat(e.target.value)
                            : null,
                        })
                      }
                      placeholder="Hazard surcharge amount"
                      className="border-[#635bff]/20 focus-visible:ring-[#635bff]/50"
                    />
                  </div>
                )}
                {formData.rule_type === "dismantling_fee_adjustment" && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="dismantling_fee"
                      className="text-muted-foreground text-sm"
                    >
                      Dismantling Fee
                    </Label>
                    <Input
                      id="dismantling_fee"
                      type="number"
                      step="0.01"
                      value={formData.dismantling_fee ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dismantling_fee: e.target.value
                            ? parseFloat(e.target.value)
                            : null,
                        })
                      }
                      placeholder="Dismantling fee amount"
                      className="border-[#635bff]/20 focus-visible:ring-[#635bff]/50"
                    />
                  </div>
                )}
                {formData.rule_type === "location_modifier" && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="access_fee"
                      className="text-muted-foreground text-sm"
                    >
                      Access Fee
                    </Label>
                    <Input
                      id="access_fee"
                      type="number"
                      step="0.01"
                      value={formData.access_fee ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          access_fee: e.target.value
                            ? parseFloat(e.target.value)
                            : null,
                        })
                      }
                      placeholder="Access fee amount"
                      className="border-[#635bff]/20 focus-visible:ring-[#635bff]/50"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#635bff] hover:bg-[#635bff]/90"
            >
              {loading
                ? "Saving..."
                : mode === "create"
                ? "Create Rule"
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
