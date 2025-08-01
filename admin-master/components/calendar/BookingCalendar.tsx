"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Booking } from "@/services/types";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { format } from "date-fns";
import { BookingDialog } from "@/components/dialogs/booking-dialog";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { deleteBooking, updateBookingThunk } from "@/redux/slices/adminSlice";
import { toast } from "sonner";
import { BookingDetailsDialog } from "@/components/dialogs/booking-details-dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Calendar, List, Grid3X3 } from "lucide-react";
import { Card } from "@/components/ui/card";

// Define the types that were missing from services/types.ts
interface CalendarViewState {
  view: "month" | "week" | "day";
  date: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  status: Booking["status"];
  bookingId: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    booking: Booking;
    fullAddress: string;
    tooltip: string;
  };
}

interface BookingCalendarProps {
  bookings: Booking[];
  onDelete: (booking: Booking) => void;
}

export default function BookingCalendar({
  bookings,
  onDelete,
}: BookingCalendarProps): JSX.Element {
  const calendarRef = useRef<FullCalendar | null>(null);
  const dispatch = useAppDispatch();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState<boolean>(false);
  const [calendarView, setCalendarView] = useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay">("dayGridMonth");
  const [listView, setListView] = useState<boolean>(false);
  
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  const deleteLoading = useAppSelector(
    (state) => state.admin.loading.bookingDelete === "pending"
  );
  const updateLoading = useAppSelector(
    (state) => state.admin.loading.bookings === "pending"
  );

  const truncateAddress = (address: string, length: number = 20): string => {
    return address.length > length
      ? `${address.substring(0, length)}...`
      : address;
  };

  const events: CalendarEvent[] = bookings.map((booking) => ({
    id: booking.id,
    title: `${booking.postcode} - ${truncateAddress(booking.address)}`,
    start: booking.collection_time || booking.created_at,
    end: booking.collection_time || booking.created_at,
    status: booking.status,
    bookingId: booking.id,
    backgroundColor: getStatusColor(booking.status),
    borderColor: getStatusColor(booking.status),
    extendedProps: {
      booking,
      fullAddress: booking.address,
      tooltip: `${booking.postcode}\n${booking.address}\nStatus: ${booking.status}`,
    },
  }));

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(new Date());
    }
  }, []);

  useEffect(() => {
    if (isMobile && calendarView === "timeGridWeek") {
      setCalendarView("timeGridDay");
    }
  }, [isMobile, calendarView]);

  function getStatusColor(status: Booking["status"]): string {
    switch (status) {
      case "confirmed":
        return "#22c55e";
      case "cancelled":
        return "#ef4444";
      case "completed":
        return "#3b82f6";
      default:
        return "#f59e0b";
    }
  }

  function getStatusLabel(status: Booking["status"]): string {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "cancelled":
        return "Cancelled";
      case "completed":
        return "Completed";
      default:
        return "Pending";
    }
  }

  const handleDateSelect = (selectInfo: any): void => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(selectInfo.start);
    }
  };

  const handleViewChange = (viewInfo: any): void => {
    // This function can be used to track view changes if needed
  };

  const handleDeleteBooking = useCallback(async () => {
    if (!selectedBooking) return;

    try {
      await dispatch(deleteBooking(selectedBooking.id)).unwrap();
      toast.success("Booking deleted successfully");
      setIsDeleteDialogOpen(false);
      if (onDelete) {
        onDelete(selectedBooking);
      }
    } catch (error) {
      toast.error("Failed to delete booking");
      console.error("Error deleting booking:", error);
    }
  }, [selectedBooking, dispatch, onDelete]);

  const handleUpdateBooking = useCallback(
    async (updatedBooking: Partial<Booking>) => {
      if (!selectedBooking) return;

      try {
        await dispatch(
          updateBookingThunk({
            bookingId: selectedBooking.id,
            bookingData: updatedBooking,
          })
        ).unwrap();

        toast.success("Booking updated successfully");
        // The BookingDialog component handles closing itself
      } catch (error) {
        toast.error("Failed to update booking");
        console.error("Error updating booking:", error);
      }
    },
    [selectedBooking, dispatch]
  );

  const handleViewDetails = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsDialog(true);
  }, []);

  // Handle event drag and drop to update date
  const handleEventDrop = useCallback(
    async (info: any) => {
      const booking = info.event.extendedProps.booking;
      const newDate = info.event.start;

      try {
        await dispatch(
          updateBookingThunk({
            bookingId: booking.id,
            bookingData: {
              collection_time: newDate.toISOString(),
              postcode: booking.postcode,
              address: booking.address,
              status: booking.status,
            },
          })
        ).unwrap();

        toast.success("Booking date updated successfully");
      } catch (error) {
        toast.error("Failed to update booking date");
        console.error("Error updating booking date:", error);
        info.revert(); // Revert the drag if the update fails
      }
    },
    [dispatch]
  );

  // Add event context menu
  const handleEventClick = useCallback(
    (info: any) => {
      const booking = info.event.extendedProps.booking;
      setSelectedBooking(booking);

      if (isMobile) {
        // On mobile, directly show details dialog instead of context menu
        handleViewDetails(booking);
        return;
      }

      // Create a custom context menu
      const rect = info.el.getBoundingClientRect();
      const menu = document.createElement("div");
      menu.className =
        "absolute z-[100] bg-background shadow-lg rounded-md border p-2 space-y-1";
      menu.style.left = `${rect.left + window.scrollX}px`;
      menu.style.top = `${rect.bottom + window.scrollY}px`;

      const viewOption = document.createElement("button");
      viewOption.className =
        "w-full text-left px-3 py-1 hover:bg-muted rounded-sm";
      viewOption.textContent = "View Details";
      viewOption.onclick = () => {
        handleViewDetails(booking);
        document.body.removeChild(menu);
      };

      const editOption = document.createElement("button");
      editOption.className =
        "w-full text-left px-3 py-1 hover:bg-muted rounded-sm";
      editOption.textContent = "Edit Booking";
      editOption.onclick = () => {
        setIsEditDialogOpen(true);
        document.body.removeChild(menu);
      };

      const deleteOption = document.createElement("button");
      deleteOption.className =
        "w-full text-left px-3 py-1 hover:bg-destructive hover:text-destructive-foreground rounded-sm";
      deleteOption.textContent = "Delete Booking";
      deleteOption.onclick = () => {
        setIsDeleteDialogOpen(true);
        document.body.removeChild(menu);
      };

      menu.appendChild(viewOption);
      menu.appendChild(editOption);
      menu.appendChild(deleteOption);
      document.body.appendChild(menu);

      // Close menu when clicking outside
      const closeMenu = (e: MouseEvent) => {
        if (!menu.contains(e.target as Node)) {
          if (document.body.contains(menu)) {
            document.body.removeChild(menu);
          }
          document.removeEventListener("click", closeMenu);
        }
      };

      // Add a small delay to prevent immediate closing
      setTimeout(() => {
        document.addEventListener("click", closeMenu);
      }, 100);

      // Prevent default browser context menu
      info.jsEvent.preventDefault();

      // Add cleanup when component unmounts or new event is clicked
      const cleanup = () => {
        if (document.body.contains(menu)) {
          document.body.removeChild(menu);
        }
        document.removeEventListener("click", closeMenu);
      };

      // Clean up previous menu if it exists
      cleanup();
    },
    [handleViewDetails, isMobile]
  );

  // Add event hover handler
  const handleEventMouseEnter = useCallback((info: any) => {
    if (isMobile) return; // Skip tooltip on mobile

    const tooltip = document.createElement("div");
    tooltip.className =
      "calendar-tooltip fixed z-[90] bg-popover text-popover-foreground p-3 rounded-lg shadow-lg border text-sm whitespace-pre-line max-w-sm";
    tooltip.innerHTML = info.event.extendedProps.tooltip;

    const rect = info.el.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;

    document.body.appendChild(tooltip);

    info.el.addEventListener("mouseleave", () => {
      if (document.body.contains(tooltip)) {
        document.body.removeChild(tooltip);
      }
    });
  }, [isMobile]);

  const toggleView = useCallback(() => {
    setListView(!listView);
  }, [listView]);

  const changeCalendarView = useCallback((view: "dayGridMonth" | "timeGridWeek" | "timeGridDay") => {
    setCalendarView(view);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(view);
    }
  }, []);

  // Sort bookings by date for list view
  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(a.collection_time || a.created_at);
    const dateB = new Date(b.collection_time || b.created_at);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="bg-background rounded-lg">
      <style jsx global>{`
        .fc-event {
          cursor: pointer !important;
          transition: transform 0.1s ease-in-out !important;
        }
        .fc-event:hover {
          transform: scale(1.02) !important;
        }
        .calendar-tooltip {
          pointer-events: none;
        }
        .fc-event-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @media (max-width: 768px) {
          .fc-header-toolbar {
            flex-direction: column;
            gap: 0.5rem;
          }
          .fc-toolbar-chunk {
            display: flex;
            justify-content: center;
          }
          .fc-daygrid-day-number {
            font-size: 0.8rem;
          }
          .fc-col-header-cell-cushion {
            font-size: 0.8rem;
          }
        }
      `}</style>

      <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-2">
        <h2 className="text-xl font-semibold text-[#635bff]">Booking Schedule</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={toggleView}
            className="border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"
          >
            {listView ? <Calendar className="h-4 w-4 mr-2" /> : <List className="h-4 w-4 mr-2" />}
            {listView ? "Calendar View" : "List View"}
          </Button>
          
          {!listView && !isMobile && (
            <div className="flex gap-1">
              <Button
                variant={calendarView === "dayGridMonth" ? "default" : "outline"}
                size="sm"
                onClick={() => changeCalendarView("dayGridMonth")}
                className={calendarView === "dayGridMonth" 
                  ? "bg-[#635bff] hover:bg-[#635bff]/90" 
                  : "border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"}
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                Month
              </Button>
              <Button
                variant={calendarView === "timeGridWeek" ? "default" : "outline"}
                size="sm"
                onClick={() => changeCalendarView("timeGridWeek")}
                className={calendarView === "timeGridWeek" 
                  ? "bg-[#635bff] hover:bg-[#635bff]/90" 
                  : "border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"}
              >
                Week
              </Button>
              <Button
                variant={calendarView === "timeGridDay" ? "default" : "outline"}
                size="sm"
                onClick={() => changeCalendarView("timeGridDay")}
                className={calendarView === "timeGridDay" 
                  ? "bg-[#635bff] hover:bg-[#635bff]/90" 
                  : "border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"}
              >
                Day
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        {listView ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedBookings.length > 0 ? (
                sortedBookings.map((booking) => (
                  <Card 
                    key={booking.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4"
                    style={{ borderLeftColor: getStatusColor(booking.status) }}
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowDetailsDialog(true);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{booking.postcode}</h3>
                      <div 
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ 
                          backgroundColor: `${getStatusColor(booking.status)}20`,
                          color: getStatusColor(booking.status)
                        }}
                      >
                        {getStatusLabel(booking.status)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{booking.address}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(booking.collection_time || booking.created_at), "PPp")}
                    </p>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No bookings found
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={`${isMobile ? "h-[600px]" : "h-[800px]"}`}>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={calendarView}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: isMobile ? "dayGridMonth,timeGridDay" : "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={events}
              editable={!isMobile}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={isMobile ? 2 : true}
              weekends={true}
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={false}
              eventDisplay="block"
              eventTimeFormat={{
                hour: "numeric",
                minute: "2-digit",
                meridiem: "short",
              }}
              select={handleDateSelect}
              viewDidMount={handleViewChange}
              eventClick={handleEventClick}
              eventMouseEnter={handleEventMouseEnter}
              eventDrop={handleEventDrop}
              height="100%"
              eventContent={(arg) => {
                const event = arg.event;
                const isTimeGridView = arg.view.type.includes("timeGrid");

                return (
                  <div
                    className={`p-1 overflow-hidden ${
                      isTimeGridView ? "min-h-[40px]" : ""
                    }`}
                  >
                    <div className="font-medium text-sm truncate">{event.title}</div>
                    {isTimeGridView && (
                      <div className="text-xs text-muted-foreground truncate">
                        {format(new Date(event.start!), "h:mm a")}
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </div>
        )}
      </div>

      {/* Replace the old details dialog with the new shared component */}
      <BookingDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        booking={selectedBooking}
      />

      {/* Edit Booking Dialog */}
      <BookingDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        booking={selectedBooking || undefined}
        mode="edit"
      />

      {/* Delete Booking Dialog */}
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteBooking}
        title="Delete Booking"
        description="Are you sure you want to delete this booking? This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  );
}
