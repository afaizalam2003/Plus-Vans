import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import getStripe from '@/lib/stripe';

export default function StripeCheck() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Checking Stripe configuration...');
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkStripe = async () => {
      try {
        // Check environment variables
        const requiredVars = [
          'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
          'STRIPE_SECRET_KEY',
          'STRIPE_WEBHOOK_SECRET'
        ];

        const vars: Record<string, string> = {};
        let hasMissingVars = false;
        
        requiredVars.forEach(varName => {
          const value = process.env[varName];
          vars[varName] = value || 'Not set';
          if (!value) hasMissingVars = true;
        });

        setEnvVars(vars);

        if (hasMissingVars) {
          setStatus('error');
          setMessage('Missing required Stripe environment variables');
          return;
        }

        // Try to load Stripe
        try {
          const stripe = await getStripe();
          if (stripe) {
            setStripeLoaded(true);
            setStatus('success');
            setMessage('Stripe is properly configured and loaded!');
          } else {
            throw new Error('Failed to load Stripe');
          }
        } catch (err) {
          console.error('Error loading Stripe:', err);
          setStatus('error');
          setMessage('Failed to load Stripe. Check the console for details.');
        }
      } catch (err) {
        console.error('Error checking Stripe config:', err);
        setStatus('error');
        setMessage('An error occurred while checking Stripe configuration');
      }
    };

    checkStripe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Stripe Configuration Check</h1>
        
        <div className="mb-6 p-4 rounded-md bg-gray-50 border border-gray-200">
          <div className="flex items-center mb-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-2" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-red-500 mr-2" />}
            <span className="font-medium">{message}</span>
          </div>
          
          {status === 'success' && stripeLoaded && (
            <p className="text-sm text-gray-600 mt-2">
              You can now use the Pay Now button in the invoices list.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Environment Variables</h2>
          <div className="bg-gray-50 rounded-md overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="divide-y divide-gray-200">
                {Object.entries(envVars).map(([key, value]) => (
                  <tr key={key} className="hover:bg-gray-100">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {key}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 break-all">
                      {key.includes('KEY') || key.includes('SECRET')
                        ? value ? '••••••••' + (value.length > 8 ? value.slice(-4) : '') : 'Not set'
                        : value || 'Not set'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h2>
          
          {status === 'error' ? (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-md border border-red-200">
                <h3 className="text-sm font-medium text-red-800">Configuration Issues Detected</h3>
                <p className="mt-1 text-sm text-red-700">
                  Please check your <code className="bg-red-100 px-1 py-0.5 rounded">.env.local</code> file and ensure all required Stripe environment variables are set.
                </p>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Missing Environment Variables</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>You need to set the following environment variables in your <code className="bg-yellow-100 px-1 py-0.5 rounded">.env.local</code> file:</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> - Your Stripe publishable key (starts with 'pk_')</li>
                        <li><code>STRIPE_SECRET_KEY</code> - Your Stripe secret key (starts with 'sk_')</li>
                        <li><code>STRIPE_WEBHOOK_SECRET</code> - Your Stripe webhook secret (starts with 'whsec_')</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-50 rounded-md border border-green-200">
              <h3 className="text-sm font-medium text-green-800">Everything looks good!</h3>
              <p className="mt-1 text-sm text-green-700">
                Your Stripe integration is properly configured. You can now use the Pay Now button in the invoices list.
              </p>
              <div className="mt-4">
                <a 
                  href="/financial/invoices" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Go to Invoices
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
