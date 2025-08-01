import { Booking } from "@/services/types";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/redux/hooks";
import { updateBookingThunk } from "@/redux/slices/adminSlice";

interface Props {
  booking: Booking;
  onClose?: () => void;
}

export default function BookingQuickActions({ booking, onClose }: Props) {
  const dispatch = useAppDispatch();

  const changeStatus = (status: Booking["status"]) => {
    dispatch(updateBookingThunk({ bookingId: booking.id, bookingData: { status } }));
    onClose?.();
  };

  const actions: Array<{ label: string; status: Booking["status"]; variant: "default" | "destructive" | "secondary" }> = [
    { label: "Confirm", status: "confirmed", variant: "default" },
    { label: "Complete", status: "completed", variant: "secondary" },
    { label: "Cancel", status: "cancelled", variant: "destructive" },
  ];

  return (
    <div className="space-y-2">
      <h4 className="font-semibold">Quick Actions</h4>
      <div className="flex flex-col gap-2">
        {actions.map(({ label, status, variant }) => (
          <Button
            key={status}
            variant={variant}
            size="sm"
            disabled={booking.status === status}
            onClick={() => changeStatus(status)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
