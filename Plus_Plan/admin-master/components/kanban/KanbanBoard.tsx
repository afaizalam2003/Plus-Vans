"use client";

import { useCallback, useState, useMemo } from "react";
import { Booking } from "@/services/types";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateBookingThunk, deleteBooking } from "@/redux/slices/adminSlice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Eye, Pencil, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { BookingDialog } from "@/components/dialogs/booking-dialog";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { BookingDetailsDialog } from "@/components/dialogs/booking-details-dialog";
import { cn } from "@/lib/utils";

interface KanbanColumn {
  id: string;
  title: string;
  status: Booking["status"];
  bookingIds: string[];
  color: string;
  borderColor: string;
  headerColor: string;
}

interface KanbanBoardProps {
  bookings: Booking[];
  onCardMove: (bookingId: string, newStatus: Booking["status"]) => void;
}

export default function KanbanBoard({
  bookings,
  onCardMove,
}: KanbanBoardProps): JSX.Element {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleDragEnd = useCallback(
    (result: any) => {
      if (!result.destination) return;

      const { source, destination, draggableId } = result;
      if (source.droppableId === destination.droppableId) return;

      const newStatus = destination.droppableId as Booking["status"];

      // Find the booking that was dragged
      const draggedBooking = bookings.find((b) => b.id === draggableId);
      if (!draggedBooking) return;

      // Update local state through the callback
      onCardMove(draggableId, newStatus);

      // Update booking in Redux and API
      dispatch(
        updateBookingThunk({
          bookingId: draggableId,
          bookingData: {
            ...draggedBooking,
            status: newStatus,
          },
        })
      )
        .unwrap()
        .then(() => {
          toast.success(`Booking status updated to ${newStatus}`);
        })
        .catch((error) => {
          toast.error("Failed to update booking status");
          // Revert the local state if the API call fails
          onCardMove(draggableId, draggedBooking.status);
        });
    },
    [bookings, onCardMove, dispatch]
  );

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewDialogOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditDialogOpen(true);
  };

  const handleDeleteBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBooking = async () => {
    if (!selectedBooking) return;

    try {
      await dispatch(deleteBooking(selectedBooking.id)).unwrap();
      toast.success("Booking deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete booking");
    }
  };

  // Organize bookings by status
  const organizedBookings = useMemo(() => {
    const statusMap: Record<string, string[]> = {
      pending: [],
      confirmed: [],
      completed: [],
      cancelled: [],
    };

    bookings.forEach((booking) => {
      if (booking.status && statusMap[booking.status]) {
        statusMap[booking.status].push(booking.id);
      } else {
        // Default to pending if status is invalid
        statusMap.pending.push(booking.id);
      }
    });

    return statusMap;
  }, [bookings]);

  // Filter and paginate bookings
  const filteredBookings = useMemo(() => {
    return bookings;
  }, [bookings]);

  const paginatedBookings = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredBookings.slice(start, end);
  }, [filteredBookings, page]);

  const columns: KanbanColumn[] = [
    {
      id: "pending",
      title: "Pending",
      status: "pending",
      bookingIds: organizedBookings.pending || [],
      color: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-300 dark:border-yellow-700",
      headerColor: "text-yellow-800 dark:text-yellow-300",
    },
    {
      id: "confirmed",
      title: "Confirmed",
      status: "confirmed",
      bookingIds: organizedBookings.confirmed || [],
      color: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-300 dark:border-blue-700",
      headerColor: "text-blue-800 dark:text-blue-300",
    },
    {
      id: "completed",
      title: "Completed",
      status: "completed",
      bookingIds: organizedBookings.completed || [],
      color: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-300 dark:border-green-700",
      headerColor: "text-green-800 dark:text-green-300",
    },
    {
      id: "cancelled",
      title: "Cancelled",
      status: "cancelled",
      bookingIds: organizedBookings.cancelled || [],
      color: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-300 dark:border-red-700",
      headerColor: "text-red-800 dark:text-red-300",
    },
  ];

  const getPaginationRange = (
    currentPage: number,
    totalPages: number
  ): (number | string)[] => {
    const delta = 2;
    const rangeWithDots: (number | string)[] = [];

    // Calculate start and end
    let start = Math.max(2, currentPage - delta);
    let end = Math.min(totalPages - 1, currentPage + delta);

    // Adjust if close to edges
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      start = 1;
    }

    // Add middle range
    for (let i = start; i <= end; i++) {
      rangeWithDots.push(i);
    }

    // Add end ellipsis
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (end < totalPages) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const loading = useAppSelector((state) => state.admin.loading.bookings);
  const deleteLoading = useAppSelector(
    (state) => state.admin.loading.bookingDelete === "pending"
  );

  return (
    <div className="space-y-4">
      <div
        className={
          loading === "pending" ? "opacity-50 pointer-events-none" : ""
        }
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 p-3 md:p-6">
            {columns.map((column: KanbanColumn) => (
              <div
                key={column.id}
                className={`${column.color || "bg-background"} border-2 ${
                  column.borderColor || "border-border"
                } rounded-xl shadow-sm transition-all hover:shadow-md`}
              >
                <div className={`p-3 md:p-4 border-b-2 border-inherit`}>
                  <h3 className={`font-semibold text-base md:text-lg flex items-center justify-between ${column.headerColor}`}>
                    {column.title}
                    <span className="text-xs md:text-sm font-normal bg-background/50 px-2 py-1 rounded-full">
                      {column.bookingIds?.length || 0}
                    </span>
                  </h3>
                </div>
                <Droppable droppableId={column.status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-3 md:p-4 min-h-[50vh] md:min-h-[70vh] transition-colors ${
                        snapshot.isDraggingOver ? "bg-background/50" : ""
                      }`}
                    >
                      {column.bookingIds?.length === 0 && (
                        <div className="flex items-center justify-center h-24 text-sm text-muted-foreground border border-dashed rounded-lg">
                          No bookings in this column
                        </div>
                      )}
                      {column.bookingIds?.map(
                        (bookingId: string, index: number) => {
                          const booking = bookings.find(
                            (b) => b.id === bookingId
                          );
                          if (!booking) return null;

                          return (
                            <Draggable
                              key={booking.id}
                              draggableId={booking.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="mb-3 md:mb-4"
                                >
                                  <Card
                                    className={cn(
                                      "p-3 md:p-4 bg-background hover:bg-accent/30 transition-all border-[#635bff]/20 hover:border-[#635bff]/40",
                                      snapshot.isDragging && "rotate-2 shadow-lg scale-105"
                                    )}
                                  >
                                    <div className="space-y-2 md:space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div className="font-medium text-sm md:text-base text-[#635bff]">
                                          {booking.postcode}
                                        </div>
                                        <div className="text-xs px-2 py-1 rounded-full bg-[#635bff]/10 text-[#635bff]">
                                          #{booking.id.slice(-4)}
                                        </div>
                                      </div>
                                      <div className="text-xs md:text-sm text-muted-foreground line-clamp-2 flex items-start gap-1">
                                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                                        <span>{booking.address}</span>
                                      </div>
                                      {booking.collection_time && (
                                        <div className="text-xs flex items-center gap-1 text-muted-foreground">
                                          <Clock className="w-3 h-3 flex-shrink-0" />
                                          {new Date(
                                            booking.collection_time
                                          ).toLocaleDateString(undefined, {
                                            weekday: "short",
                                            day: "numeric",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </div>
                                      )}
                                      <div className="flex justify-between gap-2 pt-1 md:pt-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleViewBooking(booking)
                                          }
                                          title="View Details"
                                          className="border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"
                                        >
                                          <Eye className="w-3 h-3 md:w-4 md:h-4" />
                                        </Button>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              handleEditBooking(booking)
                                            }
                                            title="Edit Booking"
                                            className="border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"
                                          >
                                            <Pencil className="w-3 h-3 md:w-4 md:h-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              handleDeleteBooking(booking)
                                            }
                                            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            title="Delete Booking"
                                          >
                                            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                </div>
                              )}
                            </Draggable>
                          );
                        }
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Replace the old details dialog with the new shared component */}
      <BookingDetailsDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        booking={selectedBooking}
      />

      {/* Keep existing edit and delete dialogs */}
      <BookingDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        booking={selectedBooking || undefined}
        mode="edit"
      />

      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDeleteBooking}
        title="Delete Booking"
        description="Are you sure you want to delete this booking? This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  );
}
