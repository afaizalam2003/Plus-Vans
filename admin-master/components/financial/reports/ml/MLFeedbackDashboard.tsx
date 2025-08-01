import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  TrendingUp,
  Target,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  Zap,
} from "lucide-react";

const MLFeedbackDashboard: React.FC = () => {
  const [isTraining, setIsTraining] = useState(false);

  const mlMetrics = {
    modelAccuracy: 87.3,
    predictionConfidence: 92.1,
    dailyPredictions: 1200,
    improvementRate: 15.2,
  };

  const trainingData = [
    {
      dataset: "Quote Accuracy",
      samples: 15000,
      accuracy: 89.2,
      lastTrained: "2 hours ago",
      status: "active",
    },
    {
      dataset: "Price Optimization",
      samples: 8500,
      accuracy: 85.7,
      lastTrained: "6 hours ago",
      status: "training",
    },
    {
      dataset: "Demand Prediction",
      samples: 12000,
      accuracy: 91.4,
      lastTrained: "1 day ago",
      status: "active",
    },
  ];

  const feedbackQueue = [
    {
      id: "1",
      type: "quote_adjustment",
      description: "Customer accepted quote 15% higher than predicted",
      confidence: "high",
      impact: "positive",
    },
    {
      id: "2",
      type: "pricing_error",
      description: "Underpredicted complex access requirements",
      confidence: "medium",
      impact: "negative",
    },
    {
      id: "3",
      type: "conversion_pattern",
      description: "Higher conversion rate in Central London",
      confidence: "high",
      impact: "positive",
    },
  ];

  const handleRetrainModel = async () => {
    setIsTraining(true);
    // Simulate training process
    setTimeout(() => {
      setIsTraining(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            ML Feedback & Optimization
          </h3>
          <p className="text-muted-foreground">
            Monitor machine learning model performance and feedback loops
          </p>
        </div>
        <Button onClick={handleRetrainModel} disabled={isTraining}>
          {isTraining ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          {isTraining ? "Training..." : "Retrain Models"}
        </Button>
      </div>

      {/* ML Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Model Accuracy</p>
                <p className="text-2xl font-bold">{mlMetrics.modelAccuracy}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={mlMetrics.modelAccuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Prediction Confidence
                </p>
                <p className="text-2xl font-bold">
                  {mlMetrics.predictionConfidence}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={mlMetrics.predictionConfidence} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Daily Predictions
                </p>
                <p className="text-2xl font-bold">
                  {mlMetrics.dailyPredictions.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Improvement Rate
                </p>
                <p className="text-2xl font-bold">
                  +{mlMetrics.improvementRate}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">Model Performance</TabsTrigger>
          <TabsTrigger value="feedback">Feedback Queue</TabsTrigger>
          <TabsTrigger value="optimization">Optimization Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>Training Data & Model Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingData.map((model, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{model.dataset}</h4>
                        <Badge
                          className={
                            model.status === "active"
                              ? "bg-green-100 text-green-800"
                              : model.status === "training"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {model.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{model.samples.toLocaleString()} samples</span>
                        <span>Accuracy: {model.accuracy}%</span>
                        <span>Last trained: {model.lastTrained}</span>
                      </div>
                    </div>
                    <Progress value={model.accuracy} className="w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Feedback Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackQueue.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          {feedback.type.replace("_", " ")}
                        </Badge>
                        <Badge
                          className={
                            feedback.impact === "positive"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {feedback.impact}
                        </Badge>
                        <Badge variant="secondary">
                          {feedback.confidence} confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {feedback.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Apply
                      </Button>
                      <Button size="sm" variant="ghost">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Revenue Optimization
                  </h4>
                  <p className="text-sm text-blue-700">
                    Model suggests increasing prices by 8-12% for Central London
                    weekday collections based on acceptance patterns.
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">
                    Demand Prediction
                  </h4>
                  <p className="text-sm text-green-700">
                    High demand expected for next weekend in South London.
                    Consider dynamic pricing adjustments for optimal capacity
                    utilization.
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2">
                    Cost Efficiency
                  </h4>
                  <p className="text-sm text-orange-700">
                    Route optimization suggests consolidating collections in NW
                    postcodes could reduce costs by 15%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MLFeedbackDashboard;
