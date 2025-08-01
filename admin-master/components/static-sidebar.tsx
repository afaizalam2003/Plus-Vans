"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Image,
  Star,
  DollarSign,
  Settings,
  Shield,
  Activity,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Calendar, label: "Bookings", path: "/admin/bookings" },
  { icon: Users, label: "Customers", path: "/admin/customers" },
  { icon: Image, label: "Media & Analysis", path: "/admin/media" },
  { icon: DollarSign, label: "Financial", path: "/admin/financial" },
  { icon: Settings, label: "Operations", path: "/admin/operations" },
  { icon: Shield, label: "Compliance", path: "/admin/compliance" },
  { icon: Key, label: "API Management", path: "/admin/api" },
  { icon: Activity, label: "System Health", path: "/admin/system" },
  { icon: Star, label: "Reviews", path: "/admin/reviews" },
];

export function StaticSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed top-0 left-0 z-40">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
      </div>
      <nav className="mt-6">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors",
                isActive &&
                  "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
              )}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default StaticSidebar;
