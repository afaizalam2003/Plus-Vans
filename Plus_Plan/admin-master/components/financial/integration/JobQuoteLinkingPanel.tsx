import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Link, Unlink } from "lucide-react";
import {
  useJobQuotes,
  useCreateJobQuote,
} from "@/components/hooks/useFinancialIntegration";
import { useFinancialQuotes } from "@/components/hooks/useFinancialQuotes";
import { useBookings } from "@/components/hooks/useBookings";

const JobQuoteLinkingPanel: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState("");
  const [selectedQuote, setSelectedQuote] = useState("");
  const [quoteType, setQuoteType] = useState("initial");

  const {
    data: jobQuotes = [],
    isLoading: quotesLoading,
    refetch,
  } = useJobQuotes();
  const { data: availableQuotes = [] } = useFinancialQuotes();
  const { data: bookings = [] } = useBookings();
  const createJobQuote = useCreateJobQuote();

  const handleCreateLink = async () => {
    if (!selectedBooking || !selectedQuote) return;

    try {
      await createJobQuote.mutateAsync({
        booking_id: selectedBooking,
        quote_id: selectedQuote,
        quote_type: quoteType,
        is_active: true,
      });

      setIsCreateDialogOpen(false);
      setSelectedBooking("");
      setSelectedQuote("");
      setQuoteType("initial");
      refetch();
    } catch (error) {
      console.error("Failed to create job quote link:", error);
    }
  };

  const getQuoteTypeColor = (type: string) => {
    switch (type) {
      case "initial":
        return "bg-blue-100 text-blue-800";
      case "revised":
        return "bg-orange-100 text-orange-800";
      case "final":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (quotesLoading) {
    return <div>Loading job quote links...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Job-Quote Linking</h3>
          <p className="text-muted-foreground">
            Manage connections between jobs and quotes
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Link Job to Quote
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link Job to Quote</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="booking">Select Job/Booking</Label>
                <Select
                  value={selectedBooking}
                  onValueChange={setSelectedBooking}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a job" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookings.map((booking) => (
                      <SelectItem key={booking.id} value={booking.id}>
                        {booking.address} - {booking.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quote">Select Quote</Label>
                <Select value={selectedQuote} onValueChange={setSelectedQuote}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a quote" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableQuotes.map((quote) => (
                      <SelectItem key={quote.id} value={quote.id}>
                        {quote.quote_number} - £{quote.total_amount}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Quote Type</Label>
                <Select value={quoteType} onValueChange={setQuoteType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Initial Quote</SelectItem>
                    <SelectItem value="revised">Revised Quote</SelectItem>
                    <SelectItem value="final">Final Quote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateLink}
                  disabled={
                    !selectedBooking ||
                    !selectedQuote ||
                    createJobQuote.isPending
                  }
                >
                  {createJobQuote.isPending ? "Creating..." : "Create Link"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {jobQuotes.map((jobQuote) => {
          const booking = bookings.find((b) => b.id === jobQuote.booking_id);
          const quote = availableQuotes.find((q) => q.id === jobQuote.quote_id);

          return (
            <Card key={jobQuote.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Job-Quote Link
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getQuoteTypeColor(jobQuote.quote_type)}>
                      {jobQuote.quote_type}
                    </Badge>
                    <Badge
                      variant={jobQuote.is_active ? "default" : "secondary"}
                    >
                      {jobQuote.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Job Details</h4>
                    <div className="text-sm">
                      <p>
                        <span className="text-muted-foreground">Address:</span>{" "}
                        {booking?.address || "Unknown"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        {booking?.status || "Unknown"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">ID:</span>{" "}
                        {jobQuote.booking_id.substring(0, 8)}...
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Quote Details</h4>
                    <div className="text-sm">
                      <p>
                        <span className="text-muted-foreground">Number:</span>{" "}
                        {quote?.quote_number || "Unknown"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Amount:</span> £
                        {quote?.total_amount || 0}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        {quote?.status || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Linked on{" "}
                    {new Date(jobQuote.created_at).toLocaleDateString()}
                  </p>
                  <Button variant="outline" size="sm">
                    <Unlink className="h-3 w-3 mr-1" />
                    Unlink
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {jobQuotes.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Job-Quote Links</h3>
            <p className="text-muted-foreground mb-4">
              Start by linking jobs to their corresponding quotes to enable
              automated financial tracking.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Link
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobQuoteLinkingPanel;
