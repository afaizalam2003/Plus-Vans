"""
Review management routes for van conversion bookings with Supabase integration.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app import models, schemas
from . import auth
from app.supabase import get_supabase, SupabaseError
from postgrest.exceptions import APIError
from loguru import logger

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=schemas.ReviewResponse)
async def create_review(
    review: schemas.ReviewCreate,
    current_user: models.User = Depends(auth.get_current_active_user)
) -> schemas.ReviewResponse:
    """
    Create a new review for a booking.
    """
    supabase = get_supabase()

    try:
        # Verify booking exists and belongs to user
        booking = supabase.table("bookings").select("*").eq("id", review.booking_id).eq("user_id", current_user.id).execute()

        if not booking.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found or not authorized"
            )

        # Check if review already exists
        existing_review = supabase.table("reviews").select("*").eq("booking_id", review.booking_id).eq("user_id", current_user.id).execute()

        if existing_review.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Review already exists for this booking"
            )

        # Create review
        review_data = {
            "booking_id": review.booking_id,
            "user_id": current_user.id,
            "rating": review.rating,
            "comment": review.comment
        }
        result = supabase.table("reviews").insert(review_data).execute()
        return result.data[0]

    except APIError as e:
        logger.error(f"Supabase API error: {str(e)}")
        if "invalid input syntax for type uuid" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid booking ID format"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in create_review: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating the review"
        )


@router.get("/booking/{booking_id}", response_model=List[schemas.ReviewResponse])
async def get_booking_reviews(
    booking_id: str
) -> List[schemas.ReviewResponse]:
    """
    Get all reviews for a specific booking.
    """
    supabase = get_supabase()
    try:
        result = supabase.table("reviews").select("*").eq("booking_id", booking_id).execute()
        return result.data
    except APIError as e:
        logger.error(f"Supabase API error: {str(e)}")
        if "invalid input syntax for type uuid" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid booking ID format"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in get_booking_reviews: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching reviews"
        )


@router.get("/user", response_model=List[schemas.ReviewResponse])
async def get_user_reviews(
    current_user: models.User = Depends(auth.get_current_active_user)
) -> List[schemas.ReviewResponse]:
    """
    Get all reviews by the current user.
    """
    supabase = get_supabase()
    try:
        result = supabase.table("reviews").select("*").eq("user_id", current_user.id).execute()
        return result.data
    except APIError as e:
        logger.error(f"Supabase API error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in get_user_reviews: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching user reviews"
        )


@router.put("/{review_id}", response_model=schemas.ReviewResponse)
async def update_review(
    review_id: str,
    review_update: schemas.ReviewBase,
    current_user: models.User = Depends(auth.get_current_active_user)
) -> schemas.ReviewResponse:
    """
    Update an existing review.
    """
    supabase = get_supabase()
    
    try:
        # Check if review exists and belongs to user
        review = supabase.table("reviews").select("*").eq("id", review_id).eq("user_id", current_user.id).execute()

        if not review.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found or not authorized"
            )

        result = supabase.table("reviews").update(review_update.model_dump()).eq("id", review_id).execute()
        return result.data[0]

    except APIError as e:
        logger.error(f"Supabase API error: {str(e)}")
        if "invalid input syntax for type uuid" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid review ID format"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in update_review: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while updating the review"
        )


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: str,
    current_user: models.User = Depends(auth.get_current_active_user)
) -> None:
    """
    Delete a review.
    """
    supabase = get_supabase()

    try:
        # Check if review exists and belongs to user
        review = supabase.table("reviews").select("*").eq("id", review_id).eq("user_id", current_user.id).execute()

        if not review.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found or not authorized"
            )

        supabase.table("reviews").delete().eq("id", review_id).execute()

    except APIError as e:
        logger.error(f"Supabase API error: {str(e)}")
        if "invalid input syntax for type uuid" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid review ID format"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in delete_review: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while deleting the review"
        )