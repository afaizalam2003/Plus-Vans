from supabase import create_client, Client
import os
from dotenv import load_dotenv
from typing import Optional, Union
from loguru import logger
import asyncio
from functools import wraps

# Load environment variables
load_dotenv()

# Get Supabase credentials from environment
SUPABASE_URL: str = os.getenv("SUPABASE_URL")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing required Supabase environment variables")

# Initialize Supabase clients
supabase: Optional[Client] = None
admin_supabase: Optional[Client] = None


def handle_supabase_error(func):
    """Decorator to handle Supabase errors consistently."""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            error_msg = str(e)
            if "Invalid login credentials" in error_msg:
                raise SupabaseError(
                    "Invalid email or password", status_code=401)
            elif "JWT expired" in error_msg:
                raise SupabaseError(
                    "Session expired, please login again", status_code=401)
            elif "Invalid JWT" in error_msg:
                raise SupabaseError(
                    "Invalid authentication token", status_code=401)
            elif "relation" in error_msg and "does not exist" in error_msg:
                # Handle missing table errors separately
                logger.warning(f"Table does not exist: {error_msg}")
                return await handle_missing_table(error_msg)
            else:
                logger.error(f"Supabase error in {func.__name__}: {error_msg}")
                raise SupabaseError(
                    f"Database error: {error_msg}", status_code=500)
    return wrapper


async def handle_missing_table(error_msg: str) -> bool:
    """Handle cases where required tables don't exist."""
    if "system_health" in error_msg:
        try:
            # Create system_health table using RPC or raw SQL
            if admin_supabase:
                await admin_supabase.rpc('create_system_health_table', {}).execute()
                logger.info("Created system_health table successfully")
                return True
        except Exception as e:
            logger.error(f"Failed to create system_health table: {str(e)}")
            # Fall back to a simpler verification method
            return await verify_connection_simple()
    return False


async def verify_connection_simple() -> bool:
    """Simple connection verification using a basic query."""
    try:
        # Try a simple SELECT 1 query
        result = supabase.rpc('check_connection', {}).execute()
        return True
    except Exception as e:
        logger.error(f"Failed simple connection verification: {str(e)}")
        raise SupabaseError("Could not verify database connection") from e


async def init_supabase() -> None:
    """
    Initialize Supabase connection and verify it's working.
    Should be called when the application starts.
    """
    global supabase, admin_supabase

    try:
        # Initialize regular client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

        # Initialize admin client if service key is available
        if SUPABASE_SERVICE_KEY:
            admin_supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

        # First try to verify connection with system_health table
        try:
            await verify_connection()
        except SupabaseError:
            # If that fails, try simple verification
            await verify_connection_simple()

        logger.info("✅ Supabase connection initialized successfully")

    except Exception as e:
        logger.error(f"❌ Failed to initialize Supabase connection: {str(e)}")
        raise SupabaseError(
            f"Failed to initialize database connection: {str(e)}")


@handle_supabase_error
async def verify_connection() -> bool:
    """
    Verify that the Supabase connection is working by making a simple query.

    Returns:
        bool: True if connection is working, raises exception otherwise
    """
    if not supabase:
        raise SupabaseError("Supabase client not initialized")

    try:
        # Try to fetch system health check table
        result = supabase.table('system_health').select("*").limit(1).execute()
        return True
    except Exception as e:
        logger.error(f"Failed to verify Supabase connection: {str(e)}")
        raise


def get_supabase(use_admin: bool = False) -> Client:
    """
    Get the initialized Supabase client instance.

    Args:
        use_admin: Whether to use the admin client with service role key

    Returns:
        Client: The Supabase client instance

    Raises:
        SupabaseError: If the client is not initialized
    """
    if not supabase:
        raise SupabaseError(
            "Supabase client not initialized. Call init_supabase() first.")

    if use_admin:
        if not admin_supabase:
            raise SupabaseError(
                "Admin Supabase client not initialized. Check SUPABASE_SERVICE_KEY.")
        return admin_supabase

    return supabase


class SupabaseError(Exception):
    """Custom exception for Supabase errors."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)
