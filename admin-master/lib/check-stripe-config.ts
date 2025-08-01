// lib/check-stripe-config.ts
export function checkStripeConfig() {
  const isClient = typeof window !== 'undefined';
  const isProduction = process.env.NODE_ENV === 'production';

  if (isClient) {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.error('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined in the browser bundle');
      return false;
    }
    console.log('✅ Stripe public key found (client)');
    return true;
  }

  // --- server side ---
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) missing.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  if (!process.env.STRIPE_SECRET_KEY)                missing.push('STRIPE_SECRET_KEY');
  if (isProduction && !process.env.STRIPE_WEBHOOK_SECRET) missing.push('STRIPE_WEBHOOK_SECRET');

  if (missing.length) {
    console.error('❌ Missing required Stripe environment variables:\n', missing.join('\n  - '));
    return false;
  }

  console.log('✅ Stripe configuration check passed (server)');
  return true;
}
