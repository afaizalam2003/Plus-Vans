"""
Authentication utilities for Supabase JWT tokens and password handling.
"""
from typing import Optional, Union, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, SecurityScopes
from pydantic_settings import BaseSettings
from loguru import logger
import time
from functools import wraps


from app.supabase import get_supabase
from app import models, schemas

# Define standard error codes for auth-related errors
class AuthErrorCode:
    """Standard error codes for authentication errors"""
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    INVALID_TOKEN = "INVALID_TOKEN"
    USER_NOT_FOUND = "USER_NOT_FOUND"
    EMAIL_EXISTS = "EMAIL_EXISTS"
    INVALID_PASSWORD = "INVALID_PASSWORD"
    INVALID_ROLE = "INVALID_ROLE"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    USER_NOT_CONFIRMED = "USER_NOT_CONFIRMED"
    PASSWORD_RESET_FAILED = "PASSWORD_RESET_FAILED"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    DATABASE_ERROR = "DATABASE_ERROR"
    INVALID_INPUT = "INVALID_INPUT"


def retry_on_db_error(retries: int = 3, delay: float = 0.5):
    """Decorator to retry database operations on connection errors.

    Args:
        retries: Number of retry attempts
        delay: Initial delay between retries in seconds

    Returns:
        Decorated function that will retry on database errors
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(retries):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_error = e
                    if attempt < retries - 1:  # Don't sleep on last attempt
                        logger.warning(
                            f"Database connection error (attempt {attempt + 1}/{retries}): {str(e)}")
                        # Exponential backoff
                        time.sleep(delay * (attempt + 1))
                        continue
                    logger.error(
                        f"Database connection failed after {retries} attempts: {str(e)}")
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail={
                            "message": "Service temporarily unavailable. Please try again.",
                            "code": AuthErrorCode.SERVICE_UNAVAILABLE,
                            "retry_after": "5"
                        },
                        headers={"X-Error-Code": AuthErrorCode.SERVICE_UNAVAILABLE,
                                 "Retry-After": "5"}
                    )
            return last_error
        return wrapper
    return decorator


# Configure logger for authentication module
logger.bind(module="auth")

# Add anonymous token settings
ANONYMOUS_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour for anonymous tokens

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"},
    }
)


class AuthSettings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    STRIPE_PUBLISHABLE_KEY: str
    FRONTEND_URL: str
    SUPABASE_URL: str
    SUPABASE_KEY: str

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = True
        extra = "ignore"


# Initialize settings with error handling
try:
    auth_settings = AuthSettings()
except Exception as e:
    raise Exception(
        f"Failed to load auth settings. Ensure .env file exists with SECRET_KEY defined. Error: {str(e)}")

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/token",
    scheme_name="JWT",
    description="Enter the JWT token obtained from login",
    auto_error=True
)


async def get_current_user(
    security_scopes: SecurityScopes,
    token: str = Depends(oauth2_scheme)
) -> models.User:
    """
    Get the current authenticated user from a Supabase JWT token.

    Args:
        security_scopes: Security scopes for the endpoint
        token: The JWT token

    Returns:
        models.User: The authenticated user

    Raises:
        HTTPException: If authentication fails
    """
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "message": "Authentication failed. Please provide valid credentials.",
            "code": AuthErrorCode.INVALID_CREDENTIALS
        },
        headers={"WWW-Authenticate": authenticate_value},
    )

    try:
        # Verify token with Supabase
        supabase = get_supabase()
        try:
            user_response = supabase.auth.get_user(token)
            if not user_response or not user_response.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail={
                        "message": "Invalid or expired authentication token. Please login again.",
                        "code": AuthErrorCode.INVALID_TOKEN
                    },
                    headers={"WWW-Authenticate": "Bearer"},
                )

            # Get user profile from Supabase profiles table
            profile_response = supabase.table("profiles").select(
                "*").eq("id", user_response.user.id).single().execute()

            # Get role from profiles table, fallback to customer if no profile exists
            role = "customer"  # Default role
            if profile_response.data:
                role = profile_response.data.get("role", "customer")

            # Return user data from Supabase, using profile role
            return models.User(
                id=user_response.user.id,
                email=user_response.user.email,
                name=user_response.user.user_metadata.get('name', ''),
                phone=user_response.user.user_metadata.get('phone'),
                role=role  # Always use role from profiles table
            )

        except Exception as e:
            error_msg = str(e) if str(e) else "Could not validate credentials"
            error_code = AuthErrorCode.INVALID_TOKEN
            if "expired" in error_msg.lower():
                error_code = AuthErrorCode.TOKEN_EXPIRED
                error_msg = "Your session has expired. Please login again."
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "message": error_msg,
                    "code": error_code
                },
                headers={"WWW-Authenticate": "Bearer"},
            )

    except Exception as e:
        raise credentials_exception


async def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    """
    Get the current active user.

    Args:
        current_user: The current authenticated user

    Returns:
        models.User: The active user

    Raises:
        HTTPException: If user is inactive
    """
    # Check if user exists and has role/status fields
    if not hasattr(current_user, 'role') or current_user.role not in ['customer', 'admin', 'ops', 'support']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail={
                "message": "Invalid or unrecognized user role. Please contact support.",
                "code": AuthErrorCode.INVALID_ROLE
            }
        )
    return current_user


async def get_current_admin(
    current_user: models.User = Security(
        get_current_user,
        scopes=["admin"],
    )
) -> models.User:
    """
    Get the current admin user from a JWT token.

    Args:
        current_user: The current authenticated user

    Returns:
        models.User: The authenticated admin user

    Raises:
        HTTPException: If authentication fails or user is not an admin
    """
    if not current_user or current_user.role not in ("admin", "ops"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": "Not enough permissions",
                "code": AuthErrorCode.FORBIDDEN
            },
            headers={"WWW-Authenticate": "Bearer"}
        )
    return current_user


async def get_current_user_or_none(
    token: str = Depends(oauth2_scheme)
) -> Optional[models.User]:
    """
    Get the current user if authenticated, otherwise return None.
    Used for endpoints that support both authenticated and anonymous access.

    Args:
        token: The JWT token (optional)

    Returns:
        Optional[models.User]: The current user or None if not authenticated
    """
    if not token:
        return None

    try:
        # Create empty SecurityScopes object
        security_scopes = SecurityScopes([])
        return await get_current_user(security_scopes, token)
    except HTTPException:
        return None


async def create_anonymous_token(email: str) -> tuple[str, int]:
    """
    Create a JWT token for anonymous access using Supabase.

    Args:
        email: Email address for the anonymous user

    Returns:
        tuple[str, int]: The token and expiration time in seconds

    Raises:
        HTTPException: If token creation fails
    """
    try:
        supabase = get_supabase()

        # Use Supabase to create a magic link session
        response = supabase.auth.sign_in_with_otp({
            "email": email,
            "options": {
                "data": {
                    "is_anonymous": True
                }
            }
        })

        if not response or not response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Failed to create anonymous token",
                    "code": AuthErrorCode.INVALID_TOKEN
                }
            )

        # Return token with expiration time
        expires_in = ANONYMOUS_TOKEN_EXPIRE_MINUTES * 60
        return response.session.access_token, expires_in

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": str(e) if str(e) else "Failed to create anonymous token",
                "code": AuthErrorCode.INVALID_TOKEN
            }
        )


async def get_current_user_or_anonymous(
    token: Optional[str] = Depends(oauth2_scheme)
) -> Union[models.User, Dict[str, Any], None]:
    """
    Get the current user if authenticated, or anonymous token data.
    Used for endpoints that support both authenticated and anonymous access.

    Args:
        token: The JWT token (optional)

    Returns:
        Union[models.User, dict, None]: The current user, anonymous token data, or None
    """
    # Allow access without token
    if not token:
        return {
            "email": None,
            "is_anonymous": True
        }

    try:
        supabase = get_supabase()
        user_response = supabase.auth.get_user(token)

        # Return user data from Supabase
        return models.User(
            id=user_response.user.id,
            email=user_response.user.email,
            name=user_response.user.user_metadata.get('name', ''),
            phone=user_response.user.user_metadata.get('phone'),
            role=user_response.user.user_metadata.get('role', 'customer')
        )

    except Exception:
        return None


async def create_or_update_profile(user_data: models.User) -> None:
    """
    Create or update user profile in Supabase.

    Args:
        user_data: User data to create/update profile

    Raises:
        HTTPException: If profile creation/update fails
    """
    try:
        supabase = get_supabase()

        profile_data = {
            "id": user_data.id,
            "name": user_data.name,
            "email": user_data.email,
            "phone": user_data.phone,
            "role": user_data.role,
            "updated_at": "now()"
        }

        # Upsert profile (create if not exists, update if exists)
        result = supabase.table("profiles").upsert(profile_data).execute()

        if not result.data:
            logger.error(
                f"Failed to create/update profile for user: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "message": "Failed to create/update profile",
                    "code": AuthErrorCode.DATABASE_ERROR
                }
            )

        logger.info(
            f"Successfully created/updated profile for user: {user_data.email}")

    except Exception as e:
        logger.error(f"Error creating/updating profile: {str(e)}")
        
        # Check for common database constraint errors and provide user-friendly messages
        error_str = str(e)
        
        # Duplicate email constraint violation
        if "'code': '23505'" in error_str and "profiles_email_key" in error_str:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "message": "This email address is already associated with another account.",
                    "code": AuthErrorCode.EMAIL_EXISTS,
                    "field": "email",
                    "help": "Please use a different email address or login to your existing account."
                }
            )
        # Duplicate phone constraint violation
        elif "'code': '23505'" in error_str and "profiles_phone_key" in error_str:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "message": "This phone number is already associated with another account.",
                    "code": AuthErrorCode.INVALID_INPUT,
                    "field": "phone",
                    "help": "Please use a different phone number or login to your existing account."
                }
            )
        # Handle any other constraint violations
        elif "'code': '23" in error_str:  # Other PostgreSQL constraint errors start with 23
            constraint_message = "A validation error occurred with your account details."
            # Try to extract the field name from the error
            field_match = None
            if "key" in error_str.lower():
                field_parts = error_str.split("(")
                if len(field_parts) > 1:
                    field_candidate = field_parts[1].split(")")[0]
                    field_match = field_candidate if field_candidate else "unknown"
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": constraint_message,
                    "code": AuthErrorCode.INVALID_INPUT,
                    "field": field_match if field_match else "unknown",
                    "help": "Please check your information and try again."
                }
            )
        # Generic database error
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "message": "Unable to create or update your profile due to a system error.",
                    "code": AuthErrorCode.DATABASE_ERROR,
                    "request_id": f"profile-{int(time.time())}"
                }
            )


async def create_user_record(user_data: models.User) -> None:
    """
    Create user record in the users table.

    Args:
        user_data: User data to create record

    Raises:
        HTTPException: With appropriate status code and error details
    """
    try:
        # Use service role client for admin operations
        supabase = get_supabase(use_admin=True)

        user_record = {
            "id": user_data.id,
            "email": user_data.email,
            "name": user_data.name,
            "phone": user_data.phone,
            "role": user_data.role,
            "created_at": "now()",
            "updated_at": "now()"
        }

        # Upsert user record using service role
        result = supabase.table("users").upsert(user_record).execute()

        if not result.data:
            logger.error(
                f"Failed to create user record for: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "message": "Failed to create user record",
                    "code": AuthErrorCode.DATABASE_ERROR
                },
                headers={"X-Error-Code": AuthErrorCode.DATABASE_ERROR}
            )

        logger.info(f"Successfully created user record for: {user_data.email}")

    except Exception as e:
        logger.error(f"Error creating user record: {str(e)}")
        error_str = str(e)
        
        # Check for common database constraint errors and provide user-friendly messages
        # Email uniqueness constraint
        if "'code': '23505'" in error_str and "users_email_key" in error_str:
            logger.warning(f"Duplicate email attempt: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "message": "An account with this email address already exists.",
                    "code": AuthErrorCode.EMAIL_EXISTS,
                    "field": "email",
                    "help": "Please log in to your existing account or use a different email address."
                }
            )
        # Phone uniqueness constraint
        elif "'code': '23505'" in error_str and "users_phone_key" in error_str:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "message": "An account with this phone number already exists.",
                    "code": AuthErrorCode.INVALID_INPUT,
                    "field": "phone",
                    "help": "Please use a different phone number or log in to your existing account."
                }
            )
        # Foreign key constraint
        elif "'code': '23503'" in error_str:  # Foreign key violation
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Unable to create user record due to a reference error.",
                    "code": AuthErrorCode.DATABASE_ERROR,
                    "help": "Please ensure all required information is provided correctly."
                }
            )
        # Other constraint violations
        elif "'code': '23" in error_str:  # Other PostgreSQL constraint errors start with 23
            # Try to extract the field name from the error
            field_match = None
            if "key" in error_str.lower():
                field_parts = error_str.split("(")
                if len(field_parts) > 1:
                    field_candidate = field_parts[1].split(")")[0]
                    field_match = field_candidate if field_candidate else "unknown"
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "A validation error occurred with your account information.",
                    "code": AuthErrorCode.INVALID_INPUT,
                    "field": field_match if field_match else "unknown",
                    "help": "Please check your information and try again."
                }
            )
        # Service role authentication error
        elif "auth/insufficient_permissions" in error_str.lower() or "permission denied" in error_str.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "message": "You don't have permission to perform this operation.",
                    "code": AuthErrorCode.FORBIDDEN,
                    "help": "Please contact support if you believe this is an error."
                }
            )
        # Generic database error
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "message": "Unable to create your account due to a system error.",
                    "code": AuthErrorCode.DATABASE_ERROR,
                    "request_id": f"user-{int(time.time())}",
                    "help": "Please try again later or contact support if the problem persists."
                }
            )


@router.post("/signup",
             response_model=Union[schemas.Token, schemas.SignupResponse],
             responses={
                 200: {
                     "description": "Successfully created user account",
                     "content": {
                         "application/json": {
                             "examples": {
                                 "token": {
                                     "value": {
                                         "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1...",
                                         "token_type": "bearer"
                                     }
                                 },
                                 "email_confirmation": {
                                     "value": {
                                         "message": "Please check your email to confirm your account before logging in.",
                                         "email": "user@example.com",
                                         "requires_confirmation": True
                                     }
                                 }
                             }
                         }
                     }
                 },
                 409: {
                     "description": "Email already exists",
                     "content": {
                         "application/json": {
                             "example": {
                                 "detail": {
                                     "message": "Email already registered",
                                     "code": AuthErrorCode.EMAIL_EXISTS,
                                     "email": "user@example.com"
                                 }
                             }
                         }
                     }
                 },
                 400: {
                     "description": "Invalid input",
                     "content": {
                         "application/json": {
                             "example": {
                                 "detail": {
                                     "message": "Invalid email format or password requirements not met",
                                     "code": AuthErrorCode.INVALID_INPUT,
                                     "field": "email"
                                 }
                             }
                         }
                     }
                 },
                 502: {
                     "description": "Authentication service error",
                     "content": {
                         "application/json": {
                             "example": {
                                 "detail": {
                                     "message": "Authentication service unavailable",
                                     "code": AuthErrorCode.SERVICE_UNAVAILABLE
                                 }
                             }
                         }
                     }
                 }
             }
             )
async def signup(
    user_data: schemas.UserCreateWithBookings
) -> Union[schemas.Token, schemas.SignupResponse]:
    """
    Create a new user account.

    Args:
        user_data: The user registration data

    Returns:
        Union[schemas.Token, schemas.SignupResponse]: Access token or signup response

    Raises:
        HTTPException: With appropriate status codes and error details
    """
    logger.info(f"Starting user signup process for email: {user_data.email}")

    try:
        supabase = get_supabase()

        # First check if email exists in users table to avoid unnecessary auth attempts
        try:
            existing_user = supabase.table("users").select("email").eq(
                "email", user_data.email).single().execute()
            if existing_user.data:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={
                        "message": "This email address is already registered. Please use a different email or reset your password.",
                        "code": AuthErrorCode.EMAIL_EXISTS,
                        "email": user_data.email
                    }
                )
        except Exception as db_error:
            if "23505" in str(db_error):  # Postgres unique constraint violation
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={
                        "message": "This email address is already registered. Please use a different email or reset your password.",
                        "code": AuthErrorCode.EMAIL_EXISTS,
                        "email": user_data.email
                    }
                )

        # Validate password requirements
        if len(user_data.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Password must be at least 8 characters long. Please choose a stronger password.",
                    "code": AuthErrorCode.INVALID_PASSWORD,
                    "field": "password",
                    "requirement": "min_length_8"
                }
            )

        try:
            # Create user in Supabase Auth
            auth_response = supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password,
                "options": {
                    "data": {
                        "name": user_data.name,
                        "phone": user_data.phone,
                        "role": "customer"
                    }
                }
            })

            if not auth_response:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail={
                        "message": "Authentication service is currently unavailable. Please try again later.",
                        "code": AuthErrorCode.SERVICE_UNAVAILABLE
                    }
                )

            if not auth_response.user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "message": "Registration failed. Please ensure your email format is valid and password meets requirements.",
                        "code": AuthErrorCode.INVALID_INPUT,
                        "help": "Try using a different email format or stronger password"
                    }
                )

            # Create user model
            user = models.User(
                id=auth_response.user.id,
                email=user_data.email,
                name=user_data.name,
                phone=user_data.phone,
                role="customer"
            )

            # Create profile and user record
            try:
                await create_or_update_profile(user)
                await create_user_record(user)
            except Exception as db_error:
                # If profile/record creation fails, attempt to delete the auth user
                try:
                    supabase.auth.admin.delete_user(user.id)
                except:
                    pass
                raise db_error

            # Handle email confirmation requirement
            if not auth_response.session:
                return schemas.SignupResponse(
                    message="Please check your email to confirm your account before logging in.",
                    email=user_data.email,
                    requires_confirmation=True
                )

            return schemas.Token(
                access_token=auth_response.session.access_token,
                token_type="bearer"
            )

        except HTTPException:
            raise
        except Exception as auth_error:
            if "User already registered" in str(auth_error):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={
                        "message": "Email already registered",
                        "code": AuthErrorCode.EMAIL_EXISTS,
                        "email": user_data.email
                    }
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": str(auth_error),
                    "code": AuthErrorCode.INVALID_INPUT
                }
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during signup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": "An unexpected error occurred during signup. Please try again.",
                "code": AuthErrorCode.SERVICE_UNAVAILABLE
            }
        )


@router.post("/token",
             response_model=schemas.Token,
             summary="Create access token for user",
             description="""
    ## Login to get access token
    
    Use this endpoint to obtain a JWT token for authentication:
    - Username: Your email address
    - Password: Your account password
    
    The token can then be used in the Authorize button above or in the Bearer authentication header.
    """,
             responses={
                 200: {
                     "description": "Successful login",
                     "content": {
                         "application/json": {
                             "example": {
                                 "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1...",
                                 "token_type": "bearer"
                             }
                         }
                     }
                 },
                 401: {
                     "description": "Invalid credentials",
                     "content": {
                         "application/json": {
                             "example": {
                                 "detail": {
                                     "message": "Invalid email or password",
                                     "code": AuthErrorCode.INVALID_CREDENTIALS
                                 }
                             }
                         }
                     }
                 },
                 403: {
                     "description": "Account not confirmed",
                     "content": {
                         "application/json": {
                             "example": {
                                 "detail": {
                                     "message": "Please confirm your email before logging in",
                                     "code": AuthErrorCode.USER_NOT_CONFIRMED,
                                     "email": "user@example.com"
                                 }
                             }
                         }
                     }
                 }
             }
             )
@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends()
) -> schemas.Token:
    """
    Authenticate user and create access token.
    """
    logger.info(f"Login attempt for user: {form_data.username}")

    try:
        # Get a fresh client instance
        supabase = get_supabase()

        # Authenticate with Supabase
        logger.debug("Attempting Supabase authentication")
        auth_response = supabase.auth.sign_in_with_password({
            "email": form_data.username,
            "password": form_data.password
        })

        if not auth_response or not auth_response.user:
            logger.warning(
                f"Invalid login attempt for user: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "message": "Login failed. Please check your email and password and try again.",
                    "code": AuthErrorCode.INVALID_CREDENTIALS,
                    "field": "credentials"
                },
                headers={"WWW-Authenticate": "Bearer"}
            )

        # Create/update user record and profile on successful login
        user = models.User(
            id=auth_response.user.id,
            email=auth_response.user.email,
            name=auth_response.user.user_metadata.get('name', ''),
            phone=auth_response.user.user_metadata.get('phone'),
            role=auth_response.user.user_metadata.get('role', 'customer')
        )

        # Ensure user record exists
        await create_user_record(user)

        # Update profile
        await create_or_update_profile(user)

        return schemas.Token(
            access_token=auth_response.session.access_token,
            token_type="bearer"
        )

    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "Invalid login credentials" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "message": "Login failed. Please check your email and password and try again.",
                    "code": AuthErrorCode.INVALID_CREDENTIALS,
                    "field": "credentials"
                },
                headers={"WWW-Authenticate": "Bearer"}
            )
        elif "User not confirmed" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "message": "Account not confirmed. Please check your email for verification instructions.",
                    "code": AuthErrorCode.USER_NOT_CONFIRMED,
                    "email": form_data.username,
                    "help": "Check your inbox and spam folder for the verification email"
                },
                headers={"WWW-Authenticate": "Bearer"}
            )
        else:
            logger.error(f"Login error: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "message": "An unexpected error occurred during login. Please try again later.",
                    "code": AuthErrorCode.SERVICE_UNAVAILABLE,
                    "request_id": f"login-{int(time.time())}"
                },
                headers={"WWW-Authenticate": "Bearer"}
            )


@router.post("/logout")
async def logout(
    current_user: models.User = Depends(get_current_active_user)
) -> dict:
    """
    Logout the current user.

    Args:
        current_user: The current authenticated user

    Returns:
        dict: Success message
    """
    logger.info(f"Processing logout request for user: {current_user.email}")
    supabase = get_supabase()

    try:
        logger.debug("Attempting to sign out from Supabase")
        supabase.auth.sign_out()
        logger.info(f"User {current_user.email} logged out successfully")
        return {"message": "Logged out successfully"}
    except Exception as e:
        # Even if Supabase logout fails, we return success
        # Since the token will expire eventually
        logger.warning(f"Supabase logout failed but proceeding: {str(e)}")
        return {"message": "Logged out successfully"}


@router.post("/anonymous-token", response_model=schemas.AnonymousToken)
async def create_anonymous_access_token(
    token_request: schemas.AnonymousTokenRequest
) -> schemas.AnonymousToken:
    """
    Create an anonymous access token for temporary access.

    Args:
        token_request: The token request data containing email

    Returns:
        schemas.AnonymousToken: The anonymous access token
    """
    access_token, expires_in = await create_anonymous_token(token_request.email)

    return schemas.AnonymousToken(
        access_token=access_token,
        token_type="bearer",
        email=token_request.email,
        expires_in=expires_in
    )


@router.post("/forgot-password", response_model=dict)
async def forgot_password(request: schemas.PasswordResetRequest):
    """
    Send a password reset email to the user.

    Args:
        request: Password reset request containing email

    Returns:
        dict: Success message
    """
    logger.info(f"Password reset requested for email: {request.email}")
    try:
        supabase = get_supabase()

        # Request password reset from Supabase
        logger.debug("Sending password reset email through Supabase")
        response = supabase.auth.reset_password_email(request.email)
        logger.info(
            f"Password reset email sent successfully to {request.email}")

        return {"message": "Password reset instructions sent to your email"}

    except Exception as e:
        # Don't reveal if email exists for security
        logger.warning(
            f"Password reset request failed for {request.email}: {str(e)}")
        return {"message": "If an account exists with this email, password reset instructions will be sent"}


@router.post("/reset-password", response_model=schemas.Token)
async def reset_password(
    reset_data: schemas.PasswordReset
):
    """
    Reset user's password using the reset token.

    Args:
        reset_data: Password reset data containing token and new password

    Returns:
        schemas.Token: New access token

    Raises:
        HTTPException: If token is invalid or expired
    """
    logger.info("Processing password reset request")
    try:
        supabase = get_supabase()

        # Password validation
        if len(reset_data.new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Password must be at least 8 characters long",
                    "code": AuthErrorCode.INVALID_PASSWORD,
                    "requirement": "min_length_8"
                }
            )

        try:
            # Verify the reset token and reset the password
            auth_response = supabase.auth.reset_password_for_email(
                reset_data.email,
                {
                    "password": reset_data.new_password,
                    "token": reset_data.token
                }
            )

            # If auth_response has no session, token was likely invalid
            if not auth_response or not auth_response.user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "message": "Password reset failed. The reset link may be invalid or expired.",
                        "code": AuthErrorCode.PASSWORD_RESET_FAILED,
                        "help": "Please request a new password reset link"
                    }
                )

            # Return token for automatic login
            return schemas.Token(
                access_token=auth_response.session.access_token,
                token_type="bearer"
            )

        except Exception as auth_error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Password reset failed. The reset link may be invalid or expired.",
                    "code": AuthErrorCode.PASSWORD_RESET_FAILED,
                    "error": str(auth_error),
                    "help": "Please request a new password reset link"
                }
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": "An unexpected error occurred during password reset. Please try again.",
                "code": AuthErrorCode.SERVICE_UNAVAILABLE,
                "request_id": f"reset-{int(time.time())}"
            }
        )


@router.post("/verify-token", response_model=schemas.TokenVerificationResponse)
async def verify_token(token_data: schemas.TokenVerification):
    """
    Verify if a token is valid and return user information.

    Args:
        token_data: Token verification request

    Returns:
        schemas.TokenVerificationResponse: Token validity and user info
    """
    logger.info("Processing token verification request")
    try:
        supabase = get_supabase()

        # Verify token with Supabase
        logger.debug("Verifying token with Supabase")
        user_response = supabase.auth.get_user(token_data.token)

        logger.info(
            f"Token verified successfully for user: {user_response.user.email}")
        return schemas.TokenVerificationResponse(
            valid=True,
            user_id=user_response.user.id,
            email=user_response.user.email
        )

    except Exception as e:
        logger.warning(f"Token verification failed: {str(e)}")
        return schemas.TokenVerificationResponse(
            valid=False
        )


@router.get("/me",
            response_model=schemas.User,
            summary="Get current user info",
            description="Test the authentication by retrieving current user information",
            responses={
                200: {"description": "Successfully retrieved user information"},
                401: {"description": "Not authenticated"},
                403: {"description": "Not enough permissions"}
            }
            )
async def read_users_me(
    current_user: models.User = Depends(get_current_active_user)
):
    """Test endpoint to verify authentication"""
    return current_user


@router.post("/set-admin-role", response_model=schemas.User)
@retry_on_db_error(retries=3)
async def set_admin_role(
    role_update: schemas.RoleUpdate,
    current_user: models.User = Depends(get_current_admin)
) -> models.User:
    """
    Set admin role for a specific user email.
    Only existing admins can execute this function.

    Args:
        role_update: The role update request containing target email
        current_user: The current admin user making the request

    Returns:
        models.User: Updated user data

    Raises:
        HTTPException: If operation fails or user not found
    """
    supabase = get_supabase(use_admin=True)

    try:
        # Update user metadata with new role
        user_metadata = {
            "role": role_update.role
        }

        # Update auth user metadata
        await supabase.auth.admin.update_user_by_id(
            role_update.user_id,
            {"user_metadata": user_metadata}
        )

        # Update profile table
        profile_data = {
            "role": role_update.role,
            "updated_at": "now()"
        }

        result = supabase.table("profiles").update(profile_data).eq(
            "id", role_update.user_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "message": "Failed to update user role",
                    "code": AuthErrorCode.DATABASE_ERROR
                }
            )

        return result.data[0]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": f"Failed to update user role: {str(e)}",
                "code": AuthErrorCode.DATABASE_ERROR
            }
        )


@router.post("/initialize-admin", response_model=schemas.User)
@retry_on_db_error(retries=3)
async def initialize_admin(
    role_update: schemas.RoleUpdate
) -> models.User:
    """
    Initialize the first admin user. This endpoint can only be used once
    when there are no admin users in the system.

    Args:
        role_update: The role update request containing target email

    Returns:
        models.User: The initialized admin user
    """
    target_user_id = role_update.user_id

    try:
        supabase = get_supabase(use_admin=True)

        # Check if any admin users exist
        profiles_response = supabase.table("profiles").select(
            "*").eq("role", "admin").execute()
        if profiles_response.data and len(profiles_response.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "message": "Admin user already exists",
                    "code": AuthErrorCode.FORBIDDEN
                }
            )

        # Get existing user data
        existing_profile = supabase.table("profiles").select(
            "*").eq("id", target_user_id).single().execute()

        if not existing_profile.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "message": "User profile not found",
                    "code": AuthErrorCode.USER_NOT_FOUND
                }
            )

        # Get the target user
        user_response = supabase.auth.admin.list_users()
        target_user = next(
            (user for user in user_response if user.id == target_user_id), None)

        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "message": f"User with ID {target_user_id} not found",
                    "code": AuthErrorCode.USER_NOT_FOUND
                }
            )

        # Update user metadata with admin role
        supabase.auth.admin.update_user_by_id(
            target_user.id,
            {"user_metadata": {"role": "admin"}}
        )

        # Prepare update data preserving existing values
        profile_data = {
            "id": target_user.id,
            "name": existing_profile.data["name"],
            "email": existing_profile.data["email"],
            "phone": existing_profile.data["phone"],
            "role": "admin",
            "updated_at": "now()"
        }

        # Update both tables with complete data
        result = supabase.table("profiles").upsert(profile_data).execute()
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "message": "Failed to update user profile",
                    "code": AuthErrorCode.DATABASE_ERROR
                }
            )

        result = supabase.table("users").upsert(profile_data).execute()
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "message": "Failed to update user record",
                    "code": AuthErrorCode.DATABASE_ERROR
                }
            )

        logger.info(
            f"Successfully initialized first admin user: {target_user.email}")

        return models.User(
            id=target_user.id,
            email=target_user.email,
            name=existing_profile.data["name"],
            phone=existing_profile.data["phone"],
            role="admin"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error initializing admin user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": f"Failed to initialize admin user: {str(e)}",
                "code": AuthErrorCode.DATABASE_ERROR
            }
        )
