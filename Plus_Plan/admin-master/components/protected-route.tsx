'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './auth-provider';
import { getAuthToken } from '@/services/auth';

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const token = getAuthToken();

  useEffect(() => {
    if (!loading && !token) {
      // Redirect to signin if not authenticated
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
    } else if (!loading && token && user && requiredRole && user.role !== requiredRole) {
      // Redirect to unauthorized if user doesn't have required role
      router.push('/unauthorized');
    }
  }, [user, loading, token, router, pathname, requiredRole]);

  if (loading || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
