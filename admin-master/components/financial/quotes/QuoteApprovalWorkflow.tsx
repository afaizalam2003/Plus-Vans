import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Clock, ArrowRight, User } from "lucide-react";
import {
  useQuoteApprovalWorkflow,
  useAdvanceWorkflowStage,
} from "@/hooks/useQuoteApprovalWorkflow";
import { useState } from "react";

interface QuoteApprovalWorkflowProps {
  quoteId: string;
}

const QuoteApprovalWorkflow: React.FC<QuoteApprovalWorkflowProps> = ({
  quoteId,
}) => {
  const [notes, setNotes] = useState("");
  const { data: workflow, isLoading } = useQuoteApprovalWorkflow(quoteId);
  const advanceStage = useAdvanceWorkflowStage();

  const workflowStages = [
    { id: "draft", label: "Draft", description: "Quote is being prepared" },
    { id: "review", label: "Review", description: "Under review" },
    {
      id: "pricing_approval",
      label: "Pricing Approval",
      description: "Pricing needs approval",
    },
    {
      id: "final_approval",
      label: "Final Approval",
      description: "Final approval required",
    },
    {
      id: "customer_sent",
      label: "Sent to Customer",
      description: "Quote sent to customer",
    },
  ];

  const currentStage =
    workflow?.[workflow.length - 1]?.workflow_stage || "draft";
  const currentStageIndex = workflowStages.findIndex(
    (stage) => stage.id === currentStage
  );

  const handleAdvanceStage = (newStage: string) => {
    advanceStage.mutate({
      quoteId,
      newStage,
      notes: notes.trim() || undefined,
    });
    setNotes("");
  };

  const getNextStage = () => {
    const nextIndex = currentStageIndex + 1;
    return nextIndex < workflowStages.length ? workflowStages[nextIndex] : null;
  };

  const getStageColor = (stageId: string) => {
    const stageIndex = workflowStages.findIndex(
      (stage) => stage.id === stageId
    );
    if (stageIndex < currentStageIndex) return "default";
    if (stageIndex === currentStageIndex) return "default";
    return "secondary";
  };

  if (isLoading) {
    return <div>Loading workflow...</div>;
  }

  const nextStage = getNextStage();

  return (
    <div className="space-y-6">
      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Approval Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 overflow-x-auto">
            {workflowStages.map((stage, index) => (
              <div
                key={stage.id}
                className="flex items-center space-x-2 min-w-0"
              >
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index <= currentStageIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {index < currentStageIndex ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <Badge
                      variant={getStageColor(stage.id)}
                      className="text-xs"
                    >
                      {stage.label}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stage.description}
                    </p>
                  </div>
                </div>
                {index < workflowStages.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advance Stage */}
      {nextStage && (
        <Card>
          <CardHeader>
            <CardTitle>Advance to Next Stage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Ready to advance to: <strong>{nextStage.label}</strong>
              </p>
              <Textarea
                placeholder="Add notes for this stage advancement (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <Button
              onClick={() => handleAdvanceStage(nextStage.id)}
              disabled={advanceStage.isPending}
              className="w-full"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Advance to {nextStage.label}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Workflow History */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workflow?.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start space-x-3 p-3 border rounded-lg"
              >
                <User className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {workflowStages.find((s) => s.id === entry.workflow_stage)
                        ?.label || entry.workflow_stage}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {entry.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {workflow?.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                No workflow history yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuoteApprovalWorkflow;
