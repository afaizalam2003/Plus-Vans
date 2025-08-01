"""
Booking management routes for van conversions with Supabase.
"""
from typing import List, Optional, Union, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.agent import QuoteEstimationAgent
from . import auth
from ..utils.rate_limit import rate_limit_anonymous
from datetime import datetime
from loguru import logger
from app.supabase import get_supabase, SupabaseError

from .. import models, schemas


router = APIRouter(prefix="/booking", tags=["booking"])


@router.post("", response_model=schemas.Booking)
async def create_booking(
    booking: schemas.BookingCreate,
    request: Request
) -> schemas.Booking:
    """
    Create a new booking with postcode. Works for both authenticated and anonymous users.
    Anonymous users can create bookings without authentication.
    """
 

    logger.info(f"Creating new booking with postcode {booking.postcode}")

    if not booking.postcode:
        logger.error("Postcode missing in booking creation request")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Postcode is required"
        )

    try:
        # Get admin client for creating booking
        admin_client = get_supabase(use_admin=True)
        if not admin_client:
            logger.error("Admin Supabase client not available")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Admin client not available"
            )

        # Insert into Supabase
        supabase_booking = {
            "postcode": booking.postcode,
            "status": "pending",
            "user_id": None,
            "address": booking.address,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

        result = admin_client.table("bookings").insert(
            supabase_booking).execute()
        db_booking = result.data[0]

        logger.info(
            f"Successfully created anonymous booking with ID {db_booking['id']}")
        return schemas.Booking(**db_booking)

    except SupabaseError as se:
        logger.error(f"Supabase error creating booking: {str(se)}")
        raise HTTPException(
            status_code=se.status_code,
            detail=f"Database error: {se.message}"
        )
    except Exception as e:
        logger.error(f"Unexpected error creating booking: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create booking: {str(e)}"
        )


@router.get("/my-bookings", response_model=List[schemas.Booking])
async def list_my_bookings(
    current_user: Union[models.User, Dict[str, Any], None] = Depends(
        auth.get_current_user_or_anonymous),
    supabase=Depends(get_supabase)
):
    """
    List current user's bookings. If user is authenticated, return their bookings.
    If not authenticated, return all bookings.
    """
    try:
        # Check if user is authenticated
        if current_user and not isinstance(current_user, dict):
            # Get authenticated user's bookings
            logger.info(f"Fetching bookings for user {current_user.id}")
            result = supabase.table("bookings").select(
                "*").eq("user_id", current_user.id).execute()
            logger.info(
                f"Found {len(result.data)} bookings for user {current_user.id}")
        else:
            # For non-authenticated users, return all bookings
            logger.info("Non-authenticated user requesting all bookings")
            result = supabase.table("bookings").select("*").execute()
            logger.info(f"Found {len(result.data)} total bookings")
            
        return [schemas.Booking(**booking) for booking in result.data]
    except SupabaseError as se:
        logger.error(f"Supabase error fetching bookings: {str(se)}")
        raise HTTPException(
            status_code=se.status_code,
            detail=f"Database error: {se.message}"
        )
    except Exception as e:
        logger.error(f"Error fetching bookings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch bookings: {str(e)}"
        )


@router.get("/all", response_model=List[schemas.Booking])
async def get_all_bookings(
    supabase=Depends(get_supabase)
):
    """
    Get all bookings on the platform. No authentication required.
    """
    try:
        logger.info("Fetching all bookings")
        result = supabase.table("bookings").select("*").execute()
        logger.info(f"Found {len(result.data)} total bookings")
        return [schemas.Booking(**booking) for booking in result.data]
    except SupabaseError as se:
        logger.error(f"Supabase error fetching all bookings: {str(se)}")
        raise HTTPException(
            status_code=se.status_code,
            detail=f"Database error: {se.message}"
        )
    except Exception as e:
        logger.error(f"Error fetching all bookings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch all bookings: {str(e)}"
        )


@router.get("/{booking_id}", response_model=schemas.Booking)
async def get_booking(
    booking_id: str,
    current_user: Union[models.User, Dict[str, Any]] = Depends(
        auth.get_current_user_or_anonymous),
    supabase=Depends(get_supabase)
):
    """
    Get a specific booking.
    """
    logger.info(f"Fetching booking {booking_id}")
    try:
        # Check Supabase
        result = supabase.table("bookings").select(
            "*").eq("id", booking_id).single().execute()

        if not result.data:
            logger.warning(f"Booking {booking_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )

        booking = result.data

        # Check authorization
        if not current_user:
            logger.error("Unauthorized access attempt - no user")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required"
            )

        if isinstance(current_user, dict) and current_user.get("is_anonymous"):
            # For anonymous users, they can only access bookings with matching email
            try:
                customer_details = supabase.table("customer_details").select(
                    "*").eq("booking_id", booking_id).eq("email", current_user.get("email")).single().execute()

                if not customer_details.data:
                    logger.warning(
                        f"Anonymous user {current_user.get('email')} unauthorized to access booking {booking_id}")
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Not authorized to access this booking"
                    )
            except SupabaseError as se:
                logger.error(
                    f"Supabase error checking customer details: {str(se)}")
                raise HTTPException(
                    status_code=se.status_code,
                    detail=f"Database error: {se.message}"
                )
        else:
            # For authenticated users
            if booking["user_id"] != current_user.id and current_user.role != 'admin':
                logger.warning(
                    f"User {current_user.id} unauthorized to access booking {booking_id}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to access this booking"
                )

        logger.info(f"Successfully fetched booking {booking_id}")
        return schemas.Booking(**booking)

    except SupabaseError as se:
        logger.error(f"Supabase error fetching booking: {str(se)}")
        raise HTTPException(
            status_code=se.status_code,
            detail=f"Database error: {se.message}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Unexpected error fetching booking {booking_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch booking"
        )


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_booking(
    booking_id: str,
    current_user: Union[models.User, None] = Depends(
        auth.get_current_user_or_anonymous),
    supabase=Depends(get_supabase)
) -> None:
    """
    Cancel a booking in both Supabase.

    Args:
        booking_id: The booking ID
        current_user: The authenticated user
        supabase: Supabase client

    Raises:
        HTTPException: If booking not found or unauthorized
    """
    logger.info(f"Attempting to cancel booking {booking_id}")
    try:
        result = supabase.table("bookings").select(
            "*").eq("id", booking_id).single().execute()

        if not result.data:
            logger.warning(f"Booking {booking_id} not found for cancellation")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )

        booking = result.data

        if booking["user_id"] != current_user.id and current_user.role != 'admin':
            logger.warning(
                f"User {current_user.id} unauthorized to cancel booking {booking_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to cancel this booking"
            )

        # Update Supabase
        supabase.table("bookings").update(
            {"status": "cancelled"}).eq("id", booking_id).execute()
        logger.info(f"Successfully cancelled booking {booking_id}")

    except SupabaseError as se:
        logger.error(f"Supabase error cancelling booking: {str(se)}")
        raise HTTPException(
            status_code=se.status_code,
            detail=f"Database error: {se.message}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Unexpected error cancelling booking {booking_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel booking"
        )


@router.post("/customer-details", status_code=status.HTTP_201_CREATED, response_model=schemas.CustomerDetailsResponse)
async def update_customer_details(
    details: schemas.CustomerDetails,
    supabase=Depends(get_supabase)
) -> schemas.CustomerDetailsResponse:
    """
    Update booking with customer details.

    Args:
        details: The customer details
        supabase: Supabase client

    Returns:
        schemas.CustomerDetailsResponse: The updated booking details

    Raises:
        HTTPException: If booking not found or update fails
    """
    logger.info(f"Updating customer details for booking {details.booking_id}")
    try:
        # First check if customer details exist for this booking
        result = supabase.table("customer_details").select(
            "*").eq("booking_id", details.booking_id).execute()

        if not result.data:
            # Create new customer details if none exist
            supabase_data = {
                "booking_id": details.booking_id,
                "full_name": details.full_name,
                "contact_number": details.contact_number,
                "email": details.email,
                "collection_date": details.collection_date.isoformat(),
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            result = supabase.table("customer_details").insert(
                supabase_data).execute()
        else:
            # Update existing customer details
            supabase_data = {
                "full_name": details.full_name,
                "contact_number": details.contact_number,
                "email": details.email,
                "collection_date": details.collection_date.isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            result = supabase.table("customer_details").update(
                supabase_data).eq("booking_id", details.booking_id).execute()

        if not result.data:
            raise SupabaseError("Failed to update customer details", 500)

        updated_details = result.data[0]
        logger.info(
            f"Successfully updated customer details for booking {details.booking_id}")

        return schemas.CustomerDetailsResponse(
            booking_id=updated_details["booking_id"],
            full_name=updated_details["full_name"],
            contact_number=updated_details["contact_number"],
            email=updated_details["email"],
            collection_date=updated_details["collection_date"],
            address=updated_details.get("address", ""),
            created_at=updated_details.get("created_at"),
            updated_at=updated_details.get("updated_at")
        )

    except SupabaseError as se:
        logger.error(f"Supabase error updating customer details: {str(se)}")
        raise HTTPException(
            status_code=se.status_code,
            detail=f"Database error: {se.message}"
        )
    except Exception as e:
        logger.error(
            f"Error updating customer details for booking {details.booking_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update customer details"
        )


@router.put("/update/{booking_id}", response_model=schemas.Booking)
async def update_booking(
    booking_id: str,
    booking_update: schemas.BookingUpdate,
    supabase=Depends(get_supabase)
) -> schemas.Booking:
    """
    Update a booking with partial updates allowed. No authentication required.

    Args:
        booking_id: The ID of the booking to update
        booking_update: The booking update data
        supabase: Supabase client instance

    Returns:
        schemas.Booking: The updated booking

    Raises:
        HTTPException: If booking not found or update fails
    """
    logger.info(f"Updating booking {booking_id}")

    try:
        # Get the booking
        result = supabase.table("bookings").select(
            "*").eq("id", booking_id).single().execute()

        if not result.data:
            logger.warning(f"Booking {booking_id} not found for update")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )

        # Only update fields that were provided
        update_data = booking_update.model_dump(exclude_unset=True)
        
        # Convert any datetime objects to ISO format strings
        for key, value in update_data.items():
            if isinstance(value, datetime):
                update_data[key] = value.isoformat()

        # Update the booking
        result = supabase.table("bookings").update(
            update_data).eq("id", booking_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update booking"
            )

        updated_booking = result.data[0]
        logger.info(f"Successfully updated booking {booking_id}")
        return schemas.Booking(**updated_booking)

    except SupabaseError as se:
        logger.error(f"Supabase error updating booking: {str(se)}")
        raise HTTPException(
            status_code=se.status_code,
            detail=f"Database error: {se.message}"
        )
    except Exception as e:
        logger.error(
            f"Unexpected error updating booking {booking_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update booking"
        )


@router.post("/media", status_code=status.HTTP_201_CREATED, response_model=schemas.MediaUploadResponse)
async def upload_booking_media(
    data: schemas.MediaUploadRequest,
    supabase=Depends(get_supabase)
) -> schemas.MediaUploadResponse:
    """
    Upload media and answer key questions for a booking.
    """
    logger.info(f"Uploading media for booking {data.booking_id}")
    try:
        result = supabase.table("bookings").select(
            "*").eq("id", data.booking_id).single().execute()

        if not result.data:
            logger.warning(
                f"Booking {data.booking_id} not found for media upload")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )

        # Insert into Supabase
        supabase_media = {
            "booking_id": data.booking_id,
            "image_urls": data.image_urls,
            "waste_location": data.waste_location,
            "access_restricted": data.access_restricted,
            "dismantling_required": data.dismantling_required,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        result = supabase.table("media_uploads").insert(
            supabase_media).execute()
        media_upload = result.data[0]

        logger.info(
            f"Successfully uploaded media for booking {data.booking_id}")
        return schemas.MediaUploadResponse(
            id=media_upload["id"],
            booking_id=media_upload["booking_id"],
            image_urls=media_upload["image_urls"],
            waste_location=media_upload["waste_location"],
            access_restricted=media_upload["access_restricted"],
            dismantling_required=media_upload["dismantling_required"]
        )

    except SupabaseError as se:
        logger.error(f"Supabase error uploading media: {str(se)}")
        raise HTTPException(
            status_code=se.status_code,
            detail=f"Database error: {se.message}"
        )
    except Exception as e:
        logger.error(
            f"Error uploading media for booking {data.booking_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload media"
        )


@router.post("/quote", response_model=schemas.AnalyzeResponse)
async def generate_booking_quote(
    booking_id: str,
    request: Request,
    supabase=Depends(get_supabase)
) -> schemas.AnalyzeResponse:
    """
    Generate an AI-driven quote for a booking.

    Args:
        booking_id: The booking ID
        request: FastAPI request object
        supabase: Supabase client

    Returns:
        schemas.AnalyzeResponse: The generated quote with breakdown and compliance info

    Raises:
        HTTPException: If booking not found or quote generation fails
    """
    logger.info(f"Generating quote for booking {booking_id}")
    try:
        # Initialize quote estimation agent
        agent = QuoteEstimationAgent()

        # Get analysis from agent
        quote_analysis = agent.analyze_booking(booking_id)

        # Create AnalyzeResponse using the Pydantic model
        response = schemas.AnalyzeResponse(
            breakdown=schemas.BreakdownResponse(
                volume=quote_analysis["breakdown"]["volume"],
                material_risk=quote_analysis["breakdown"]["material_risk"],
                postcode=quote_analysis["breakdown"]["postcode"],
                price_components=schemas.PriceComponentsResponse(
                    base_rate=quote_analysis["breakdown"]["price_components"]["base_rate"],
                    hazard_surcharge=quote_analysis["breakdown"]["price_components"]["hazard_surcharge"],
                    access_fee=quote_analysis["breakdown"]["price_components"]["access_fee"],
                    dismantling_fee=quote_analysis["breakdown"]["price_components"]["dismantling_fee"],
                    total=quote_analysis["breakdown"]["price_components"]["total"]
                )
            ),
            compliance=quote_analysis["compliance"],
            explanation=schemas.ExplanationResponse(
                heatmapUrl=quote_analysis["explanation"]["heatmapUrl"],
                similarCases=quote_analysis["explanation"]["similarCases"],
                applied_rules=quote_analysis["explanation"]["applied_rules"]
            )
        )

        logger.info(
            f"Successfully generated and stored quote for booking {booking_id}")
        return response

    except Exception as e:
        logger.error(
            f"Error generating quote for booking {booking_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quote: {str(e)}"
        )
