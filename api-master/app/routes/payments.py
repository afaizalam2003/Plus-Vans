from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from typing import List, Union, Dict, Any, Optional
import stripe
from app.schemas import PaymentCreate, PaymentResponse, User
from app.supabase import get_supabase
import os
from datetime import datetime
from loguru import logger

router = APIRouter(
    prefix="/payments",
    tags=["payments"]
)

# Initialize Stripe with your secret key
STRIPE_ENABLED = os.getenv("STRIPE_ENABLED", "true").lower() == "true"
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")


@router.post("/create", response_model=PaymentResponse)
async def create_payment(
    payment: PaymentCreate,
    supabase=Depends(get_supabase)
) -> PaymentResponse:
    """
    Create a new payment intent for a booking.

    Args:
        payment: Payment details
        supabase: Supabase client

    Returns:
        PaymentResponse: Created payment details

    Raises:
        HTTPException: If booking not found or Stripe error occurs
    """
    # Verify booking exists
    booking = supabase.table("bookings").select(
        "*").eq("id", payment.booking_id).execute()

    if not booking.data:
        raise HTTPException(status_code=404, detail="Booking not found")

    try:
        # Check if Stripe is enabled
        if not STRIPE_ENABLED:
            # Return a mock payment ID for testing
            mock_payment_id = f"mock_pi_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
            logger.warning(f"Stripe is disabled. Using mock payment ID: {mock_payment_id}")
        else:
            # Create payment intent with Stripe
            intent = stripe.PaymentIntent.create(
                amount=int(payment.amount * 100),  # Convert to cents
                currency=payment.currency,
                payment_method_types=["card"],
            metadata={"booking_id": payment.booking_id},
            payment_method=payment.payment_method_id if payment.payment_method_id else None,
            setup_future_usage=payment.setup_future_usage if payment.setup_future_usage else None
        )

        # Create payment record in Supabase
        payment_data = {
            "booking_id": payment.booking_id,
            "payment_intent_id": mock_payment_id if not STRIPE_ENABLED else intent.id,
            "stripe_payment_intent_id": mock_payment_id if not STRIPE_ENABLED else intent.id,
            "amount": float(payment.amount),
            "currency": payment.currency,
            "status": intent.status if STRIPE_ENABLED else 'succeeded',
            "stripe_charge_id": None  # Initialize with None to prevent validation error
        }

        result = supabase.table("stripe_payments").insert(
            payment_data).execute()
        db_payment = result.data[0]

        return PaymentResponse(
            id=db_payment["id"],
            booking_id=db_payment["booking_id"],
            amount=db_payment["amount"],
            currency=db_payment["currency"],
            status=db_payment["status"],
            client_secret=intent.client_secret if STRIPE_ENABLED else None,
            payment_intent_id=db_payment["payment_intent_id"],
            stripe_payment_intent_id=db_payment["stripe_payment_intent_id"],
            stripe_charge_id=db_payment["stripe_charge_id"],
            created_at=db_payment["created_at"],
            updated_at=db_payment["updated_at"]
        )

    except stripe.error.StripeError as e:
        if not STRIPE_ENABLED:
            logger.warning(f"Stripe is disabled. Mock payment created successfully.")
        else:
            logger.error(f"Stripe error creating payment: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Payment processing error: {str(e)}")


@router.post("/checkout")
async def create_checkout_session(
    payment: PaymentCreate,
    supabase=Depends(get_supabase)
) -> dict:
    """
    Create a Stripe Checkout session and return the URL.

    Args:
        payment: Payment details
        supabase: Supabase client

    Returns:
        dict: Checkout session URL

    Raises:
        HTTPException: If booking not found or Stripe error occurs
    """
    # Verify booking exists
    booking = supabase.table("bookings").select(
        "*").eq("id", payment.booking_id).execute()
    if not booking.data:
        raise HTTPException(status_code=404, detail="Booking not found")

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': payment.currency.lower(),
                    'unit_amount': int(payment.amount * 100),
                    'product_data': {
                        'name': f'Booking {payment.booking_id}',
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=os.getenv(
                'FRONTEND_URL', 'http://localhost:3000') + '/payment/success',
            cancel_url=os.getenv(
                'FRONTEND_URL', 'http://localhost:3000') + '/payment/cancel',
            metadata={
                'booking_id': payment.booking_id
            }
        )

        # Create initial payment record in Supabase
        payment_data = {
            "booking_id": payment.booking_id,
            "stripe_payment_intent_id": checkout_session.payment_intent,
            "amount": float(payment.amount),
            "currency": payment.currency,
            "status": 'pending',
            "stripe_charge_id": None  # Initialize with None
        }

        supabase.table("stripe_payments").insert(payment_data).execute()

        return {"checkout_url": checkout_session.url}

    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating checkout session: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/booking/{booking_id}", response_model=List[PaymentResponse])
async def get_booking_payments(
    booking_id: str,
    supabase=Depends(get_supabase)
) -> List[PaymentResponse]:
    """
    Get all payments for a specific booking.

    Args:
        booking_id: ID of booking to get payments for
        supabase: Supabase client

    Returns:
        List[PaymentResponse]: List of payments for booking

    Raises:
        HTTPException: If booking not found
    """
    # Verify booking exists
    booking = supabase.table("bookings").select(
        "*").eq("id", booking_id).execute()

    if not booking.data:
        raise HTTPException(status_code=404, detail="Booking not found")

    payments = supabase.table("stripe_payments").select(
        "*").eq("booking_id", booking_id).execute()

    return [PaymentResponse(**payment) for payment in payments.data]


@router.get("/transaction/{payment_id}")
async def get_transaction_details(
    payment_id: str,
    supabase=Depends(get_supabase)
) -> Dict[str, Any]:
    """
    Get detailed transaction information directly from Stripe.

    Args:
        payment_id: ID of the payment in our database
        supabase: Supabase client

    Returns:
        Dict[str, Any]: Detailed transaction information from Stripe

    Raises:
        HTTPException: If payment not found or Stripe error occurs
    """
    # First verify the payment exists
    payment_query = supabase.table(
        "stripe_payments").select("*").eq("id", payment_id)
    payment_result = payment_query.execute()

    if not payment_result.data:
        raise HTTPException(status_code=404, detail="Payment not found")

    payment = payment_result.data[0]

    # Verify booking exists
    booking = supabase.table("bookings").select(
        "*").eq("id", payment["booking_id"]).execute()

    if not booking.data:
        raise HTTPException(
            status_code=403, detail="Not authorized to access this payment")

    try:
        # Get payment intent details from Stripe
        payment_intent_id = payment["stripe_payment_intent_id"]
        if not payment_intent_id:
            raise HTTPException(
                status_code=400, detail="No Stripe payment intent ID associated with this payment")

        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)

        # Get charge details if available
        charge_data: Optional[Dict[str, Any]] = None
        if payment["stripe_charge_id"]:
            charge = stripe.Charge.retrieve(payment["stripe_charge_id"])
            charge_data = {
                "id": charge.id,
                "amount": charge.amount / 100,  # Convert from cents
                "currency": charge.currency,
                "payment_method_details": charge.payment_method_details,
                "receipt_url": charge.receipt_url,
                "status": charge.status,
                "created": datetime.fromtimestamp(charge.created).isoformat(),
                "paid": charge.paid,
                "refunded": charge.refunded,
                "captured": charge.captured,
                "description": charge.description
            }

        # Compile transaction details
        transaction_details = {
            "payment_id": payment["id"],
            "booking_id": payment["booking_id"],
            "amount": payment["amount"],
            "currency": payment["currency"],
            "status": payment["status"],
            "created_at": payment["created_at"],
            "updated_at": payment["updated_at"],
            "payment_intent": {
                "id": payment_intent.id,
                "amount": payment_intent.amount / 100,  # Convert from cents
                "currency": payment_intent.currency,
                "status": payment_intent.status,
                "created": datetime.fromtimestamp(payment_intent.created).isoformat(),
                "payment_method_types": payment_intent.payment_method_types,
                "metadata": payment_intent.metadata
            },
            "charge": charge_data
        }

        return transaction_details

    except stripe.error.StripeError as e:
        logger.error(f"Stripe error retrieving transaction details: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    supabase=Depends(get_supabase)
) -> dict:
    """
    Handle Stripe webhook events.

    Args:
        request: FastAPI request object containing the webhook payload
        background_tasks: Background tasks queue for async processing
        supabase: Supabase client instance

    Returns:
        dict: Success status message with event ID

    Raises:
        HTTPException: If webhook signature is invalid or payload is malformed
    """
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")

        if not sig_header:
            logger.warning("Missing Stripe signature header")
            return {"status": "success", "message": "Missing signature header"}

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except (ValueError, stripe.error.SignatureVerificationError) as e:
            logger.warning(f"Invalid webhook payload or signature: {str(e)}")
            return {"status": "success", "message": "Invalid webhook"}

        # Check for duplicate events
        existing_event = supabase.table("stripe_events").select("*").eq(
            "stripe_event_id", event.id
        ).execute()

        if existing_event.data:
            logger.info(f"Duplicate webhook event received: {event.id}")
            return {"status": "success", "message": "Duplicate event"}

        # Store the event in Supabase
        event_data = {
            "stripe_event_id": event.id,
            "event_type": event.type,
            "payload": dict(event.data),
            "processed": False,
            "created_at": datetime.utcnow().isoformat()
        }

        try:
            supabase.table("stripe_events").insert(event_data).execute()
        except Exception as e:
            logger.error(f"Failed to store webhook event: {str(e)}")
            # Continue processing even if storage fails
            return {"status": "success", "message": "Event processed but storage failed"}

        # Process the event based on type
        try:
            await process_stripe_event(event, supabase)
        except Exception as e:
            logger.error(
                f"Error processing webhook event {event.id}: {str(e)}")
            # Update event with error but still return success
            supabase.table("stripe_events").update({
                "error": str(e),
                "processed": False
            }).eq("stripe_event_id", event.id).execute()
            return {"status": "success", "message": "Event received but processing failed"}

        return {"status": "success", "event_id": event.id}

    except Exception as e:
        logger.error(f"Unexpected error in webhook handler: {str(e)}")
        # Always return success to Stripe
        return {"status": "success", "message": "Event received"}


async def handle_payment_success(payment_intent: stripe.PaymentIntent, supabase) -> None:
    """Handle successful payment intent events."""
    logger.info(f"Processing successful payment intent: {payment_intent.id}")

    # Get the charge ID
    charge_id = None
    if hasattr(payment_intent, 'latest_charge'):
        charge_id = payment_intent.latest_charge
    elif hasattr(payment_intent, 'charges') and payment_intent.charges.data:
        charge_id = payment_intent.charges.data[0].id

    payment_data = {
        "status": payment_intent.status,
        "stripe_charge_id": charge_id,
        "updated_at": datetime.utcnow().isoformat()
    }

    result = supabase.table("stripe_payments").update(payment_data).eq(
        "stripe_payment_intent_id", payment_intent.id
    ).execute()

    if not result.data:
        logger.warning(
            f"No payment record found for intent: {payment_intent.id}")

async def handle_payment_failure(payment_intent: stripe.PaymentIntent, supabase) -> None:
    """
    Handle failed payment intent events.
    
    Args:
        payment_intent: The Stripe PaymentIntent object
        supabase: Supabase client instance
    """
    error_message = None
    if hasattr(payment_intent, 'last_payment_error'):
        error_message = payment_intent.last_payment_error.get('message')

    payment_data = {
        "status": payment_intent.status,
        "error_message": error_message,
        "updated_at": datetime.utcnow().isoformat()
    }

    result = supabase.table("stripe_payments").update(payment_data).eq(
        "stripe_payment_intent_id", payment_intent.id
    ).execute()

    if not result.data:
        logger.warning(f"No payment record found for intent: {payment_intent.id}")
    else:
        logger.info(f"Updated failed payment: {payment_intent.id}")


async def handle_refund(charge: stripe.Charge, supabase) -> None:
    """
    Handle charge refund events.
    
    Args:
        charge: The Stripe Charge object
        supabase: Supabase client instance
    """
    payment_data = {
        "status": "refunded",
        "refund_amount": charge.amount_refunded / 100,
        "updated_at": datetime.utcnow().isoformat()
    }

    result = supabase.table("stripe_payments").update(payment_data).eq(
        "stripe_charge_id", charge.id
    ).execute()

    if not result.data:
        logger.warning(f"No payment record found for charge: {charge.id}")
    else:
        logger.info(f"Updated refunded payment: {charge.id}")


async def handle_dispute(dispute: stripe.Dispute, supabase) -> None:
    """
    Handle charge dispute events.
    
    Args:
        dispute: The Stripe Dispute object
        supabase: Supabase client instance
    """
    payment_data = {
        "status": "disputed",
        "dispute_reason": dispute.reason,
        "updated_at": datetime.utcnow().isoformat()
    }

    result = supabase.table("stripe_payments").update(payment_data).eq(
        "stripe_charge_id", dispute.charge
    ).execute()

    if not result.data:
        logger.warning(f"No payment record found for charge: {dispute.charge}")
    else:
        logger.info(f"Updated disputed payment: {dispute.charge}")


async def handle_checkout_completion(session: stripe.checkout.Session, supabase) -> None:
    """
    Handle completed checkout session events.
    
    Args:
        session: The Stripe Checkout Session object
        supabase: Supabase client instance
    """
    payment_data = {
        "status": "succeeded",
        "stripe_payment_intent_id": session.payment_intent,
        "updated_at": datetime.utcnow().isoformat()
    }

    result = supabase.table("stripe_payments").update(payment_data).eq(
        "stripe_payment_intent_id", session.payment_intent
    ).execute()

    if not result.data:
        logger.warning(f"No payment record found for session: {session.id}")
    else:
        logger.info(f"Updated completed checkout session: {session.id}")


async def process_stripe_event(event: stripe.Event, supabase) -> None:
    """
    Process different types of Stripe webhook events.

    Args:
        event: Stripe event object
        supabase: Supabase client instance
    """
    handlers = {
        "payment_intent.succeeded": handle_payment_success,
        "payment_intent.payment_failed": handle_payment_failure,
        "charge.refunded": handle_refund,
        "charge.dispute.created": handle_dispute,
        "checkout.session.completed": handle_checkout_completion
    }

    handler = handlers.get(event.type)
    if handler:
        try:
            await handler(event.data.object, supabase)
        except Exception as e:
            logger.error(f"Error in handler {event.type}: {str(e)}")
            raise

    # Mark event as processed
    result = supabase.table("stripe_events").update({
        "processed": True,
        "processed_at": datetime.utcnow().isoformat()
    }).eq("stripe_event_id", event.id).execute()

    if not result.data:
        logger.warning(f"No event record found to mark as processed: {event.id}")


@router.on_event("startup")
@router.on_event("startup")
async def validate_stripe_config():
    if not STRIPE_ENABLED:
        logger.warning("⚠️  Stripe is disabled. Skipping Stripe config validation.")
        return

    try:
        # This line fails if the Stripe API key is invalid
        stripe.Account.retrieve()
        logger.info("✅ Stripe API key is valid.")
    except Exception as e:
        logger.error(f"❌ Failed to connect to Stripe API: {e}")
        raise e
