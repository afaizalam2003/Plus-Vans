import React, { useState } from "react";
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
import { useCreateScenarioTemplate } from "@/components/hooks/useAIQuoteScenarios";

interface ScenarioTemplateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ScenarioTemplateDialog: React.FC<ScenarioTemplateDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const [formData, setFormData] = useState({
    template_name: "",
    scenario_type: "",
    template_description: "",
    typical_items: "",
    pricing_modifiers: "",
  });

  const createTemplate = useCreateScenarioTemplate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const templateData = {
        ...formData,
        typical_items: formData.typical_items
          ? JSON.parse(formData.typical_items)
          : [],
        pricing_modifiers: formData.pricing_modifiers
          ? JSON.parse(formData.pricing_modifiers)
          : {},
      };

      createTemplate.mutate(templateData, {
        onSuccess: () => {
          setFormData({
            template_name: "",
            scenario_type: "",
            template_description: "",
            typical_items: "",
            pricing_modifiers: "",
          });
          onOpenChange(false);
        },
      });
    } catch (error) {
      console.error("Error parsing JSON data:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Scenario Template</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template_name">Template Name</Label>
              <Input
                id="template_name"
                value={formData.template_name}
                onChange={(e) =>
                  setFormData({ ...formData, template_name: e.target.value })
                }
                placeholder="e.g., Standard House Clearance"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scenario_type">Scenario Type</Label>
              <Select
                value={formData.scenario_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, scenario_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scenario type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="office_clearance">
                    Office Clearance
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template_description">Description</Label>
            <Textarea
              id="template_description"
              value={formData.template_description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  template_description: e.target.value,
                })
              }
              placeholder="Describe this scenario template..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="typical_items">Typical Items (JSON)</Label>
            <Textarea
              id="typical_items"
              value={formData.typical_items}
              onChange={(e) =>
                setFormData({ ...formData, typical_items: e.target.value })
              }
              placeholder='[{"item": "furniture", "typical_quantity": "10-15 pieces"}]'
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricing_modifiers">Pricing Modifiers (JSON)</Label>
            <Textarea
              id="pricing_modifiers"
              value={formData.pricing_modifiers}
              onChange={(e) =>
                setFormData({ ...formData, pricing_modifiers: e.target.value })
              }
              placeholder='{"base_multiplier": 1.0, "crew_size_modifier": 1.2}'
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createTemplate.isPending}>
              {createTemplate.isPending ? "Creating..." : "Create Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScenarioTemplateDialog;
