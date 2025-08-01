"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Booking } from "@/services/types";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateBookingThunk } from "@/redux/slices/adminSlice";
import { AutomaticInvoiceService } from "@/components/financial/AutomaticInvoiceService";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking?: Booking;
  mode: "create" | "edit";
}

export function BookingDialog({
  open,
  onOpenChange,
  booking,
  mode,
}: BookingDialogProps) {
  const dispatch = useAppDispatch();
  const editLoading = useAppSelector(
    (state) => state.admin.loading.bookingEdit
  );
  const editError = useAppSelector((state) => state.admin.error.bookingEdit);

  const [formData, setFormData] = useState<Partial<Booking>>(
    booking || {
      postcode: "",
      address: "",
      status: "pending",
      collection_time: null,
    }
  );

  useEffect(() => {
    if (booking) {
      setFormData(booking);
    }
  }, [booking]);

  useEffect(() => {
    if (editError) {
      toast.error(editError);
    }
  }, [editError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === "edit" && booking) {
        await dispatch(
          updateBookingThunk({
            bookingId: booking.id,
            bookingData: formData,
          })
        ).unwrap();

        toast.success("Booking updated successfully");
        onOpenChange(false);
      } else {
        // Handle create mode
        const response = await fetch("/api/admin/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Failed to create booking");

        const newBooking = await response.json();
        
        // Automatically generate invoice for the new booking
        try {
          console.log("Auto-generating invoice for new booking:", newBooking.id);
          await AutomaticInvoiceService.onBookingCreated(newBooking);
          
          toast.success("Booking created successfully with invoice generated");
        } catch (invoiceError) {
          console.error("Failed to generate invoice for new booking:", invoiceError);
          toast.success("Booking created successfully (invoice generation failed)");
        }
        
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error saving booking:", error);
      toast.error("Failed to save booking");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Booking" : "Edit Booking"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="postcode">Postcode</Label>
            <Input
              id="postcode"
              value={formData.postcode}
              onChange={(e) =>
                setFormData({ ...formData, postcode: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value as Booking["status"] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="collection_time">Collection Time</Label>
            <Input
              id="collection_time"
              type="datetime-local"
              value={formData.collection_time || ""}
              onChange={(e) =>
                setFormData({ ...formData, collection_time: e.target.value })
              }
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={editLoading === "pending"}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={editLoading === "pending"}>
              {editLoading === "pending" ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
