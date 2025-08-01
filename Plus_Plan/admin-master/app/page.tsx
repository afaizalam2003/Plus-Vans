'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { getAuthToken } from '@/services/auth';
import { PATHS } from '@/lib/paths';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams(); 

  useEffect(() => {
    const token = getAuthToken();
    const callbackUrl = searchParams.get('callbackUrl') || PATHS.ADMIN;
    
    // If we have a token, redirect to the admin dashboard or callback URL
    if (token) {
      // Use window.location to ensure a full page reload and middleware check
      window.location.href = callbackUrl;
    } else {
      // If no token, redirect to signin with the callback URL
      window.location.href = `${PATHS.SIGN_IN}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
