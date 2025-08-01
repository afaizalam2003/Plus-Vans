"use client";

import { format } from "date-fns";
import { Booking } from "@/services/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { useState } from "react";

import { BookingDialog } from "@/components/dialogs/booking-dialog";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { BookingDetailsDialog } from "@/components/dialogs/booking-details-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BookingListProps {
  bookings: Booking[];
  onDelete: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
  onView: (booking: Booking) => void;
}

export default function BookingList({
  bookings,
  onDelete,
  onEdit,
  onView,
}: BookingListProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleViewDetails = (booking: Booking) => {
    onView(booking);
  };

  const handleEditBooking = (booking: Booking) => {
    onEdit(booking);
  };

  const handleDeleteBooking = (booking: Booking) => {
    setBookingToDelete(booking);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (bookingToDelete) {
      onDelete(bookingToDelete);
      setShowDeleteDialog(false);
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  if (isMobile) {
    return (
      <>
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-md">
              No bookings found. Try adjusting your filters.
            </div>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{booking.postcode}</CardTitle>
                      <CardDescription className="mt-1">
                        {booking.address?.split(",").map((part, i) => (
                          <div key={i} className="text-sm">
                            {part.trim()}
                          </div>
                        ))}
                      </CardDescription>
                    </div>
                    <Badge className={cn("capitalize", getStatusBadgeStyles(booking.status))}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Quote Price</p>
                      {booking.quote?.breakdown?.price_components ? (
                        <p className="font-medium">
                          £{booking.quote.breakdown.price_components.total.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-muted-foreground">No quote</p>
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p>{format(new Date(booking.created_at), "PPP")}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Collection Time</p>
                      <p>
                        {booking.collection_time
                          ? format(new Date(booking.collection_time), "PPP p")
                          : "Not scheduled"}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(booking)}
                    className="text-[#635bff] hover:bg-[#635bff]/10 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditBooking(booking)}
                    className="text-[#635bff] hover:bg-[#635bff]/10 transition-colors"
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        <BookingDetailsDialog
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          booking={selectedBooking}
        />

        <BookingDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          booking={selectedBooking || undefined}
          mode="edit"
        />

        <DeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={confirmDelete}
          title="Delete Booking"
          description="Are you sure you want to delete this booking? This action cannot be undone."
        />
      </>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-100">
              <TableHead className="font-semibold">Postcode</TableHead>
              <TableHead className="font-semibold">Details</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Quote Price</TableHead>
              <TableHead className="font-semibold">Created At</TableHead>
              <TableHead className="font-semibold">Collection Time</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No bookings found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-[#635bff]/5 transition-colors">
                  <TableCell className="font-medium">{booking.postcode}</TableCell>
                  <TableCell>
                    {booking.address?.split(",").map((part, i) => (
                      <div key={i} className="text-sm">
                        {part.trim()}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("capitalize", getStatusBadgeStyles(booking.status))}
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {booking.quote?.breakdown?.price_components ? (
                      <div className="space-y-1">
                        <span className="font-medium">
                          £
                          {booking.quote.breakdown.price_components.total.toFixed(
                            2
                          )}
                        </span>
                        <div className="text-xs text-muted-foreground">
                          Base: £
                          {booking.quote.breakdown.price_components.base_rate.toFixed(
                            2
                          )}
                          {booking.quote.breakdown.price_components
                            .hazard_surcharge > 0 && (
                            <span className="ml-1">
                              + Hazard: £
                              {booking.quote.breakdown.price_components.hazard_surcharge.toFixed(
                                2
                              )}
                            </span>
                          )}
                          {booking.quote.breakdown.price_components.access_fee >
                            0 && (
                            <span className="ml-1">
                              + Access: £
                              {booking.quote.breakdown.price_components.access_fee.toFixed(
                                2
                              )}
                            </span>
                          )}
                          {booking.quote.breakdown.price_components
                            .dismantling_fee > 0 && (
                            <span className="ml-1">
                              + Dismantling: £
                              {booking.quote.breakdown.price_components.dismantling_fee.toFixed(
                                2
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        No quote
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(booking.created_at), "PPP")}
                  </TableCell>
                  <TableCell>
                    {booking.collection_time
                      ? format(new Date(booking.collection_time), "PPP p")
                      : "Not scheduled"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(booking)}
                        className="text-[#635bff] hover:bg-[#635bff]/10 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBooking(booking)}
                        className="text-[#635bff] hover:bg-[#635bff]/10 transition-colors"
                      >
                        Edit
                      </Button>
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBooking(booking)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </Button> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BookingDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        booking={selectedBooking}
      />

      <BookingDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        booking={selectedBooking || undefined}
        mode="edit"
      />

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Booking"
        description="Are you sure you want to delete this booking? This action cannot be undone."
      />
    </>
  );
}
