import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, CheckCircle, AlertCircle, Eye } from "lucide-react";
import {
  useVisualRuleBuilder,
  useCreateVisualRule,
  usePublishVisualRule,
} from "@/components/hooks/useVisualRuleBuilder";

const VisualRuleBuilder: React.FC = () => {
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    rule_name: "",
    rule_definition: "",
    visual_config: "",
  });

  const { data: rules, isLoading } = useVisualRuleBuilder();
  const createRule = useCreateVisualRule();
  const publishRule = usePublishVisualRule();

  const handleCreateRule = () => {
    try {
      const ruleData = {
        rule_name: newRule.rule_name,
        rule_definition: JSON.parse(newRule.rule_definition || "{}"),
        visual_config: JSON.parse(newRule.visual_config || "{}"),
        validation_status: "pending",
        is_published: false,
        version: 1,
      };

      createRule.mutate(ruleData, {
        onSuccess: () => {
          setNewRule({ rule_name: "", rule_definition: "", visual_config: "" });
          setIsCreateRuleOpen(false);
        },
      });
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  };

  const handlePublishRule = (rule: any) => {
    publishRule.mutate({ ruleId: rule.id, ruleData: rule });
  };

  const getValidationStatusColor = (status: string) => {
    switch (status) {
      case "validated":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <div>Loading visual rule builder...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Visual Rule Builder
          </h3>
          <p className="text-muted-foreground">
            Create and manage pricing rules with a visual interface
          </p>
        </div>
        <Button onClick={() => setIsCreateRuleOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Rule
        </Button>
      </div>

      {isCreateRuleOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Visual Rule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rule_name">Rule Name</Label>
              <Input
                id="rule_name"
                value={newRule.rule_name}
                onChange={(e) =>
                  setNewRule({ ...newRule, rule_name: e.target.value })
                }
                placeholder="e.g., Weekend Surcharge Rule"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule_definition">Rule Definition (JSON)</Label>
              <textarea
                id="rule_definition"
                className="w-full p-2 border rounded-md h-24 text-sm"
                value={newRule.rule_definition}
                onChange={(e) =>
                  setNewRule({ ...newRule, rule_definition: e.target.value })
                }
                placeholder='{"conditions": [], "actions": [], "priority": 100}'
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visual_config">Visual Configuration (JSON)</Label>
              <textarea
                id="visual_config"
                className="w-full p-2 border rounded-md h-24 text-sm"
                value={newRule.visual_config}
                onChange={(e) =>
                  setNewRule({ ...newRule, visual_config: e.target.value })
                }
                placeholder='{"nodes": [], "connections": [], "layout": "flowchart"}'
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateRule}
                disabled={createRule.isPending}
              >
                {createRule.isPending ? "Creating..." : "Create Rule"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCreateRuleOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rules?.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{rule.rule_name}</CardTitle>
                <div className="flex gap-2">
                  <Badge
                    className={getValidationStatusColor(rule.validation_status)}
                  >
                    {rule.validation_status}
                  </Badge>
                  {rule.is_published && (
                    <Badge className="bg-blue-100 text-blue-800">
                      Published
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Version: {rule.version} | Created:{" "}
                  {new Date(rule.created_at).toLocaleDateString()}
                </div>

                {rule.validation_errors &&
                  Array.isArray(rule.validation_errors) &&
                  rule.validation_errors.length > 0 && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center text-red-800">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Validation Errors
                      </h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {rule.validation_errors.map(
                          (error: string, index: number) => (
                            <li key={index}>• {error}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>

                  {rule.validation_status === "validated" &&
                    !rule.is_published && (
                      <Button
                        size="sm"
                        onClick={() => handlePublishRule(rule)}
                        disabled={publishRule.isPending}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {publishRule.isPending ? "Publishing..." : "Publish"}
                      </Button>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VisualRuleBuilder;
