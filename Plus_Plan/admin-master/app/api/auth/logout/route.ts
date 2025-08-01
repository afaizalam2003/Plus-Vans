import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_TOKEN_KEY } from '@/services/auth';

export async function POST() {
  try {
    // Clear the auth cookie
    cookies().delete(AUTH_TOKEN_KEY);
    
    // If you have additional cleanup, do it here
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
