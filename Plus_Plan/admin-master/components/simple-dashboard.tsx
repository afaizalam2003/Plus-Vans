"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, CreditCard, Truck } from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchBookings, fetchPayments, fetchDashboardStats } from "@/redux/slices/adminSlice";

export default function SimpleDashboard() {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector((state) => state.admin.bookings);
  const payments = useAppSelector((state) => state.admin.payments);
  const dashboardStats = useAppSelector((state) => state.admin.dashboardStats);

  useEffect(() => {
    // fetch only if not already loaded
    if (!bookings.length) {
      dispatch(fetchBookings({}));
    }

    if (!payments.length) {
      dispatch(fetchPayments({}));
    }

    if (!dashboardStats) {
      dispatch(fetchDashboardStats({ period: "month" }));
    }
  }, [dispatch]);

  const totalBookings = bookings.length;
  const activeCustomers = dashboardStats?.user_stats.total ?? 0;
  const totalRevenuePence = dashboardStats?.payment_stats.total_revenue ?? 0;
  const revenueDisplay = `£${(totalRevenuePence / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const stats = [
    {
      title: "Total Bookings",
      value: totalBookings.toLocaleString(),
      icon: Calendar,
      change: "+12%",
      changeType: "increase" as const,
    },
    {
      title: "Active Customers",
      value: activeCustomers.toLocaleString(),
      icon: Users,
      change: "+8%",
      changeType: "increase" as const,
    },
    {
      title: "Revenue",
      value: revenueDisplay,
      icon: CreditCard,
      change: "+15%",
      changeType: "increase" as const,
    },
    {
      title: "Fleet Utilization",
      value: "87%",
      icon: Truck,
      change: "-2%",
      changeType: "decrease" as const,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your waste management operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-xs ${
                    stat.changeType === "increase"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <p className="font-medium">Booking #{i}234</p>
                    <p className="text-sm text-muted-foreground">Customer Name</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">£{150 + i * 50}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Database</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment System</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>AI Vision Analysis</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                  Degraded
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
