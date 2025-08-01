import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import {
  useAIConfidenceScoring,
  usePricingRuleConflicts,
} from "@/components/hooks/useAIQuoteScenarios";

interface AIConfidenceDisplayProps {
  quoteId: string;
  aiConfidenceScores?: any;
}

const AIConfidenceDisplay: React.FC<AIConfidenceDisplayProps> = ({
  quoteId,
  aiConfidenceScores,
}) => {
  const { data: confidenceData } = useAIConfidenceScoring(quoteId);
  const { data: conflicts } = usePricingRuleConflicts(quoteId);

  const scores = aiConfidenceScores || confidenceData;

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 0.8) return { variant: "default", label: "High Confidence" };
    if (score >= 0.6)
      return { variant: "secondary", label: "Medium Confidence" };
    return { variant: "destructive", label: "Low Confidence" };
  };

  if (!scores && !confidenceData) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
          No AI confidence data available
        </CardContent>
      </Card>
    );
  }

  const confidenceScore =
    scores?.base_confidence_score || confidenceData?.base_confidence_score || 0;
  const badge = getConfidenceBadge(confidenceScore);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              AI Confidence Analysis
            </span>
            <Badge variant={badge.variant as any}>{badge.label}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Confidence */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Confidence</span>
              <span
                className={`text-sm font-bold ${getConfidenceColor(
                  confidenceScore
                )}`}
              >
                {Math.round(confidenceScore * 100)}%
              </span>
            </div>
            <Progress value={confidenceScore * 100} className="h-2" />
          </div>

          {/* Detailed Scores */}
          {scores && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Item Recognition</span>
                  <span
                    className={getConfidenceColor(
                      scores.item_recognition_confidence || 0
                    )}
                  >
                    {Math.round(
                      (scores.item_recognition_confidence || 0) * 100
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={(scores.item_recognition_confidence || 0) * 100}
                  className="h-1"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Quantity Estimation</span>
                  <span
                    className={getConfidenceColor(
                      scores.quantity_estimation_confidence || 0
                    )}
                  >
                    {Math.round(
                      (scores.quantity_estimation_confidence || 0) * 100
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={(scores.quantity_estimation_confidence || 0) * 100}
                  className="h-1"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Access Assessment</span>
                  <span
                    className={getConfidenceColor(
                      scores.access_assessment_confidence || 0
                    )}
                  >
                    {Math.round(
                      (scores.access_assessment_confidence || 0) * 100
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={(scores.access_assessment_confidence || 0) * 100}
                  className="h-1"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Pricing Model</span>
                  <span
                    className={getConfidenceColor(
                      scores.pricing_model_confidence || 0
                    )}
                  >
                    {Math.round((scores.pricing_model_confidence || 0) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(scores.pricing_model_confidence || 0) * 100}
                  className="h-1"
                />
              </div>
            </div>
          )}

          {/* Conflicts and Issues */}
          {conflicts && conflicts.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1 text-orange-500" />
                Pricing Rule Conflicts ({conflicts.length})
              </h4>
              <div className="space-y-2">
                {conflicts.slice(0, 2).map((conflict) => (
                  <div
                    key={conflict.id}
                    className="text-xs bg-orange-50 p-2 rounded"
                  >
                    <p className="font-medium">{conflict.conflict_type}</p>
                    <p className="text-muted-foreground">
                      Resolution: {conflict.resolution_strategy || "Pending"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Indicators */}
          <div className="flex gap-2 pt-2 border-t">
            {confidenceScore >= 0.8 ? (
              <div className="flex items-center text-xs text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready for automatic processing
              </div>
            ) : (
              <div className="flex items-center text-xs text-orange-600">
                <Clock className="h-3 w-3 mr-1" />
                Requires human review
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIConfidenceDisplay;
