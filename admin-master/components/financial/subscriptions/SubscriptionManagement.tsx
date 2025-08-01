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
import { CreditCard, Eye, Pause, Play } from "lucide-react";
import { useSubscriptions } from "@/components/hooks/useSubscriptions";

const SubscriptionManagement: React.FC = () => {
  const { data: subscriptions, isLoading } = useSubscriptions();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "canceled":
        return "secondary";
      case "past_due":
        return "destructive";
      case "unpaid":
        return "destructive";
      case "trialing":
        return "default";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return <div>Loading subscriptions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Subscription Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current Period</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions?.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell className="font-medium">
                  {subscription.customer_id}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{subscription.plan_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {subscription.billing_interval}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {subscription.currency} {subscription.amount}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(subscription.status)}>
                    {subscription.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>
                      {new Date(
                        subscription.current_period_start
                      ).toLocaleDateString()}
                    </div>
                    <div className="text-muted-foreground">
                      to{" "}
                      {new Date(
                        subscription.current_period_end
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {subscription.status === "active" ? (
                      <Button size="sm" variant="outline">
                        <Pause className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {subscriptions?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No subscriptions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SubscriptionManagement;
