# Stripe Payment Integration Setup Guide

## Overview
This project includes a complete Stripe payment integration with:
- 🔄 Quote to Payment Flow
- 💳 Multiple Payment Methods (Cash on Collection, Deposit, Full Payment)
- 🔒 PCI-compliant secure processing
- 📧 Webhook handling
- 🎨 Beautiful UI components

## Environment Setup

### 1. Required Environment Variables

Create a `.env.local` file in your `admin-master` directory with:

```bash
# Stripe Configuration
# Get these keys from https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# Stripe Webhook Secret
# Get this from your webhook endpoint configuration in Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase Configuration
# Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Getting Stripe API Keys

1. Sign up for a Stripe account at https://stripe.com
2. Go to **Developers** > **API Keys**
3. Copy your **Publishable key** and **Secret key**
4. Use the **test keys** for development (they start with `pk_test_` and `sk_test_`)

### 3. Setting up Webhooks

1. In your Stripe Dashboard, go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://your-domain.com/api/webhooks/stripe`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)

## Payment Flow Components

### 1. PaymentIntegrationExample
Demo component showcasing all payment features:
```tsx
import { PaymentIntegrationExample } from '@/components/financial/PaymentIntegrationExample';

function MyPage() {
  return <PaymentIntegrationExample />;
}
```

### 2. PayNowButton
Simple payment button for immediate checkout:
```tsx
import { PayNowButton } from '@/components/financial/PayNowButton';

function InvoiceList() {
  return (
    <PayNowButton
      invoiceId="inv_123"
      amount={27000} // £270.00 in cents
      currency="gbp"
      onSuccess={(paymentDetails) => {
        console.log('Payment successful:', paymentDetails);
        // Handle success logic
      }}
    />
  );
}
```

### 3. PaymentMethodSelection
Full payment method selection with Cash/Deposit/Full options:
```tsx
import { PaymentMethodSelection } from '@/components/financial/PaymentMethodSelection';

function PaymentFlow() {
  return (
    <PaymentMethodSelection
      invoiceId="inv_123"
      totalAmount={27000}
      currency="gbp"
      onPaymentSuccess={(paymentDetails) => {
        console.log('Payment completed:', paymentDetails);
      }}
      onMethodChange={(method, amount) => {
        console.log('Method changed:', method.label, 'Amount:', amount);
      }}
    />
  );
}
```

### 4. EnhancedQuoteToPaymentFlow
Complete quote review and payment workflow:
```tsx
import { EnhancedQuoteToPaymentFlow } from '@/components/financial/EnhancedQuoteToPaymentFlow';

function QuoteWorkflow() {
  const quote = {
    id: 'quote_123',
    quote_number: 'QUO-2024-001',
    customer_name: 'John Doe',
    total_amount: 270.00,
    // ... other quote fields
  };

  return (
    <EnhancedQuoteToPaymentFlow
      quote={quote}
      onPaymentSuccess={(paymentDetails) => {
        console.log('Payment successful:', paymentDetails);
      }}
      onQuoteAccepted={(quote) => {
        console.log('Quote accepted:', quote);
      }}
    />
  );
}
```

## Payment Methods

### 1. Cash on Collection
- Customer selects this option
- No immediate payment required
- Status set to "reserved"
- Payment collected on-site

### 2. Deposit (50%)
- Customer pays 50% upfront
- Remaining 50% collected on-site
- Secure Stripe processing for deposit

### 3. Full Payment
- Customer pays 100% upfront
- No payment required on-site
- Complete Stripe transaction

## Testing

### Test Card Numbers
Use these test cards for development:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`
- **Expiry**: Any future date
- **CVC**: Any 3 digits

### Environment Check
Run the environment checker to ensure everything is configured:
```bash
node scripts/check-env.js
```

Or visit `/stripe-check` in your app to see the configuration status.

## Security Features

✅ **PCI Compliance**: No card data stored locally  
✅ **Webhook Validation**: Cryptographic signature verification  
✅ **Environment Security**: Secure key management  
✅ **Error Handling**: Comprehensive error handling  
✅ **Data Validation**: Input validation and sanitization  

## File Structure

```
components/financial/
├── PaymentIntegrationExample.tsx  # Demo showcase
├── PayNowButton.tsx              # Simple payment button
├── PaymentMethodSelection.tsx     # Payment method chooser
├── EnhancedQuoteToPaymentFlow.tsx # Complete workflow
└── SecurityMeasures.md           # Security documentation

pages/api/
├── create-payment-intent.ts      # Payment creation endpoint
└── webhooks/stripe.ts           # Webhook handler

lib/
├── stripe.ts                    # Stripe client configuration
└── check-stripe-config.ts       # Environment validation
```

## Deployment

### Production Checklist

1. **Environment Variables**: Update `.env.local` with live Stripe keys
2. **Webhook URL**: Update webhook endpoint to production domain
3. **SSL Certificate**: Ensure HTTPS is enabled
4. **Database**: Configure production Supabase instance
5. **Testing**: Test with real payment methods in Stripe test mode first

### Live Keys
Replace test keys with live keys (start with `pk_live_` and `sk_live_`):
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

## Support

For issues or questions:
1. Check the console for error messages
2. Verify environment variables are set correctly
3. Test with Stripe's test card numbers
4. Check webhook logs in Stripe Dashboard
5. Review the `SecurityMeasures.md` for security best practices

## Implementation Status

✅ **PayNowButton Component** - Simple payment processing  
✅ **Payment Method Selection** - Multiple payment options  
✅ **Enhanced Quote Flow** - Complete workflow  
✅ **Stripe Checkout Integration** - Secure payment processing  
✅ **Webhook Security** - Signature validation  
✅ **Error Handling** - Comprehensive error management  
✅ **Responsive Design** - Works on all devices  
✅ **TypeScript Support** - Full type safety  

Your Stripe payment integration is now ready for production! 🚀 