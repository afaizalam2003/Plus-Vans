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
import { Receipt, Eye, Edit, Send } from "lucide-react";
import { useFinancialInvoices } from "../hooks/useFinancialInvoices";

const InvoicesManagement: React.FC = () => {
  const { data: invoices, isLoading } = useFinancialInvoices();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "pending":
        return "default";
      case "sent":
        return "default";
      case "paid":
        return "default";
      case "overdue":
        return "destructive";
      case "cancelled":
        return "secondary";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return <div>Loading invoices...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Receipt className="h-5 w-5 mr-2" />
          Invoices Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices?.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  {invoice.invoice_number}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {invoice.customer_name || "No name"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {invoice.customer_email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>£{invoice.total_amount}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(invoice.due_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {invoices?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InvoicesManagement;
