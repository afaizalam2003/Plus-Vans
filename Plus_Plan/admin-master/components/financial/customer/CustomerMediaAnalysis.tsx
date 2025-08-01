import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Eye,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

interface CustomerMediaAnalysisProps {
  bookings: any[];
}

const CustomerMediaAnalysis: React.FC<CustomerMediaAnalysisProps> = ({
  bookings,
}) => {
  // Get all vision analysis results from bookings
  const getAnalysisResults = () => {
    return (
      bookings?.flatMap(
        (booking) =>
          booking.vision_analysis_results?.map((result: any) => ({
            ...result,
            bookingId: booking.id,
            bookingAddress: booking.address,
            bookingStatus: booking.status,
          })) || []
      ) || []
    );
  };

  const analysisResults = getAnalysisResults();
  const totalAnalyses = analysisResults.length;
  const recentAnalyses = analysisResults.filter(
    (result) =>
      new Date(result.created_at) >
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  if (analysisResults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Vision Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              No AI analysis results found
            </p>
            <p className="text-sm text-muted-foreground">
              Vision analysis results from customer bookings will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Analyses</p>
                <p className="text-2xl font-bold">{totalAnalyses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Recent (30 days)</p>
                <p className="text-2xl font-bold">{recentAnalyses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Avg per Booking</p>
                <p className="text-2xl font-bold">
                  {bookings.length > 0
                    ? (totalAnalyses / bookings.length).toFixed(1)
                    : "0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results List */}
      <Card>
        <CardHeader>
          <CardTitle>AI Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysisResults
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )
              .map((result) => (
                <div
                  key={result.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">
                        Analysis #{result.id.slice(-8)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {format(
                          new Date(result.created_at),
                          "MMM d, yyyy HH:mm"
                        )}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Booking: {result.bookingAddress}
                  </div>

                  {/* Analysis Summary */}
                  {result.result_json && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <h4 className="text-sm font-medium mb-2">
                        Analysis Summary
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        {typeof result.result_json === "object" ? (
                          <div className="space-y-1">
                            {Object.entries(result.result_json)
                              .slice(0, 3)
                              .map(([key, value]) => (
                                <div key={key} className="flex gap-2">
                                  <span className="font-medium capitalize">
                                    {key}:
                                  </span>
                                  <span>{String(value).slice(0, 50)}...</span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p>AI analysis data available</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify
                    </Button>
                    <Button variant="outline" size="sm">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Flag Issue
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerMediaAnalysis;
