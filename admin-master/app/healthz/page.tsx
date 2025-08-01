'use client';

import { useEffect, useState } from 'react';

type HealthCheckResponse = {
  status: string;
  message?: string;
  timestamp?: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
}

export default function HealthCheck() {
  const [status, setStatus] = useState('checking...');
  const [apiStatus, setApiStatus] = useState('checking...');
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Check frontend is running
        setStatus('ok');
        
        // Check API connection
        const response = await fetch('/api/healthz');
        const data: HealthCheckResponse = await response.json();
        
        if (response.ok) {
          setApiStatus('ok');
          setTimestamp(data.timestamp || new Date().toISOString());
        } else {
          setApiStatus(`error: ${data.message || 'Unknown error'}`);
          setTimestamp(new Date().toISOString());
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setApiStatus(`error: ${errorMessage}`);
        setTimestamp(new Date().toISOString());
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Health Status</h1>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">Frontend:</span>
            <span className={`font-mono ${status === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
              {status}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">API:</span>
            <span 
              className={`font-mono ${
                apiStatus === 'ok' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}
            >
              {apiStatus}
            </span>
          </div>
          
          {timestamp && (
            <div className="text-sm text-gray-500 text-center mt-4">
              Last checked: {new Date(timestamp).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
