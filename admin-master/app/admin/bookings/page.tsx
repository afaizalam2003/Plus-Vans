"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchBookings,
  deleteBooking,
  updateBookingThunk,
} from "@/redux/slices/adminSlice";
import { BookingDetailsDialog } from "@/components/dialogs/booking-details-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { 
  CalendarIcon, 
  Download, 
  Plus, 
  List, 
  LayoutGrid, 
  CheckCircle, 
  Clock, 
  Loader2, 
  ArrowUp, 
  ArrowDown, 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  Users, 
  Target, 
  MapPin, 
  DollarSign,
  BarChart3,
  Brain,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { Booking } from "@/services/types";
import { BookingDialog } from "@/components/dialogs/booking-dialog";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import EnhancedBookingList from "@/components/bookings/EnhancedBookingList";
import EnhancedBookingKanban from "@/components/bookings/EnhancedBookingKanban";
import ViewModeToggle from "@/components/bookings/ViewModeToggle";
import { cn } from "@/lib/utils";
import BookingMetrics from "@/components/bookings/BookingMetrics";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateRangePicker from "@/components/ui/date-range-picker";

import { saveAs } from "file-saver";
import Papa from "papaparse";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type ViewMode = "list" | "kanban";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

type LoadingState = "idle" | "pending" | "succeeded" | "failed";

interface FilterState {
  status: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking?: Booking;
  mode: "create" | "edit";
}

interface AdminState {
  loading: {
    bookings: LoadingState;
  };
  bookings: Booking[];
  error: {
    bookings: string | null;
  };
}

interface BookingCSVData {
  id: string;
  status: string;
  address: string;
  postcode: string;
  collection_time: string;
  total_price: string;
  created_at: string;
}

const isLoadingState = (state: unknown): state is LoadingState => {
  return (
    state === "idle" ||
    state === "pending" ||
    state === "succeeded" ||
    state === "failed"
  );
};

// Simplify the filterBookings function
const filterBookings = (
  bookings: Booking[],
  filters: FilterState
): Booking[] => {
  let filteredBookings = [...bookings];

  // Filter by status
  if (filters.status.length > 0) {
    filteredBookings = filteredBookings.filter((booking) =>
      filters.status.includes(booking.status)
    );
  }

  // Filter by date range
  if (filters.dateRange.start && filters.dateRange.end) {
    filteredBookings = filteredBookings.filter((booking) => {
      if (!booking.collection_time) return true;
      const bookingDate = new Date(booking.collection_time);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      return bookingDate >= startDate && bookingDate <= endDate;
    });
  }

  return filteredBookings;
};

// Update the BookingFilters component
const BookingFilters = ({
  filters,
  setFilters,
}: {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}) => {
  return (
    <div className="bg-card p-4 rounded-lg shadow-sm space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setFilters({
              status: [],
              dateRange: {
                start: "",
                end: "",
              },
            })
          }
          className="w-full sm:w-auto"
        >
          Reset Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Status
          </label>
          <Select
            value={filters.status[0] || "all"}
            onValueChange={(value) =>
              setFilters({ ...filters, status: value !== "all" ? [value] : [] })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Date Range
          </label>
          <DateRangePicker
            value={{
              from: filters.dateRange.start
                ? new Date(filters.dateRange.start)
                : undefined,
              to: filters.dateRange.end
                ? new Date(filters.dateRange.end)
                : undefined,
            }}
            onChange={(range) =>
              setFilters({
                ...filters,
                dateRange: {
                  start: range?.from?.toISOString() || "",
                  end: range?.to?.toISOString() || "",
                },
              })
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

const STORAGE_KEYS = {
  VIEW_MODE: "bookings-view-mode",
} as const;

const BookingStats = ({ stats, isLoading }: { stats?: any, isLoading: boolean }) => {
  const statsData = [
    {
      title: "Available Staff",
      value: 8,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      change: "+2",
      changeType: "increase",
    },
    {
      title: "Capacity",
      value: "85%",
      icon: BarChart3,
      color: "bg-purple-100 text-purple-600",
      change: "5%",
      changeType: "increase",
    },
    {
      title: "Bookings to route",
      value: 29,
      icon: Target,
      color: "bg-orange-100 text-orange-600",
      change: "-3",
      changeType: "decrease",
    },
    {
      title: "Route efficiency",
      value: "92%",
      icon: TrendingUp,
      color: "bg-green-100 text-green-600",
      change: "2%",
      changeType: "increase",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${stat.color.split(' ')[0]}`}>
                <Icon className={`h-5 w-5 ${stat.color.split(' ')[1]}`} />
              </div>
              <div className="flex items-center gap-1 text-sm">
                {stat.changeType === "increase" ? (
                  <ArrowUp className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    stat.changeType === "increase"
                      ? "text-green-600 text-xs"
                      : "text-red-600 text-xs"
                  }
                >
                  {stat.change}
                </span>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500">{stat.title}</p>
              <h3 className="text-xl font-semibold">{stat.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const QuickActions = () => {
  const actions = [
    {
      title: "Auto-assign Bookings",
      description: "Assign bookings to staff",
      icon: '📋',
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
    },
    {
      title: "Optimize Routes",
      description: "Plan efficient routes",
      icon: '🗺️',
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
    },
    {
      title: "Check Availability",
      description: "View staff schedules",
      icon: '👥',
      color: "bg-gradient-to-br from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700",
    },
    {
      title: "Balance Workload",
      description: "Distribute tasks evenly",
      icon: '⚖️',
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      hoverColor: "hover:from-orange-600 hover:to-orange-700",
    },
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <div className="flex gap-2">
            <Badge
              variant="destructive"
              className="flex items-center gap-1 text-xs"
            >
              <AlertCircle className="h-3 w-3" />
              3
            </Badge>
            <Badge
              variant="secondary"
              className="flex items-center gap-1 text-xs"
            >
              <Users className="h-3 w-3" />
              12
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className={`
                h-16 p-4 justify-start text-left border-0 shadow-sm
                ${action.color} ${action.hoverColor} text-white
                hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300
                group relative overflow-hidden
              `}
            >
              <div className="flex items-center gap-4 w-full z-10 relative">
                <div className="p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors">
                  <span className="text-xl">{action.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{action.title}</h4>
                  <p className="text-xs opacity-90 truncate">
                    {action.description}
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          ))}
        </div>

        {/* Status Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            System Status
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>API Health</span>
              </div>
              <span className="text-green-600 font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Queue Status</span>
              </div>
              <span className="text-blue-600 font-medium">Normal</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Sync Status</span>
              </div>
              <span className="text-yellow-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const OptimizationPanel = () => (
  <Card className="border-0 shadow-sm h-full">
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle className="text-lg">Quick Optimization</CardTitle>
        <Button size="sm">Optimize Now</Button>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Optimization Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Max Stops</p>
              <p className="font-medium">8 per route</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Max Distance</p>
              <p className="font-medium">50km</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Traffic</p>
              <p className="text-green-600 font-medium">Enabled</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Capacity</p>
              <p className="text-green-600 font-medium">Enabled</p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const QualityAssurance = () => (
  <Card className="border-0 shadow-sm h-full">
    <CardHeader>
      <CardTitle className="text-lg">Quality Assurance Checklist</CardTitle>
    </CardHeader>
    <CardContent>
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending (0)</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="failed">Failed (0)</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="pt-6">
          <div className="text-center py-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium mb-1">No pending quality checks</h4>
            <p className="text-sm text-muted-foreground">All assignments are up to date</p>
          </div>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
);

export default function BookingsPage() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("bookings");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState<FilterState>({
    status: [],
    dateRange: {
      start: "",
      end: "",
    },
  });

  const bookings = useAppSelector(
    (state: { admin: AdminState }) => state.admin.bookings
  );
  const loadingState = useAppSelector(
    (state: { admin: AdminState }) => state.admin.loading.bookings
  );
  const error = useAppSelector(
    (state: { admin: AdminState }) => state.admin.error.bookings
  );

  const loading = isLoadingState(loadingState) ? loadingState : "idle";
  const activeFiltersCount = Object.values(filters).filter(
    (value) =>
      value !== "all" &&
      value !== "" &&
      value !== "created_at" &&
      value !== "desc"
  ).length;

  useEffect(() => {
    dispatch(
      fetchBookings({
        status: filters.status.length > 0 ? filters.status[0] : undefined,
      })
    );
  }, [dispatch, filters, currentPage, itemsPerPage]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csvData: BookingCSVData[] = bookings.map((booking) => ({
        id: booking.id,
        status: booking.status,
        address: booking.address,
        postcode: booking.postcode,
        collection_time: booking.collection_time
          ? format(new Date(booking.collection_time), "PPP p")
          : "Not scheduled",
        total_price: booking.quote?.breakdown?.price_components?.total
          ? `£${booking.quote.breakdown.price_components.total}`
          : "£0",
        created_at: format(new Date(booking.created_at), "PPP p"),
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      saveAs(blob, `bookings-export-${format(new Date(), "yyyy-MM-dd")}.csv`);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const confirmDelete = async () => {
    if (bookingToDelete) {
      await dispatch(deleteBooking(bookingToDelete.id));
      dispatch(
        fetchBookings({
          status: filters.status.length > 0 ? filters.status[0] : undefined,
        })
      );
      setShowDeleteDialog(false);
    }
  };

  const totalPages = Math.ceil(bookings.length / itemsPerPage);

  const renderContent = () => {
    if (loading === "pending") {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (loading === "failed" && error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive font-medium">
              Error loading bookings
            </p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      );
    }

    if ((loading === "succeeded" || loading === "idle") && activeTab === "bookings") {
      return (
        <>
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold">All Bookings</h2>
                <p className="text-sm text-muted-foreground">
                  {bookings.length} total bookings • {activeFiltersCount} active filter
                  {activeFiltersCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
                <ViewModeToggle
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <BookingFilters filters={filters} setFilters={setFilters} />
            
            <div className="mt-4">
              {viewMode === "list" ? (
                <EnhancedBookingList
                  bookings={bookings}
                  onDelete={(booking: Booking) => {
                    setBookingToDelete(booking);
                    setShowDeleteDialog(true);
                  }}
                  onEdit={(booking: Booking) => {
                    setBookingToEdit(booking);
                    setShowEditDialog(true);
                  }}
                  onView={(booking: Booking) => {
                    setSelectedBooking(booking);
                    setShowDetailsDialog(true);
                  }}
                />
              ) : (
                <EnhancedBookingKanban
                  bookings={bookings}
                  onView={(booking: Booking) => {
                    setSelectedBooking(booking);
                    setShowDetailsDialog(true);
                  }}
                />
              )}
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all bookings
            </p>
          </div>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full space-y-6"
        >
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger 
              value="overview" 
              className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="bookings" 
              className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Bookings
            </TabsTrigger>
            <TabsTrigger 
              value="requests" 
              className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              New Requests
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-4 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <BookingStats stats={{}} isLoading={false} />
            
            {/* Quick Actions */}
            <QuickActions />
            
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Booking Trend Chart */}
              <Card className="border-0 shadow-lg h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Booking Trends
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        This Week
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs">
                        This Month
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="h-[300px] flex items-center justify-center bg-muted/5 rounded-lg border border-muted/20">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-medium mb-1">Booking Analytics</h4>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Visualize booking patterns and trends over time
                      </p>
                      <Button variant="outline" size="sm" className="mt-4">
                        View Full Report
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Booking Intelligence */}
              <Card className="border-0 shadow-lg h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      Booking Intelligence
                    </CardTitle>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/5 rounded-lg border border-muted/20 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Completed</p>
                          <p className="text-xs text-gray-500">Last 7 days</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">24</p>
                        <div className="flex items-center justify-end text-green-600 text-xs">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          <span>12%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Pending</p>
                          <p className="text-xs text-gray-500">Awaiting confirmation</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">8</p>
                        <div className="flex items-center justify-end text-yellow-600 text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Needs review</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CalendarIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Scheduled</p>
                          <p className="text-xs text-gray-500">Next 7 days</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">15</p>
                        <div className="flex items-center justify-end text-blue-600 text-xs">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          <span>5 new</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
              
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Optimization Panel */}
              <OptimizationPanel />
              
              {/* Quality Assurance */}
              <QualityAssurance />
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <div className="rounded-lg border bg-card">
              {renderContent()}
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <List className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No new requests</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    When you receive new booking requests, they'll appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Booking Analytics</h2>
                <div className="grid gap-6">
                  <div className="h-[400px] rounded-lg border bg-muted/50 flex items-center justify-center">
                    <p className="text-muted-foreground">Analytics dashboard will be displayed here</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium mb-2">Top Services</h3>
                      <p className="text-sm text-muted-foreground">Service analytics will be shown here</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium mb-2">Revenue Overview</h3>
                      <p className="text-sm text-muted-foreground">Revenue data will be shown here</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <BookingDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        booking={bookingToEdit || undefined}
        mode={bookingToEdit ? "edit" : "create"}
      />
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Booking"
        description="Are you sure you want to delete this booking? This action cannot be undone."
      />
      <BookingDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        booking={selectedBooking}
      />
    </div>
  );
}
