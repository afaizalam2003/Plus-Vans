"""
User profile management routes with Supabase integration.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.supabase import get_supabase
from app import models, schemas
from app.routes import auth

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=schemas.UserProfile)
async def read_user_me(
    current_user: models.User = Depends(auth.get_current_active_user)
) -> schemas.UserProfile:
    """
    Get current user's profile.

    Args:
        current_user: The authenticated user

    Returns:
        schemas.UserProfile: The user's profile data
    """
    return schemas.UserProfile(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone,
        role=current_user.role
    )


@router.put("/me", response_model=schemas.UserProfile)
async def update_user_me(
    user_update: schemas.UserProfileUpdate,
    current_user: models.User = Depends(auth.get_current_active_user),
) -> schemas.UserProfile:
    """
    Update current user's profile in both database and Supabase.

    Args:
        user_update: The profile update data
        current_user: The authenticated user

    Returns:
        schemas.UserProfile: The updated user profile

    Raises:
        HTTPException: If name is invalid or phone number format is incorrect
    """
    supabase = get_supabase(use_admin=True)

    try:
        # Validate input
        if user_update.name:
            if len(user_update.name.strip()) < 2:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Name must be at least 2 characters"
                )
            current_user.name = user_update.name.strip()

        if user_update.phone:
            phone = user_update.phone.strip()
            if not phone.startswith('+') or not phone[1:].isdigit():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid phone number format. Must start with + followed by digits"
                )
            current_user.phone = phone

        # Role update validation
        if user_update.role is not None:
            # Only allow role updates if user is an admin
            if current_user.role != 'admin':
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only admins can update roles"
                )
            current_user.role = user_update.role

        # Update in Supabase Auth and Profile
        user_metadata = {
            "name": current_user.name,
            "phone": current_user.phone,
            "role": current_user.role
        }

        # Update Supabase Auth metadata
        await supabase.auth.admin.update_user_by_id(
            current_user.id,
            {"user_metadata": user_metadata}
        )

        # Update Supabase profile table
        profile_data = {
            "id": current_user.id,
            "name": current_user.name,
            "phone": current_user.phone,
            "role": current_user.role,
            "updated_at": "now()"
        }

        result = supabase.table("profiles").upsert(profile_data).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update profile data"
            )

        return schemas.UserProfile(
            id=current_user.id,
            name=current_user.name,
            email=current_user.email,
            phone=current_user.phone,
            role=current_user.role
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile in Supabase: {str(e)}"
        )


@router.post("/create", response_model=schemas.UserProfile)
async def create_user_profile(
    current_user: models.User = Depends(auth.get_current_active_user)
) -> schemas.UserProfile:
    """
    Create or initialize a user profile in Supabase.

    Args:
        current_user: The authenticated user

    Returns:
        schemas.UserProfile: The created user profile

    Raises:
        HTTPException: If profile creation fails
    """
    # Use admin client for Supabase operations
    supabase = get_supabase(use_admin=True)

    try:
        # Prepare profile data
        profile_data = {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "phone": current_user.phone,
            "role": current_user.role,
            "created_at": "now()",
            "updated_at": "now()"
        }

        # Create profile in Supabase profiles table using admin client
        result = supabase.table("profiles").upsert(profile_data).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create profile"
            )

        return schemas.UserProfile(
            id=current_user.id,
            name=current_user.name,
            email=current_user.email,
            phone=current_user.phone,
            role=current_user.role
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create profile: {str(e)}"
        )
