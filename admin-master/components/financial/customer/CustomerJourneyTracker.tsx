import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useCustomerJourneyStages } from "@/components/hooks/useCustomerIntelligence";

interface CustomerJourneyTrackerProps {
  customerEmail?: string;
}

const CustomerJourneyTracker: React.FC<CustomerJourneyTrackerProps> = ({
  customerEmail,
}) => {
  const { data: journeyStages = [], isLoading } =
    useCustomerJourneyStages(customerEmail);

  const getStageColor = (stageName: string) => {
    switch (stageName) {
      case "prospect":
        return "bg-blue-100 text-blue-800";
      case "first_time":
        return "bg-green-100 text-green-800";
      case "returning":
        return "bg-purple-100 text-purple-800";
      case "loyal":
        return "bg-yellow-100 text-yellow-800";
      case "at_risk":
        return "bg-orange-100 text-orange-800";
      case "churned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStageIcon = (stageName: string) => {
    switch (stageName) {
      case "prospect":
        return <TrendingUp className="h-4 w-4" />;
      case "first_time":
        return <CheckCircle className="h-4 w-4" />;
      case "returning":
        return <ArrowRight className="h-4 w-4" />;
      case "loyal":
        return <CheckCircle className="h-4 w-4" />;
      case "at_risk":
        return <AlertTriangle className="h-4 w-4" />;
      case "churned":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStageProgress = (stageName: string) => {
    switch (stageName) {
      case "prospect":
        return 10;
      case "first_time":
        return 30;
      case "returning":
        return 50;
      case "loyal":
        return 80;
      case "at_risk":
        return 65;
      case "churned":
        return 100;
      default:
        return 0;
    }
  };

  const currentStage = journeyStages.find((stage) => stage.is_current_stage);
  const stageHistory = journeyStages.filter((stage) => !stage.is_current_stage);

  if (isLoading) {
    return <div>Loading customer journey...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Customer Journey Tracking</h3>
        <p className="text-muted-foreground">
          Monitor customer lifecycle and stage progression
        </p>
      </div>

      {/* Current Stage */}
      {currentStage && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStageIcon(currentStage.stage_name)}
              Current Stage:{" "}
              {currentStage.stage_name.replace("_", " ").toUpperCase()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Stage Information</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Started:</span>{" "}
                    {new Date(
                      currentStage.stage_start_date
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Duration:</span>{" "}
                    {Math.floor(
                      (new Date().getTime() -
                        new Date(currentStage.stage_start_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </p>
                  {currentStage.trigger_event && (
                    <p>
                      <span className="text-muted-foreground">
                        Triggered by:
                      </span>{" "}
                      {currentStage.trigger_event}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Progress & Actions</h4>
                <Progress
                  value={getStageProgress(currentStage.stage_name)}
                  className="w-full"
                />
                {currentStage.next_recommended_action && (
                  <p className="text-sm text-blue-600 font-medium">
                    Recommended: {currentStage.next_recommended_action}
                  </p>
                )}
              </div>
            </div>

            {currentStage.automated_actions_taken &&
              currentStage.automated_actions_taken.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">
                    Automated Actions Taken
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {currentStage.automated_actions_taken.map(
                      (action, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {action}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}

            {currentStage.stage_metrics &&
              Object.keys(currentStage.stage_metrics).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Stage Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(currentStage.stage_metrics).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="text-center p-2 bg-muted rounded"
                        >
                          <p className="text-xs text-muted-foreground">
                            {key.replace("_", " ")}
                          </p>
                          <p className="text-sm font-medium">{String(value)}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Stage History */}
      {stageHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Journey History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stageHistory.map((stage, index) => (
                <div
                  key={stage.id}
                  className="flex items-center gap-4 p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {getStageIcon(stage.stage_name)}
                    <Badge className={getStageColor(stage.stage_name)}>
                      {stage.stage_name.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Started:</span>{" "}
                      {new Date(stage.stage_start_date).toLocaleDateString()}
                    </div>
                    {stage.stage_end_date && (
                      <div>
                        <span className="text-muted-foreground">Ended:</span>{" "}
                        {new Date(stage.stage_end_date).toLocaleDateString()}
                      </div>
                    )}
                    {stage.stage_duration_days && (
                      <div>
                        <span className="text-muted-foreground">Duration:</span>{" "}
                        {stage.stage_duration_days} days
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {journeyStages.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Journey Data</h3>
            <p className="text-muted-foreground">
              {customerEmail
                ? `No journey stages found for ${customerEmail}`
                : "Enter a customer email to view their journey progression."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerJourneyTracker;
