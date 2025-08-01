import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, X, MoreHorizontal, RefreshCw, AlertCircle } from 'lucide-react';

const SubscriptionsManagement = () => {
  // Mock data - replace with real data from your API
  const subscriptions = [
    { id: 'SUB-001', customer: 'Acme Inc.', plan: 'Enterprise', amount: 999, status: 'active', nextBilling: '2023-07-15', users: 25 },
    { id: 'SUB-002', customer: 'Globex Corp', plan: 'Professional', amount: 499, status: 'active', nextBilling: '2023-07-20', users: 10 },
    { id: 'SUB-003', customer: 'Soylent Corp', plan: 'Starter', amount: 99, status: 'past_due', nextBilling: '2023-07-05', users: 3 },
    { id: 'SUB-004', customer: 'Initech LLC', plan: 'Professional', amount: 499, status: 'canceled', nextBilling: '-', users: 0 },
    { id: 'SUB-005', customer: 'Umbrella Corp', plan: 'Enterprise', amount: 999, status: 'active', nextBilling: '2023-07-25', users: 50 },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>;
      case 'canceled':
        return <Badge className="bg-gray-100 text-gray-800">Canceled</Badge>;
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Check className="h-4 w-4 text-green-500 mr-1" />;
      case 'past_due':
        return <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />;
      case 'canceled':
        return <X className="h-4 w-4 text-gray-500 mr-1" />;
      default:
        return <RefreshCw className="h-4 w-4 text-blue-500 mr-1" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Subscriptions</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Subscription
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Recurring Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,497</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Revenue Per User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$499.40</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.2%</div>
            <p className="text-xs text-muted-foreground">-0.8% from last month</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subscription</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Next Billing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.id}</TableCell>
                <TableCell>{sub.customer}</TableCell>
                <TableCell>{sub.plan}</TableCell>
                <TableCell>${sub.amount}/mo</TableCell>
                <TableCell>{sub.users}</TableCell>
                <TableCell>{sub.nextBilling === '-' ? '-' : new Date(sub.nextBilling).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {getStatusIcon(sub.status)}
                    {getStatusBadge(sub.status)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Showing <span className="font-medium">1</span> to <span className="font-medium">{subscriptions.length}</span> of <span className="font-medium">{subscriptions.length}</span> subscriptions</div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsManagement;
