'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar, Package, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const stats = [
    { name: 'Total Revenue', value: '$45,231.89', change: '+20.1% from last month', icon: DollarSign },
    { name: 'Active Bookings', value: '12', change: '+5 from last month', icon: Calendar },
    { name: 'Inventory Items', value: '45', change: '+12% from last month', icon: Package },
    { name: 'Active Customers', value: '1,234', change: '+180 since last month', icon: Users },
  ];

  const quickActions = [
    { name: 'Create New Booking', href: '/admin/bookings/new', description: 'Add a new van booking' },
    { name: 'Generate Report', href: '/admin/reports', description: 'Create financial reports' },
    { name: 'Manage Inventory', href: '/admin/inventory', description: 'View and update inventory' },
    { name: 'Customer List', href: '/admin/customers', description: 'View all customers' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&rsquo;s what&rsquo;s happening with your business.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">View Reports</Button>
          <Button asChild>
            <Link href="/admin/bookings/new">
              New Booking
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Card key={action.name} className="hover:bg-accent/50 transition-colors">
            <Link href={action.href}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{action.name}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    New booking #{1000 + i} created
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {i} hour{i !== 1 ? 's' : ''} ago
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
