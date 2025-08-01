"""
FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from loguru import logger
from app.routes import auth, profile, booking, admin, payments, review
from app.supabase import init_supabase, SupabaseError

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Plus Vans API",
    description="API for Plus Vans van conversion booking system",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://www.plusvans.co.uk",  # Production domain
        "https://plus-vans-app.vercel.app",  # Vercel deployment
        "https://admin.plusvans.co.uk",  # Admin portal
        "admin.plusvans.co.uk"  # Admin portal
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


import asyncio

@app.on_event("startup")
async def startup_event():
    """Initialize connections and resources on application startup."""
    try:
        logger.info("Initializing Supabase connection...")
        # Add a timeout to prevent hanging forever
        try:
            await asyncio.wait_for(init_supabase(), timeout=10.0)
        except asyncio.TimeoutError:
            logger.error("Supabase connection timed out. Starting in offline mode.")
            # Continue startup even if Supabase times out
            return
            
    except SupabaseError as e:
        logger.error(f"Failed to initialize Supabase: {str(e)}")
        # Continue startup even if Supabase fails
        return
    except Exception as e:
        logger.error(f"Unexpected error during startup: {str(e)}")
        # Continue startup for other errors
        return

# Include API routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(booking.router)
app.include_router(payments.router)
app.include_router(review.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    """Root endpoint returning API information."""
    from app.supabase import supabase
    
    supabase_status = "disconnected"
    if supabase is not None:
        try:
            # Try a simple query to verify connection
            supabase.table('system_health').select("*").limit(1).execute()
            supabase_status = "connected"
        except Exception:
            supabase_status = "error"
    
    return {
        "app": "Plus Vans API",
        "version": "1.0.0",
        "status": "running",
        "supabase": supabase_status,
        "stripe_enabled": os.getenv("STRIPE_ENABLED", "false").lower() == "true"
    }

# uvicorn app.main:app --reload
