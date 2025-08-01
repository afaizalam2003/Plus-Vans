import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Plus, TrendingUp, Settings, AlertTriangle } from "lucide-react";
import {
  useScenarioTemplates,
  useAIQuotePipeline,
} from "@/components/hooks/useAIQuoteScenarios";
import ScenarioTemplateDialog from "./ScenarioTemplateDialog";

const AIQuoteScenarios: React.FC = () => {
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const { data: scenarios, isLoading: scenariosLoading } =
    useScenarioTemplates();
  const { data: pipeline, isLoading: pipelineLoading } = useAIQuotePipeline();

  const getScenarioTypeColor = (type: string) => {
    switch (type) {
      case "residential":
        return "bg-blue-100 text-blue-800";
      case "commercial":
        return "bg-green-100 text-green-800";
      case "construction":
        return "bg-orange-100 text-orange-800";
      case "office_clearance":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStageStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "requires_review":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (scenariosLoading || pipelineLoading) {
    return <div>Loading AI quote scenarios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            AI Quote Scenarios & Templates
          </h3>
          <p className="text-muted-foreground">
            Manage AI-powered quote generation scenarios and templates
          </p>
        </div>
        <Button onClick={() => setIsCreateTemplateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Scenario Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scenarios?.map((scenario) => (
                <div key={scenario.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{scenario.template_name}</h4>
                    <Badge
                      className={getScenarioTypeColor(scenario.scenario_type)}
                    >
                      {scenario.scenario_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {scenario.template_description}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">
                      Used {scenario.usage_frequency} times
                    </span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <TrendingUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Pipeline Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              AI Pipeline Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipeline?.slice(0, 5).map((stage) => (
                <div key={stage.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{stage.pipeline_stage}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(stage.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={getStageStatusColor(stage.stage_status)}>
                      {stage.stage_status}
                    </Badge>
                  </div>
                  {stage.confidence_score && (
                    <div className="flex items-center gap-2 text-sm">
                      <span>Confidence:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${stage.confidence_score * 100}%` }}
                        ></div>
                      </div>
                      <span>{Math.round(stage.confidence_score * 100)}%</span>
                    </div>
                  )}
                  {stage.human_review_required && (
                    <div className="flex items-center gap-1 text-orange-600 text-xs mt-2">
                      <AlertTriangle className="h-3 w-3" />
                      Human review required
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <ScenarioTemplateDialog
        isOpen={isCreateTemplateOpen}
        onOpenChange={setIsCreateTemplateOpen}
      />
    </div>
  );
};

export default AIQuoteScenarios;
