import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, TestTube, TrendingUp } from "lucide-react";
import {
  useRuleTestingSandbox,
  useExecuteRuleTest,
  useCreateRuleTest,
} from "@/components/hooks/useRuleTestingSandbox";

const RuleTestingSandbox: React.FC = () => {
  const [isCreateTestOpen, setIsCreateTestOpen] = useState(false);
  const [newTest, setNewTest] = useState({
    test_name: "",
    test_scenario: "",
    rule_configurations: "",
  });

  const { data: tests, isLoading } = useRuleTestingSandbox();
  const executeTest = useExecuteRuleTest();
  const createTest = useCreateRuleTest();

  const handleCreateTest = () => {
    try {
      const testData = {
        test_name: newTest.test_name,
        test_scenario: JSON.parse(newTest.test_scenario || "{}"),
        rule_configurations: JSON.parse(newTest.rule_configurations || "[]"),
        status: "draft",
      };

      createTest.mutate(testData, {
        onSuccess: () => {
          setNewTest({
            test_name: "",
            test_scenario: "",
            rule_configurations: "",
          });
          setIsCreateTestOpen(false);
        },
      });
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  };

  const handleExecuteTest = (testId: string, scenario: any) => {
    executeTest.mutate({ testId, scenarioData: scenario });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "running":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <div>Loading rule testing sandbox...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold flex items-center">
            <TestTube className="h-5 w-5 mr-2" />
            Rule Testing Sandbox
          </h3>
          <p className="text-muted-foreground">
            Test and validate pricing rules in a controlled environment
          </p>
        </div>
        <Button onClick={() => setIsCreateTestOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Test
        </Button>
      </div>

      {isCreateTestOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Rule Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test_name">Test Name</Label>
              <Input
                id="test_name"
                value={newTest.test_name}
                onChange={(e) =>
                  setNewTest({ ...newTest, test_name: e.target.value })
                }
                placeholder="e.g., London Zone Pricing Test"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="test_scenario">Test Scenario (JSON)</Label>
              <Textarea
                id="test_scenario"
                value={newTest.test_scenario}
                onChange={(e) =>
                  setNewTest({ ...newTest, test_scenario: e.target.value })
                }
                placeholder='{"postcode": "SW1A 1AA", "items": [], "access_difficulty": "normal"}'
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule_configurations">
                Rule Configurations (JSON)
              </Label>
              <Textarea
                id="rule_configurations"
                value={newTest.rule_configurations}
                onChange={(e) =>
                  setNewTest({
                    ...newTest,
                    rule_configurations: e.target.value,
                  })
                }
                placeholder='[{"id": "rule1", "type": "surcharge", "amount": 25}]'
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateTest}
                disabled={createTest.isPending}
              >
                {createTest.isPending ? "Creating..." : "Create Test"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCreateTestOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tests?.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{test.test_name}</CardTitle>
                <Badge className={getStatusColor(test.status)}>
                  {test.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Created: {new Date(test.created_at).toLocaleDateString()}
                </div>

                {test.performance_metrics &&
                  typeof test.performance_metrics === "object" && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Performance Metrics
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          Execution Time:{" "}
                          {(test.performance_metrics as any)
                            ?.total_execution_time_ms || 0}
                          ms
                        </div>
                        <div>
                          Rules Tested:{" "}
                          {(test.performance_metrics as any)?.rules_tested || 0}
                        </div>
                        <div>
                          Success Rate:{" "}
                          {(test.performance_metrics as any)?.success_rate || 0}
                          %
                        </div>
                      </div>
                    </div>
                  )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      handleExecuteTest(test.id, test.test_scenario)
                    }
                    disabled={
                      executeTest.isPending || test.status === "running"
                    }
                  >
                    <Play className="h-3 w-3 mr-1" />
                    {executeTest.isPending ? "Running..." : "Run Test"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RuleTestingSandbox;
