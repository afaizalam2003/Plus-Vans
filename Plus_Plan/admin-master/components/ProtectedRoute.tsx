'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { getAuthToken } from '@/services/auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { id: userId, loading } = useAppSelector((state) => state.user);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      
      // If no token and not loading, redirect to login
      if (!token && !loading) {
        router.push('/auth/signin');
      }
      
      // If user is not logged in and not loading, redirect to login
      if (!userId && !loading) {
        router.push('/auth/signin');
      }
    };

    checkAuth();
  }, [userId, loading, router]);

  // Show loading state while checking auth
  if (loading || !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
