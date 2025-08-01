import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  useFinancialQuotes,
  useUpdateFinancialQuote,
} from "../hooks/useFinancialQuotes";
import { useVerifyPayment } from "../hooks/useStripePayments";
import PaymentButton from "./PaymentButton";

const QuotesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: quotes, isLoading } = useFinancialQuotes();
  const updateQuote = useUpdateFinancialQuote();
  const verifyPayment = useVerifyPayment();

  // Check for payment status in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const quoteId = urlParams.get("quote");
    const sessionId = urlParams.get("session_id");

    if (paymentStatus === "success" && sessionId) {
      verifyPayment.mutate(sessionId);
      // Clean up URL
      window.history.replaceState({}, "", "/admin/financial");
    }
  }, []);

  const filteredQuotes = quotes?.filter(
    (quote) =>
      quote.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Edit className="h-3 w-3" />;
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "approved":
        return <CheckCircle className="h-3 w-3" />;
      case "rejected":
        return <AlertCircle className="h-3 w-3" />;
      case "expired":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const handleStatusUpdate = (
    quoteId: string,
    newStatus: "pending" | "approved" | "rejected" | "expired"
  ) => {
    updateQuote.mutate({
      id: quoteId,
      updates: { status: newStatus },
    });
  };

  if (isLoading) {
    return <div>Loading quotes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Quote Management</h3>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredQuotes?.map((quote) => (
          <Card key={quote.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">
                    {quote.quote_number} - {quote.customer_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {quote.customer_email} • {quote.address}
                  </p>
                </div>
                <Badge className={getStatusColor(quote.status)}>
                  {getStatusIcon(quote.status)}
                  <span className="ml-1">{quote.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-lg font-semibold">
                    £{parseFloat(quote.total_amount.toString()).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(quote.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {quote.status === "approved" && (
                    <PaymentButton
                      quoteId={quote.id}
                      customerEmail={quote.customer_email}
                      amount={parseFloat(quote.total_amount.toString())}
                    />
                  )}

                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>

                  {quote.status === "draft" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(quote.id, "pending")}
                    >
                      Send Quote
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuotes?.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No quotes found</p>
        </div>
      )}
    </div>
  );
};

export default QuotesManagement;
