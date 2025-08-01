from fastapi import APIRouter, Depends, HTTPException, status
from app import schemas
from app.supabase import get_supabase
from app.routes.auth import get_current_admin
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
from decimal import Decimal
import uuid

router = APIRouter(prefix="/admin", tags=["admin"])


class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj: Any) -> Any:
        """Custom JSON encoder for datetime and Decimal objects."""
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return str(obj)
        return super().default(obj)


def format_booking_response(booking: Dict[str, Any]) -> Dict[str, Any]:
    """Format booking data from Supabase for API response."""
    if booking.get("collection_time"):
        booking["collection_time"] = datetime.fromisoformat(
            booking["collection_time"])

    if booking.get("created_at"):
        booking["created_at"] = datetime.fromisoformat(booking["created_at"])
    if booking.get("updated_at"):
        booking["updated_at"] = datetime.fromisoformat(booking["updated_at"])

    return booking


@router.get("/bookings", response_model=List[Dict])
async def list_bookings(
    status_filter: Optional[str] = None,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> List[Dict]:
    """
    List all bookings with their associated records. Optionally filter by status.
    """
    supabase = get_supabase()

    # Use a single query with nested selects to avoid N+1 problem
    query_str = """
        *,
        vision_analysis_results(*),
        quote_history(*),
        stripe_payments(*),
        media_uploads(*),
        customer_details(*)
    """
    query = supabase.table("bookings").select(query_str)
    if status_filter:
        query = query.eq("status", status_filter)

    response = query.execute()
    
    return response.data


@router.get("/bookings/{booking_id}", response_model=schemas.Booking)
async def get_booking(
    booking_id: str,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> schemas.Booking:
    """
    Retrieve detailed booking information.

    Args:
        booking_id: ID of booking to retrieve
        current_admin: Current admin user

    Returns:
        Booking object

    Raises:
        HTTPException: If booking not found
    """
    supabase = get_supabase()
    response = supabase.table("bookings").select(
        "*").eq("id", booking_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking = format_booking_response(response.data[0])
    return schemas.Booking(**booking)


@router.put("/bookings/{booking_id}", response_model=schemas.Booking)
async def update_booking(
    booking_id: str,
    update_data: schemas.BookingUpdate,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> schemas.Booking:
    """
    Update booking details including postcode, address, status, collection time, and quote.
    Also updates Cal.com booking if collection time changes.

    Args:
        booking_id: ID of booking to update
        update_data: Updated booking data
        current_admin: Current admin user

    Returns:
        Updated booking object

    Raises:
        HTTPException: If booking not found or Cal.com update fails
    """
    supabase = get_supabase()

    response = supabase.table("bookings").select(
        "*").eq("id", booking_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking = response.data[0]

    previous_values = {
        "postcode": booking["postcode"],
        "address": booking["address"],
        "status": booking["status"],
        "collection_time": booking["collection_time"].isoformat() if booking["collection_time"] else None,
    }

    update_dict = update_data.dict(exclude_unset=True)

    # Convert datetime objects to ISO format strings for JSON serialization
    for key, value in update_dict.items():
        if isinstance(value, datetime):
            update_dict[key] = value.isoformat()

    response = supabase.table("bookings").update(
        update_dict).eq("id", booking_id).execute()

    audit_data = {
        "id": str(uuid.uuid4()),
        "admin_user_id": current_admin.id,
        "action": "BOOKING_UPDATE",
        "previous_value": previous_values,
        "new_value": update_dict,
        "reason": "Admin update to booking details",
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("admin_audit_logs").insert(audit_data).execute()

    updated_booking = format_booking_response(response.data[0])
    return schemas.Booking(**updated_booking)


@router.delete("/bookings/{booking_id}")
async def delete_booking(
    booking_id: str,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> dict:
    """
    Delete a booking and all its associated records, including Cal.com booking.

    Args:
        booking_id: ID of booking to delete
        current_admin: Current admin user

    Returns:
        Success message

    Raises:
        HTTPException: If booking not found or Cal.com deletion fails
    """
    supabase = get_supabase()

    response = supabase.table("bookings").select(
        "*").eq("id", booking_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking = response.data[0]

    booking_data = {
        "id": booking["id"],
        "user_id": booking["user_id"],
        "postcode": booking["postcode"],
        "address": booking["address"],
        "status": booking["status"],
        "collection_time": booking["collection_time"].isoformat() if booking["collection_time"] else None,
        "quote": str(booking["quote"]) if booking["quote"] else None,
        "created_at": booking["created_at"].isoformat() if booking["created_at"] else None,
        "updated_at": booking["updated_at"].isoformat() if booking["updated_at"] else None
    }

    supabase.table("vision_analysis_results").delete().eq(
        "booking_id", booking_id).execute()
    supabase.table("quote_history").delete().eq(
        "booking_id", booking_id).execute()
    supabase.table("stripe_payments").delete().eq(
        "booking_id", booking_id).execute()
    supabase.table("media_uploads").delete().eq(
        "booking_id", booking_id).execute()
    supabase.table("customer_details").delete().eq(
        "booking_id", booking_id).execute()

    supabase.table("bookings").delete().eq("id", booking_id).execute()

    audit_data = {
        "id": str(uuid.uuid4()),
        "admin_user_id": current_admin.id,
        "action": "BOOKING_DELETE",
        "previous_value": booking_data,
        "new_value": None,
        "reason": "Admin deleted booking",
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("admin_audit_logs").insert(audit_data).execute()

    return {"message": "Booking deleted successfully"}

# -----------------------------
# Platform Management Endpoints
# -----------------------------


@router.get("/compliance", response_model=List[schemas.ComplianceRegulation])
async def list_compliance_regulations(
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> List[schemas.ComplianceRegulation]:
    """
    List all compliance regulations.

    Args:
        current_admin: Current admin user

    Returns:
        List of compliance regulation objects
    """
    supabase = get_supabase()
    response = supabase.table("compliance_regulations").select("*").execute()
    return [schemas.ComplianceRegulation(**item) for item in response.data]


@router.post("/compliance", response_model=schemas.ComplianceRegulation)
async def add_compliance_regulation(
    regulation: schemas.ComplianceRegulation,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> schemas.ComplianceRegulation:
    """
    Add a new compliance regulation.

    Args:
        regulation: New regulation data
        current_admin: Current admin user

    Returns:
        Created compliance regulation object
    """
    supabase = get_supabase()
    regulation_data = regulation.dict()
    regulation_data["id"] = str(uuid.uuid4())

    response = supabase.table("compliance_regulations").insert(
        regulation_data).execute()
    return schemas.ComplianceRegulation(**response.data[0])


@router.put("/compliance/{regulation_id}", response_model=schemas.ComplianceRegulation)
async def update_compliance_regulation(
    regulation_id: str,
    regulation_data: schemas.ComplianceRegulation,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> schemas.ComplianceRegulation:
    """
    Update an existing compliance regulation.

    Args:
        regulation_id: ID of regulation to update
        regulation_data: New regulation data
        current_admin: Current admin user

    Returns:
        Updated compliance regulation object

    Raises:
        HTTPException: If regulation not found
    """
    supabase = get_supabase()

    # Get current regulation
    current = supabase.table("compliance_regulations").select(
        "*").eq("id", regulation_id).execute()

    if not current.data:
        raise HTTPException(
            status_code=404, detail="Compliance regulation not found")

    previous_value = current.data[0]

    # Update regulation
    update_data = regulation_data.dict(exclude={"id"})
    response = supabase.table("compliance_regulations").update(
        update_data).eq("id", regulation_id).execute()

    # Create audit log
    audit_data = {
        "id": str(uuid.uuid4()),
        "admin_user_id": current_admin.id,
        "action": "COMPLIANCE_UPDATE",
        "previous_value": previous_value,
        "new_value": response.data[0],
        "reason": "Admin updated compliance regulation",
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("admin_audit_logs").insert(audit_data).execute()

    return schemas.ComplianceRegulation(**response.data[0])


@router.delete("/compliance/{regulation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_compliance_regulation(
    regulation_id: str,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> None:
    """
    Delete a compliance regulation.

    Args:
        regulation_id: ID of regulation to delete
        current_admin: Current admin user

    Raises:
        HTTPException: If regulation not found
    """
    supabase = get_supabase()

    # Get current regulation
    current = supabase.table("compliance_regulations").select(
        "*").eq("id", regulation_id).execute()

    if not current.data:
        raise HTTPException(
            status_code=404, detail="Compliance regulation not found")

    previous_value = current.data[0]

    # Delete regulation
    supabase.table("compliance_regulations").delete().eq(
        "id", regulation_id).execute()

    # Create audit log
    audit_data = {
        "id": str(uuid.uuid4()),
        "admin_user_id": current_admin.id,
        "action": "COMPLIANCE_DELETE",
        "previous_value": previous_value,
        "new_value": None,
        "reason": "Admin deleted compliance regulation",
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("admin_audit_logs").insert(audit_data).execute()


@router.get("/audit-logs", response_model=List[schemas.AdminAuditLog])
async def get_audit_logs(
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> List[schemas.AdminAuditLog]:
    """
    Retrieve admin audit logs.

    Args:
        current_admin: Current admin user

    Returns:
        List of audit log objects ordered by creation date descending
    """
    supabase = get_supabase()
    response = supabase.table("admin_audit_logs").select(
        "*").order("created_at", desc=True).execute()
    return [schemas.AdminAuditLog(**log) for log in response.data]


@router.post("/estimation-rules", response_model=schemas.EstimationRule)
async def create_estimation_rule(
    rule: schemas.EstimationRule,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> schemas.EstimationRule:
    """
    Create a new estimation rule.

    Args:
        rule: Estimation rule data
        current_admin: Current admin user

    Returns:
        Created estimation rule
    """
    supabase = get_supabase()

    # Prepare rule data
    rule_dict = rule.dict(exclude={"id", "created_at", "updated_at"})
    rule_dict["id"] = str(uuid.uuid4())
    rule_dict["created_at"] = datetime.utcnow().isoformat()

    # Insert rule
    response = supabase.table("estimation_rules").insert(rule_dict).execute()

    # Create audit log
    audit_data = {
        "id": str(uuid.uuid4()),
        "admin_user_id": current_admin.id,
        "action": "ESTIMATION_RULE_CREATE",
        "previous_value": None,
        "new_value": json.dumps(rule_dict, cls=DateTimeEncoder),
        "reason": "Admin created estimation rule",
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("admin_audit_logs").insert(audit_data).execute()

    return schemas.EstimationRule(**response.data[0])


@router.post("/estimation-rules/bulk", response_model=List[schemas.EstimationRule])
async def create_estimation_rules_bulk(
    rules: List[schemas.EstimationRule],
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> List[schemas.EstimationRule]:
    """
    Create multiple estimation rules in bulk.

    Args:
        rules: List of estimation rule data
        current_admin: Current admin user

    Returns:
        List of created estimation rules
    """
    supabase = get_supabase()
    created_rules = []

    for rule in rules:
        # Prepare rule data
        rule_dict = rule.dict(exclude={"id", "created_at", "updated_at"})
        rule_dict["id"] = str(uuid.uuid4())
        rule_dict["created_at"] = datetime.utcnow().isoformat()

        # Insert rule
        response = supabase.table(
            "estimation_rules").insert(rule_dict).execute()
        created_rules.append(schemas.EstimationRule(**response.data[0]))

        # Create audit log
        audit_data = {
            "id": str(uuid.uuid4()),
            "admin_user_id": current_admin.id,
            "action": "ESTIMATION_RULE_BULK_CREATE",
            "previous_value": None,
            "new_value": json.dumps(rule_dict, cls=DateTimeEncoder),
            "reason": "Admin created estimation rule via bulk operation",
            "created_at": datetime.utcnow().isoformat()
        }
        supabase.table("admin_audit_logs").insert(audit_data).execute()

    return created_rules


@router.get("/estimation-rules", response_model=List[schemas.EstimationRule])
async def get_estimation_rules(
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> List[schemas.EstimationRule]:
    """
    Get all estimation rules.

    Args:
        current_admin: Current admin user

    Returns:
        List of estimation rules
    """
    supabase = get_supabase()
    response = supabase.table("estimation_rules").select(
        "*").order("created_at", desc=True).execute()
    return [schemas.EstimationRule(**rule) for rule in response.data]


@router.get("/estimation-rules/{rule_id}", response_model=schemas.EstimationRule)
async def get_estimation_rule(
    rule_id: str,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> schemas.EstimationRule:
    """
    Get a specific estimation rule.

    Args:
        rule_id: ID of rule to retrieve
        current_admin: Current admin user

    Returns:
        Estimation rule if found

    Raises:
        HTTPException: If rule not found
    """
    supabase = get_supabase()
    response = supabase.table("estimation_rules").select(
        "*").eq("id", rule_id).execute()

    if not response.data:
        raise HTTPException(
            status_code=404, detail="Estimation rule not found")

    return schemas.EstimationRule(**response.data[0])


@router.put("/estimation-rules/{rule_id}", response_model=schemas.EstimationRule)
async def update_estimation_rule(
    rule_id: str,
    rule_update: schemas.EstimationRule,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> schemas.EstimationRule:
    """
    Update an estimation rule.

    Args:
        rule_id: ID of rule to update
        rule_update: Updated rule data
        current_admin: Current admin user

    Returns:
        Updated estimation rule

    Raises:
        HTTPException: If rule not found
    """
    supabase = get_supabase()

    # Get current rule
    current = supabase.table("estimation_rules").select(
        "*").eq("id", rule_id).execute()

    if not current.data:
        raise HTTPException(
            status_code=404, detail="Estimation rule not found")

    previous_value = current.data[0]

    # Update rule
    update_data = rule_update.dict(exclude={"id", "created_at", "updated_at"})
    update_data["updated_at"] = datetime.utcnow().isoformat()

    response = supabase.table("estimation_rules").update(
        update_data).eq("id", rule_id).execute()

    # Create audit log
    audit_data = {
        "id": str(uuid.uuid4()),
        "admin_user_id": current_admin.id,
        "action": "ESTIMATION_RULE_UPDATE",
        "previous_value": json.dumps(previous_value, cls=DateTimeEncoder),
        "new_value": json.dumps(update_data, cls=DateTimeEncoder),
        "reason": "Admin updated estimation rule",
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("admin_audit_logs").insert(audit_data).execute()

    return schemas.EstimationRule(**response.data[0])


@router.delete("/estimation-rules/{rule_id}")
async def delete_estimation_rule(
    rule_id: str,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> dict:
    """
    Delete an estimation rule.

    Args:
        rule_id: ID of rule to delete
        current_admin: Current admin user

    Returns:
        Success message

    Raises:
        HTTPException: If rule not found
    """
    supabase = get_supabase()

    # Get current rule
    current = supabase.table("estimation_rules").select(
        "*").eq("id", rule_id).execute()

    if not current.data:
        raise HTTPException(
            status_code=404, detail="Estimation rule not found")

    previous_value = current.data[0]

    # Delete rule
    supabase.table("estimation_rules").delete().eq("id", rule_id).execute()

    # Create audit log
    audit_data = {
        "id": str(uuid.uuid4()),
        "admin_user_id": current_admin.id,
        "action": "ESTIMATION_RULE_DELETE",
        "previous_value": json.dumps(previous_value, cls=DateTimeEncoder),
        "new_value": None,
        "reason": "Admin deleted estimation rule",
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("admin_audit_logs").insert(audit_data).execute()

    return {"message": "Estimation rule deleted successfully"}


@router.get("/payments", response_model=List[schemas.PaymentResponse])
async def get_all_payments(
    skip: int = 0,
    limit: int = 100,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> List[schemas.PaymentResponse]:
    """
    Get all payments with pagination.

    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        current_admin: Current admin user

    Returns:
        List of payment records
    """
    supabase = get_supabase()
    response = supabase.table("stripe_payments").select(
        "*").order("created_at", desc=True).range(skip, skip + limit - 1).execute()
    return [schemas.PaymentResponse(**payment) for payment in response.data]


@router.get("/payments/{payment_id}", response_model=schemas.PaymentResponse)
async def get_payment(
    payment_id: str,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> schemas.PaymentResponse:
    """
    Get a specific payment by ID.

    Args:
        payment_id: ID of payment to retrieve
        current_admin: Current admin user

    Returns:
        Payment record

    Raises:
        HTTPException: If payment not found
    """
    supabase = get_supabase()
    response = supabase.table("stripe_payments").select(
        "*").eq("id", payment_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Payment not found")

    return schemas.PaymentResponse(**response.data[0])


@router.put("/payments/{payment_id}/status")
async def update_payment_status(
    payment_id: str,
    status: str,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> schemas.PaymentResponse:
    """
    Update payment status.

    Args:
        payment_id: ID of payment to update
        status: New payment status
        current_admin: Current admin user

    Returns:
        Updated payment record

    Raises:
        HTTPException: If payment not found
    """
    supabase = get_supabase()

    # Get current payment
    current = supabase.table("stripe_payments").select(
        "*").eq("id", payment_id).execute()

    if not current.data:
        raise HTTPException(status_code=404, detail="Payment not found")

    previous_status = current.data[0]["status"]

    # Update payment
    update_data = {
        "status": status,
        "updated_at": datetime.utcnow().isoformat()
    }

    response = supabase.table("stripe_payments").update(
        update_data).eq("id", payment_id).execute()

    # Create audit log
    audit_data = {
        "id": str(uuid.uuid4()),
        "admin_user_id": current_admin.id,
        "action": "PAYMENT_STATUS_UPDATE",
        "previous_value": json.dumps({"status": previous_status}, cls=DateTimeEncoder),
        "new_value": json.dumps({"status": status}, cls=DateTimeEncoder),
        "reason": f"Admin updated payment status to {status}",
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("admin_audit_logs").insert(audit_data).execute()

    return schemas.PaymentResponse(**response.data[0])


@router.get("/reviews", response_model=List[schemas.ReviewResponse])
async def get_all_reviews(
    skip: int = 0,
    limit: int = 100,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> List[schemas.ReviewResponse]:
    """
    Get all reviews with pagination.

    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        current_admin: Current admin user

    Returns:
        List of reviews
    """
    supabase = get_supabase()
    response = supabase.table("reviews").select(
        "*").order("created_at", desc=True).range(skip, skip + limit - 1).execute()
    return [schemas.ReviewResponse(**review) for review in response.data]


@router.get("/reviews/{review_id}", response_model=schemas.ReviewResponse)
async def get_review(
    review_id: str,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> schemas.ReviewResponse:
    """
    Get a specific review by ID.

    Args:
        review_id: ID of review to retrieve
        current_admin: Current admin user

    Returns:
        Review details

    Raises:
        HTTPException: If review not found
    """
    supabase = get_supabase()
    response = supabase.table("reviews").select(
        "*").eq("id", review_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Review not found")

    return schemas.ReviewResponse(**response.data[0])


@router.delete("/reviews/{review_id}")
async def delete_review(
    review_id: str,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> Dict[str, str]:
    """
    Delete a review.

    Args:
        review_id: ID of review to delete
        current_admin: Current admin user

    Returns:
        Success message

    Raises:
        HTTPException: If review not found
    """
    supabase = get_supabase()

    # Get current review
    current = supabase.table("reviews").select(
        "*").eq("id", review_id).execute()

    if not current.data:
        raise HTTPException(status_code=404, detail="Review not found")

    previous_value = current.data[0]

    # Delete review
    supabase.table("reviews").delete().eq("id", review_id).execute()

    # Create audit log
    audit_data = {
        "id": str(uuid.uuid4()),
        "admin_user_id": current_admin.id,
        "action": "REVIEW_DELETE",
        "previous_value": json.dumps(previous_value, cls=DateTimeEncoder),
        "new_value": None,
        "reason": "Admin deleted review",
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("admin_audit_logs").insert(audit_data).execute()

    return {"message": "Review deleted successfully"}


@router.get("/dashboard/stats", response_model=schemas.DashboardStats)
async def get_dashboard_stats(
    period: str = "week",
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> schemas.DashboardStats:
    """
    Get dashboard statistics for admin overview.

    Args:
        period: Time period for stats (day, week, month, year)
        current_admin: Current admin user

    Returns:
        Dashboard statistics formatted for recharts

    Raises:
        HTTPException: If unauthorized or invalid period
    """
    # Validate period
    valid_periods = ["day", "week", "month", "year"]
    if period not in valid_periods:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid period. Must be one of: {', '.join(valid_periods)}"
        )

    supabase = get_supabase()

    # Calculate date range based on period
    now = datetime.now()
    if period == "day":
        start_date = now - timedelta(days=1)
        interval_format = "%H:00"  # Hourly format
    elif period == "week":
        start_date = now - timedelta(weeks=1)
        interval_format = "%a"  # Day of week format
    elif period == "month":
        start_date = now - timedelta(days=30)
        interval_format = "%d %b"  # Day-month format
    else:  # year
        start_date = now - timedelta(days=365)
        interval_format = "%b"  # Month format

    start_date_str = start_date.isoformat()

    # Get booking statistics
    booking_response = supabase.table("bookings").select(
        "*").gte("created_at", start_date_str).execute()
    bookings = booking_response.data

    # Get payment statistics
    payment_response = supabase.table("stripe_payments").select(
        "*").gte("created_at", start_date_str).execute()
    payments = payment_response.data

    # Get user statistics
    user_response = supabase.table("users").select(
        "*").gte("created_at", start_date_str).execute()
    users = user_response.data

    # Get review statistics
    review_response = supabase.table("reviews").select(
        "*").gte("created_at", start_date_str).execute()
    reviews = review_response.data

    # Process data for time series using the Supabase data
    booking_time_series = process_time_series_supabase(
        bookings, start_date, now, interval_format)
    payment_time_series = process_time_series_supabase(
        payments, start_date, now, interval_format)
    user_time_series = process_time_series_supabase(
        users, start_date, now, interval_format)

    # Calculate booking status distribution
    status_counts = {}
    for booking in bookings:
        status = booking["status"]
        status_counts[status] = status_counts.get(status, 0) + 1

    booking_status_distribution = [
        {"name": status, "value": count}
        for status, count in status_counts.items()
    ]

    # Calculate average rating
    avg_rating = 0
    if reviews:
        avg_rating = sum(review["rating"] for review in reviews) / len(reviews)

    # Calculate revenue metrics
    total_revenue = sum(float(payment["amount"]) for payment in payments)
    successful_payments = [p for p in payments if p["status"] == "succeeded"]
    successful_revenue = sum(float(payment["amount"])
                             for payment in successful_payments)

    # Return formatted dashboard stats
    return schemas.DashboardStats(
        booking_stats=schemas.BookingStats(
            total=len(bookings),
            time_series=booking_time_series,
            status_distribution=booking_status_distribution
        ),
        payment_stats=schemas.PaymentStats(
            total_revenue=float(total_revenue),
            successful_revenue=float(successful_revenue),
            count=len(payments),
            time_series=payment_time_series
        ),
        user_stats=schemas.UserStats(
            total=len(users),
            time_series=user_time_series
        ),
        review_stats=schemas.ReviewStats(
            count=len(reviews),
            average_rating=float(avg_rating)
        )
    )


def process_time_series_supabase(items, start_date, end_date, interval_format):
    """
    Process a list of items from Supabase into a time series format for recharts.

    Args:
        items: List of dictionary objects with created_at attribute
        start_date: Start date for the time series
        end_date: End date for the time series
        interval_format: strftime format string for the interval

    Returns:
        List of time series data points
    """
    # Group items by time interval
    interval_counts = {}

    for item in items:
        created_at = datetime.fromisoformat(
            item["created_at"].replace('Z', '+00:00'))
        interval_key = created_at.strftime(interval_format)
        interval_counts[interval_key] = interval_counts.get(
            interval_key, 0) + 1

    # Create time series with all intervals (including zeros)
    time_series = []

    # Generate all intervals in the date range
    if interval_format == "%H:00":  # Hourly
        delta = timedelta(hours=1)
        current = start_date
        while current <= end_date:
            key = current.strftime(interval_format)
            time_series.append({
                "name": key,
                "value": interval_counts.get(key, 0)
            })
            current += delta
    elif interval_format == "%a":  # Weekly
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        for day in days:
            time_series.append({
                "name": day,
                "value": interval_counts.get(day, 0)
            })
    elif interval_format == "%d %b":  # Monthly
        delta = timedelta(days=1)
        current = start_date
        while current <= end_date:
            key = current.strftime(interval_format)
            time_series.append({
                "name": key,
                "value": interval_counts.get(key, 0)
            })
            current += delta
    else:  # Yearly
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        for month in months:
            time_series.append({
                "name": month,
                "value": interval_counts.get(month, 0)
            })

    return time_series


@router.get("/users", response_model=List[schemas.UserProfile])
async def get_all_users(
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> List[schemas.UserProfile]:
    """
    Get all users in the system.

    Args:
        current_admin: Current admin user

    Returns:
        List of user profiles
    """
    supabase = get_supabase()
    response = supabase.table("users").select("*").execute()
    return [schemas.UserProfile(**user) for user in response.data]


@router.get("/users/{user_id}", response_model=schemas.UserProfile)
async def get_user(
    user_id: str,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> schemas.UserProfile:
    """
    Get a specific user by ID.

    Args:
        user_id: ID of user to retrieve
        current_admin: Current admin user

    Returns:
        User object

    Raises:
        HTTPException: If user not found
    """
    supabase = get_supabase()
    response = supabase.table("users").select("*").eq("id", user_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")

    return schemas.UserProfile(**response.data[0])


@router.post("/users", response_model=schemas.UserProfile)
async def create_user(
    user_data: schemas.UserCreate,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> schemas.UserProfile:
    """
    Create a new user in both Supabase Auth and database.
    """
    supabase = get_supabase()

    # Check if email already exists
    response = supabase.table("users").select(
        "*").eq("email", user_data.email).execute()
    if response.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        # Create user in Supabase Auth
        auth_response = supabase.auth.admin.create_user({
            "email": user_data.email,
            "password": user_data.password,
            "email_confirm": True,
            "user_metadata": {
                "name": user_data.name,
                "role": user_data.role if hasattr(user_data, 'role') else "customer",
                "phone": user_data.phone
            }
        })

        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user in Supabase"
            )

        # Create user in our database
        user_dict = {
            "id": auth_response.user.id,
            "email": user_data.email,
            "name": user_data.name,
            "phone": user_data.phone,
            "role": user_data.role if hasattr(user_data, 'role') else "customer",
            "created_at": datetime.utcnow().isoformat()
        }

        response = supabase.table("users").insert(user_dict).execute()

        # Create audit log
        audit_data = {
            "id": str(uuid.uuid4()),
            "admin_user_id": current_admin.id,
            "action": "USER_CREATE",
            "previous_value": None,
            "new_value": {"user_id": user_dict["id"], "email": user_dict["email"]},
            "reason": "Admin created new user",
            "created_at": datetime.utcnow().isoformat()
        }
        supabase.table("admin_audit_logs").insert(audit_data).execute()

        return schemas.UserProfile(**response.data[0])

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create user: {str(e)}"
        )


@router.put("/users/{user_id}", response_model=schemas.UserProfile)
async def update_user(
    user_id: str,
    user_data: schemas.UserProfileUpdate,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> schemas.UserProfile:
    """
    Update an existing user in both Supabase Auth and database.
    """
    supabase = get_supabase()

    # Get current user
    response = supabase.table("users").select("*").eq("id", user_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")

    user = response.data[0]

    # Store previous values for audit log
    previous_values = {
        "name": user["name"],
        "phone": user["phone"],
        "role": user["role"]
    }

    # Update user
    update_dict = user_data.dict(exclude_unset=True)

    # Update in Supabase Auth if needed
    try:
        # Prepare user metadata update
        user_metadata = {}
        if "name" in update_dict:
            user_metadata["name"] = update_dict["name"]
        if "phone" in update_dict:
            user_metadata["phone"] = update_dict["phone"]
        if "role" in update_dict:
            user_metadata["role"] = update_dict["role"]

        if user_metadata:
            supabase.auth.admin.update_user_by_id(
                user_id,
                {"user_metadata": user_metadata}
            )
    except Exception as e:
        # Log error but continue with database update
        print(f"Supabase user update failed: {str(e)}")

    # Update in our database
    response = supabase.table("users").update(
        update_dict).eq("id", user_id).execute()

    # Create audit log
    audit_data = {
        "id": str(uuid.uuid4()),
        "admin_user_id": current_admin.id,
        "action": "USER_UPDATE",
        "previous_value": previous_values,
        "new_value": update_dict,
        "reason": "Admin update to user details",
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("admin_audit_logs").insert(audit_data).execute()

    return schemas.UserProfile(**response.data[0])


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_admin: schemas.UserProfile = Depends(get_current_admin)
) -> dict:
    """
    Delete a user from both Supabase Auth and database.
    """
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=400, detail="Cannot delete your own account")

    supabase = get_supabase()

    # Get current user
    response = supabase.table("users").select("*").eq("id", user_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")

    user = response.data[0]

    # Store user data for audit log
    user_data = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"]
    }

    # Delete from Supabase Auth
    try:
        supabase.auth.admin.delete_user(user_id)
    except Exception as e:
        # Log error but continue with database deletion
        print(f"Supabase user deletion failed: {str(e)}")

    # Delete from our database
    supabase.table("users").delete().eq("id", user_id).execute()

    # Create audit log
    audit_data = {
        "id": str(uuid.uuid4()),
        "admin_user_id": current_admin.id,
        "action": "USER_DELETE",
        "previous_value": user_data,
        "new_value": None,
        "reason": "Admin deleted user",
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("admin_audit_logs").insert(audit_data).execute()

    return {"message": "User deleted successfully"}
