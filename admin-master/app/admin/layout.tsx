import { Inter } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Calendar, Image, DollarSign, Settings, Shield, Key, Activity, Star } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_TOKEN_KEY } from '@/services/auth';

const inter = Inter({ subsets: ['latin'] });

import AdminSidebar from './_components/admin-sidebar';

// This is a temporary workaround for the usePathname issue
// We'll create a client component for the sidebar

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check for auth token in cookies - must be awaited
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_KEY)?.value;
  
  // If no token, redirect to signin with callback URL
  if (!token) {
    const callbackUrl = '/admin';
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return (
    <div className={cn("flex h-screen bg-gray-50")}>
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
