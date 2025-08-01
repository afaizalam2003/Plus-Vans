'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Image, 
  DollarSign, 
  Settings, 
  Shield, 
  Key, 
  Activity, 
  Star,
  CreditCard 
} from 'lucide-react';
import Link from 'next/link';

export default function AdminSidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Bookings', path: '/admin/bookings', icon: Calendar },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Media & Analysis', path: '/admin/media', icon: Image },
    { label: 'Financial', path: '/admin/financial', icon: DollarSign },
    { label: 'Payment Test', path: '/admin/payment-test', icon: CreditCard },
    { label: 'Operations', path: '/admin/operations', icon: Settings },
    { label: 'Compliance', path: '/admin/compliance', icon: Shield },
    { label: 'API Management', path: '/admin/api', icon: Key },
    { label: 'System Health', path: '/admin/system', icon: Activity },
    { label: 'Reviews', path: '/admin/reviews', icon: Star },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors',
                isActive && 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
