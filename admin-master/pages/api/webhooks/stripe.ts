import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Disable Next.js body parsing for webhook
export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper function to read raw body
async function getRawBody(req: NextApiRequest): Promise<string> {
  const chunks: any[] = [];
  
  return new Promise((resolve, reject) => {
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    
    req.on('error', (err) => {
      reject(err);
    });
  });
}

async function processPaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  // Add your payment success logic here
  console.log('Payment succeeded:', paymentIntent.id);
}

async function markInvoiceAsPaidViaAPI(invoiceId: string, paymentIntentId: string) {
  try {
    console.log(`Attempting to mark invoice ${invoiceId} as paid via webhook API...`);
    
    // Use webhook-specific endpoint that doesn't require authentication
    // Only update fields that exist in financial_invoices table
    const response = await fetch('http://localhost:8001/admin/webhook/invoices/' + invoiceId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'paid',
        // Note: stripe_payment_intent_id column doesn't exist in financial_invoices table
      }),
    });

    if (response.ok) {
      console.log(`Successfully marked invoice ${invoiceId} as paid via webhook`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`Failed to update invoice ${invoiceId}: ${response.status} - ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating invoice ${invoiceId}:`, error);
    return false;
  }
}

// Main webhook handler function (Pages Router format)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // Get raw body and signature
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      return res.status(400).json({ error: 'No signature' });
    }

    // Verify webhook signature with raw body
    const event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    
    console.log('Received Stripe webhook:', event.type);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await processPaymentSuccess(paymentIntent);
        
        // Get invoice_id from metadata
        const invoiceId = paymentIntent.metadata?.invoice_id;
        
        if (invoiceId) {
          // Update invoice status to paid
          const success = await markInvoiceAsPaidViaAPI(invoiceId, paymentIntent.id);
          
          // Record payment transaction - only if we have a booking_id
          try {
            // First, get the invoice to find the booking_id
            const invoiceResponse = await fetch(`http://localhost:8001/admin/webhook/invoices/${invoiceId}`);
            let bookingId = null;
            
            if (invoiceResponse.ok) {
              const invoiceData = await invoiceResponse.json();
              bookingId = invoiceData.booking_id;
              console.log(`Found booking_id: ${bookingId} for invoice: ${invoiceId}`);
            } else {
              console.warn(`Could not fetch invoice ${invoiceId} for booking_id lookup`);
            }

            // Only record payment if we have a booking_id (stripe_payments table requires it)
            if (bookingId) {
              // Use only fields that exist in stripe_payments table schema
              const paymentData = {
                stripe_payment_intent_id: paymentIntent.id,
                booking_id: bookingId,
                amount: paymentIntent.amount / 100, // Convert from cents
                currency: paymentIntent.currency.toUpperCase(),
                status: 'succeeded',
                created_at: new Date().toISOString(),
              };

              console.log('Recording payment transaction:', paymentData);

              // Use webhook-specific endpoint that doesn't require authentication
              const paymentResponse = await fetch('http://localhost:8001/admin/webhook/payments', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData),
              });

              if (paymentResponse.ok) {
                console.log(`Successfully recorded payment transaction for invoice ${invoiceId} via webhook`);
              } else {
                const errorText = await paymentResponse.text();
                console.error(`Failed to record payment transaction: ${paymentResponse.status} - ${errorText}`);
              }
            } else {
              console.log(`Skipping payment record creation - invoice ${invoiceId} has no booking_id (standalone invoice)`);
            }
          } catch (error) {
            console.error(`Error recording payment transaction:`, error);
          }
        } else {
          console.warn('No invoice_id found in payment intent metadata');
        }
        
        break;
      }
      case 'payment_intent.payment_failed': {
        console.log('Payment failed:', event.data.object);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).json({ error: 'Webhook handler failed' });
  }
}


