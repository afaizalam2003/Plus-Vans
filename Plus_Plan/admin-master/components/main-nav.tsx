"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  User,
  Calendar,
  Calculator,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Users,
  Image,
  Star,
  DollarSign,
  Shield,
  Activity,
  Key,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const sidebarItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Bookings", href: "/admin/bookings", icon: Calendar },
  { title: "Customers", href: "/admin/customers", icon: Users },
  { title: "Payments", href: "/admin/payments", icon: CreditCard },
  {
    title: "Estimation Rules",
    href: "/admin/estimation-rules",
    icon: Calculator,
  },
  { title: "Profile", href: "/admin/profile", icon: User },
  { title: "Media & Analysis", href: "/admin/media", icon: Image },
  { title: "Financial", href: "/admin/financial", icon: DollarSign },
  { title: "Operations", href: "/admin/operations", icon: Settings },
  { title: "Compliance", href: "/admin/compliance", icon: Shield },
  { title: "API Management", href: "/admin/api", icon: Key },
  { title: "System Health", href: "/admin/system", icon: Activity },
  { title: "Reviews", href: "/admin/reviews", icon: Star },
];

export function MainNav() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut } = useAuth();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty(
        "--sidebar-width",
        isCollapsed ? "64px" : "256px"
      );
    }
  }, [isCollapsed]);

  if (pathname?.startsWith("/auth")) {
    return null;
  }

  const renderSidebarItems = () => (
    <div className="space-y-2">
      {sidebarItems.map(({ title, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-2 px-1 py-2 rounded-lg text-sm font-medium transition-colors",
            pathname === href
              ? "bg-secondary text-secondary-foreground"
              : "hover:bg-secondary/80",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? title : undefined}
        >
          <Icon className={cn("h-6 w-6", isCollapsed && "h-8 w-8")} />
          {!isCollapsed && title}
        </Link>
      ))}
    </div>
  );

  const renderFooter = () => (
    <div
      className={cn(
        "p-4 border-t mt-auto",
        isCollapsed ? "flex flex-col items-center" : ""
      )}
    >
      <div
        className={cn(
          "flex",
          isCollapsed ? "justify-center" : "justify-between",
          "items-center mt-2"
        )}
      >
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 px-1 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-secondary/80",
            isCollapsed ? "justify-center w-full" : "justify-start flex-1"
          )}
          onClick={signOut}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut className={cn("h-6 w-6", isCollapsed && "h-8 w-8")} />
          {!isCollapsed && "Sign Out"}
        </Button>
        {!isCollapsed && <ThemeToggle />}
      </div>
      {isCollapsed && (
        <div className="mt-2">
          <ThemeToggle />
        </div>
      )}
    </div>
  );

  return (
    <nav
      className={cn(
        "border-r flex flex-col relative transition-all duration-300",
        "fixed top-0 left-0 h-screen z-40 bg-background",
        isCollapsed ? "w-16" : "w-64"
      )}
      style={
        {
          "--sidebar-width": isCollapsed ? "64px" : "256px",
        } as React.CSSProperties
      }
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-background border rounded-full p-1 hover:bg-secondary/80"
      >
        {isCollapsed ? (
          <ChevronRight className="h-6 w-6" />
        ) : (
          <ChevronLeft className="h-6 w-6" />
        )}
      </button>

      <div
        className={cn(
          "p-4 border-b flex items-center",
          isCollapsed ? "justify-center" : "justify-start"
        )}
      >
        {!isCollapsed && <Logo width={80} height={24} />}
      </div>

      <div className="flex-1 overflow-y-auto p-4">{renderSidebarItems()}</div>

      {renderFooter()}
    </nav>
  );
}
