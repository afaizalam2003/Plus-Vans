import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Edit, Trash2 } from "lucide-react";
import { usePricingRules, useDeletePricingRule } from "../hooks/usePricingRules";

const PricingRulesManagement: React.FC = () => {
  const { data: rules, isLoading } = usePricingRules();
  const deletePricingRule = useDeletePricingRule();

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case "base_rate":
        return "default";
      case "modifier":
        return "secondary";
      case "surcharge":
        return "destructive";
      case "discount":
        return "default";
      default:
        return "secondary";
    }
  };

  const handleDeleteRule = (id: string) => {
    if (window.confirm("Are you sure you want to delete this pricing rule?")) {
      deletePricingRule.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading pricing rules...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Pricing Rules Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Amount/Rate</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules?.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">{rule.rule_name}</TableCell>
                <TableCell>
                  <Badge variant={getRuleTypeColor(rule.rule_type)}>
                    {rule.rule_type}
                  </Badge>
                </TableCell>
                <TableCell>{rule.condition_type}</TableCell>
                <TableCell>{rule.calculation_method}</TableCell>
                <TableCell>
                  {rule.calculation_method === "fixed"
                    ? `£${rule.base_amount}`
                    : `${rule.percentage_rate}%`}
                </TableCell>
                <TableCell>{rule.priority}</TableCell>
                <TableCell>
                  <Badge variant={rule.is_active ? "default" : "secondary"}>
                    {rule.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteRule(rule.id)}
                      disabled={deletePricingRule.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rules?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  No pricing rules found. Create your first rule to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PricingRulesManagement;
