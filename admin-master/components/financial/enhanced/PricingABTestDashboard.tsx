import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, BarChart3, TrendingUp, Users } from "lucide-react";
import {
  usePricingABTests,
  useABTestAssignments,
  useCreateABTest,
  useCalculateABTestSignificance,
} from "@/components/hooks/usePricingABTests";

const PricingABTestDashboard: React.FC = () => {
  const [isCreateTestOpen, setIsCreateTestOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string>("");
  const [newTest, setNewTest] = useState({
    test_name: "",
    description: "",
    strategy_a: "",
    strategy_b: "",
    allocation_percentage: 50,
  });

  const { data: tests, isLoading: testsLoading } = usePricingABTests();
  const { data: assignments } = useABTestAssignments(selectedTestId);
  const createTest = useCreateABTest();
  const calculateSignificance = useCalculateABTestSignificance();

  const handleCreateTest = () => {
    try {
      const testData = {
        test_name: newTest.test_name,
        description: newTest.description,
        strategy_a: JSON.parse(newTest.strategy_a || "{}"),
        strategy_b: JSON.parse(newTest.strategy_b || "{}"),
        allocation_percentage: newTest.allocation_percentage,
        status: "draft",
        confidence_level: 95.0,
      };

      createTest.mutate(testData, {
        onSuccess: () => {
          setNewTest({
            test_name: "",
            description: "",
            strategy_a: "",
            strategy_b: "",
            allocation_percentage: 50,
          });
          setIsCreateTestOpen(false);
        },
      });
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  };

  const handleCalculateSignificance = (testId: string) => {
    calculateSignificance.mutate(testId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (testsLoading) {
    return <div>Loading A/B tests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Pricing A/B Tests
          </h3>
          <p className="text-muted-foreground">
            Test and optimize pricing strategies with statistical analysis
          </p>
        </div>
        <Button onClick={() => setIsCreateTestOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New A/B Test
        </Button>
      </div>

      {isCreateTestOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Create New A/B Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="test_name">Test Name</Label>
                <Input
                  id="test_name"
                  value={newTest.test_name}
                  onChange={(e) =>
                    setNewTest({ ...newTest, test_name: e.target.value })
                  }
                  placeholder="e.g., Premium vs Standard Pricing"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allocation_percentage">
                  Strategy B Allocation (%)
                </Label>
                <Input
                  id="allocation_percentage"
                  type="number"
                  value={newTest.allocation_percentage}
                  onChange={(e) =>
                    setNewTest({
                      ...newTest,
                      allocation_percentage: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  max="99"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTest.description}
                onChange={(e) =>
                  setNewTest({ ...newTest, description: e.target.value })
                }
                placeholder="Describe the test objectives and hypothesis..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="strategy_a">Strategy A (Control) - JSON</Label>
                <Textarea
                  id="strategy_a"
                  value={newTest.strategy_a}
                  onChange={(e) =>
                    setNewTest({ ...newTest, strategy_a: e.target.value })
                  }
                  placeholder='{"base_multiplier": 1.0, "surcharge": 0}'
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="strategy_b">Strategy B (Variant) - JSON</Label>
                <Textarea
                  id="strategy_b"
                  value={newTest.strategy_b}
                  onChange={(e) =>
                    setNewTest({ ...newTest, strategy_b: e.target.value })
                  }
                  placeholder='{"base_multiplier": 1.1, "surcharge": 15}'
                  rows={4}
                />
              </div>
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
          <Card
            key={test.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedTestId(test.id)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{test.test_name}</CardTitle>
                <Badge className={getStatusColor(test.status)}>
                  {test.status}
                </Badge>
              </div>
              {test.description && (
                <p className="text-sm text-muted-foreground">
                  {test.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Allocation:</span>
                    <div className="mt-1">
                      <Progress
                        value={100 - test.allocation_percentage}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span>A: {100 - test.allocation_percentage}%</span>
                        <span>B: {test.allocation_percentage}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground">
                      Statistical Significance:
                    </span>
                    <div className="text-lg font-medium">
                      {test.statistical_significance
                        ? `${(test.statistical_significance * 100).toFixed(1)}%`
                        : "Not calculated"}
                    </div>
                  </div>
                </div>

                {test.results_summary &&
                  typeof test.results_summary === "object" && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Results Summary
                      </h4>
                      <div className="text-sm">
                        Recommended Action:{" "}
                        {(test.results_summary as any)?.recommended_action ||
                          "Not available"}
                      </div>
                    </div>
                  )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCalculateSignificance(test.id);
                    }}
                    disabled={calculateSignificance.isPending}
                  >
                    <BarChart3 className="h-3 w-3 mr-1" />
                    {calculateSignificance.isPending
                      ? "Calculating..."
                      : "Calculate Stats"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTestId && assignments && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Test Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              Total assignments: {assignments.length}
            </div>
            <div className="max-h-60 overflow-y-auto">
              {assignments.slice(0, 20).map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex justify-between items-center py-2 border-b"
                >
                  <span>{assignment.customer_identifier}</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        assignment.assigned_strategy === "A"
                          ? "secondary"
                          : "default"
                      }
                    >
                      Strategy {assignment.assigned_strategy}
                    </Badge>
                    {assignment.converted_at && (
                      <Badge className="bg-green-100 text-green-800">
                        Converted
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PricingABTestDashboard;
