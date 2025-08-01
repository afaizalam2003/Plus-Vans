import { NextResponse } from 'next/server';

type ErrorWithMessage = {
  message: string;
  status?: number;
};

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error('API URL is not configured');
    }

    const response = await fetch(`${apiUrl}/healthz`);
    
    if (!response.ok) {
      throw new Error(`Backend service returned status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json({ status: 'ok', ...data });
  } catch (error) {
    const errorMessage = isErrorWithMessage(error) 
      ? error.message 
      : 'An unknown error occurred';
      
    return NextResponse.json(
      { 
        status: 'error', 
        message: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}

export const dynamic = 'force-dynamic';
