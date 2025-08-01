"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { EstimationRule } from "@/services/types";
import { Card } from "@/components/ui/card";
import { CalendarClock, Hash, MapPin, Pencil, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface EstimationRuleViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: EstimationRule | null;
  onEdit?: (rule: EstimationRule) => void;
}

export function EstimationRuleView({
  open,
  onOpenChange,
  rule,
  onEdit,
}: EstimationRuleViewProps) {
  if (!rule) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy HH:mm");
  };

  const ruleTypeLabels: Record<EstimationRule["rule_type"], string> = {
    base_rate_adjustment: "Base Rate Adjustment",
    hazard_multiplier: "Hazard Multiplier",
    location_modifier: "Location Modifier",
    dismantling_fee_adjustment: "Dismantling Fee Adjustment",
    volume_estimation: "Volume Estimation",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-[#635bff]">
              {rule.rule_name}
            </DialogTitle>
            <Badge
              variant={rule.active ? "default" : "secondary"}
              className={cn(
                rule.active
                  ? "bg-[#635bff] text-white"
                  : "bg-gray-100 text-gray-800"
              )}
            >
              {rule.active ? "Active" : "Inactive"}
            </Badge>
          </div>
          {rule.rule_description && (
            <p className="text-muted-foreground mt-2">
              {rule.rule_description}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <Card className="p-4 space-y-2 border-[#635bff]/20 hover:border-[#635bff]/40 transition-colors">
            <div className="flex items-center">
              <Settings className="h-4 w-4 text-[#635bff] mr-2" />
              <h3 className="font-semibold text-[#635bff]">
                Basic Information
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Rule Type</p>
                <p className="font-medium">{ruleTypeLabels[rule.rule_type]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Multiplier</p>
                <p className="font-medium">×{rule.multiplier}</p>
              </div>
            </div>
          </Card>

          {/* Value Range */}
          <Card className="p-4 space-y-2 border-[#635bff]/20 hover:border-[#635bff]/40 transition-colors">
            <div className="flex items-center">
              <Hash className="h-4 w-4 text-[#635bff] mr-2" />
              <h3 className="font-semibold text-[#635bff]">Value Range</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Minimum Value</p>
                <p className="font-medium">
                  {rule.min_value !== null
                    ? `${rule.min_value} ${rule.currency}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maximum Value</p>
                <p className="font-medium">
                  {rule.max_value !== null
                    ? `${rule.max_value} ${rule.currency}`
                    : "N/A"}
                </p>
              </div>
            </div>
          </Card>

          {/* Location Information */}
          <Card className="p-4 space-y-2 border-[#635bff]/20 hover:border-[#635bff]/40 transition-colors">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-[#635bff] mr-2" />
              <h3 className="font-semibold text-[#635bff]">
                Location Information
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Postcode Prefix</p>
                <p className="font-medium">{rule.postcode_prefix || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Zipcode</p>
                <p className="font-medium">{rule.zipcode || "N/A"}</p>
              </div>
            </div>
          </Card>

          {/* Additional Fees */}
          <Card className="p-4 space-y-2 border-[#635bff]/20 hover:border-[#635bff]/40 transition-colors">
            <div className="flex items-center">
              <CalendarClock className="h-4 w-4 text-[#635bff] mr-2" />
              <h3 className="font-semibold text-[#635bff]">Fee Components</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Base Rate</p>
                <p className="font-medium">
                  {rule.base_rate !== null
                    ? `${rule.base_rate} ${rule.currency}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Hazard Surcharge
                </p>
                <p className="font-medium">
                  {rule.hazard_surcharge !== null
                    ? `${rule.hazard_surcharge} ${rule.currency}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Access Fee</p>
                <p className="font-medium">
                  {rule.access_fee !== null
                    ? `${rule.access_fee} ${rule.currency}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dismantling Fee</p>
                <p className="font-medium">
                  {rule.dismantling_fee !== null
                    ? `${rule.dismantling_fee} ${rule.currency}`
                    : "N/A"}
                </p>
              </div>
            </div>
          </Card>

          {/* Metadata */}
          <div className="text-sm text-muted-foreground space-y-1 pt-2">
            <p>Created: {formatDate(rule.created_at)}</p>
            <p>Last Updated: {formatDate(rule.updated_at)}</p>
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"
          >
            Close
          </Button>
          {onEdit && (
            <Button
              onClick={() => {
                onEdit(rule);
                onOpenChange(false);
              }}
              className="bg-[#635bff] hover:bg-[#635bff]/90"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Rule
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
