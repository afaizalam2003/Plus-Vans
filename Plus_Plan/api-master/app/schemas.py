# app/schemas.py
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict


class AnalyzeContext(BaseModel):
    locationType: str
    dismantlingRequired: bool
    notes: Optional[str] = None


class AnalyzeRequest(BaseModel):
    images: List[str]
    context: AnalyzeContext


class PriceComponents(BaseModel):
    base: float
    hazardSurcharge: float
    accessFee: float

    class Config:
        json_schema_extra = {
            "example": {
                "base": 150.0,
                "hazardSurcharge": 30.0,
                "accessFee": 20.0
            }
        }


class Breakdown(BaseModel):
    volume: str
    materialRisk: float
    priceComponents: PriceComponents

    class Config:
        json_schema_extra = {
            "example": {
                "volume": "10",
                "materialRisk": 0.2,
                "priceComponents": {
                    "base": 150.0,
                    "hazardSurcharge": 30.0,
                    "accessFee": 20.0
                }
            }
        }


class Explanation(BaseModel):
    heatmapUrl: Optional[str] = None
    similarCases: Optional[List[Any]] = None

    class Config:
        json_schema_extra = {
            "example": {
                "heatmapUrl": None,
                "similarCases": []
            }
        }


class PriceComponentsResponse(BaseModel):
    base_rate: float
    hazard_surcharge: float
    access_fee: float
    dismantling_fee: float
    total: float

    class Config:
        json_schema_extra = {
            "example": {
                "base_rate": 150.0,
                "hazard_surcharge": 30.0,
                "access_fee": 20.0,
                "dismantling_fee": 40.0,
                "total": 240.0
            }
        }


class BreakdownResponse(BaseModel):
    volume: str
    material_risk: float
    postcode: str
    price_components: PriceComponentsResponse

    class Config:
        json_schema_extra = {
            "example": {
                "volume": "10",
                "material_risk": 0.2,
                "postcode": "SW1A 1AA",
                "price_components": {
                    "base_rate": 150.0,
                    "hazard_surcharge": 30.0,
                    "access_fee": 20.0,
                    "dismantling_fee": 40.0,
                    "total": 240.0
                }
            }
        }


class ExplanationResponse(BaseModel):
    heatmapUrl: Optional[str] = None
    similarCases: List[Any] = []
    applied_rules: List[Any] = []

    class Config:
        json_schema_extra = {
            "example": {
                "heatmapUrl": None,
                "similarCases": [],
                "applied_rules": []
            }
        }


class AnalyzeResponse(BaseModel):
    breakdown: BreakdownResponse
    compliance: List[str]
    explanation: ExplanationResponse

    class Config:
        json_schema_extra = {
            "example": {
                "breakdown": {
                    "volume": "10",
                    "material_risk": 0.2,
                    "postcode": "SW1A 1AA",
                    "price_components": {
                        "base_rate": 150.0,
                        "hazard_surcharge": 30.0,
                        "access_fee": 20.0,
                        "dismantling_fee": 40.0,
                        "total": 240.0
                    }
                },
                "compliance": [],
                "explanation": {
                    "heatmapUrl": None,
                    "similarCases": [],
                    "applied_rules": []
                }
            }
        }

    def model_dump(self) -> Dict[str, Any]:
        """Override model_dump to ensure JSON serialization."""
        return {
            "breakdown": {
                "volume": str(self.breakdown.volume),
                "materialRisk": float(self.breakdown.materialRisk),
                "priceComponents": {
                    "base": float(self.breakdown.priceComponents.base),
                    "hazardSurcharge": float(self.breakdown.priceComponents.hazardSurcharge),
                    "accessFee": float(self.breakdown.priceComponents.accessFee)
                }
            },
            "compliance": list(self.compliance),
            "explanation": {
                "heatmapUrl": self.explanation.heatmapUrl if self.explanation else None,
                "similarCases": list(self.explanation.similarCases) if self.explanation and self.explanation.similarCases else []
            }
        }


# app/schemas.py

# Auth Schemas

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class PasswordResetRequest(BaseModel):
    email: EmailStr

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com"
            }
        }


class PasswordReset(BaseModel):
    token: str
    new_password: str

    class Config:
        json_schema_extra = {
            "example": {
                "token": "reset-token-from-email",
                "new_password": "newSecurePassword123"
            }
        }


class TokenVerification(BaseModel):
    token: str

    class Config:
        json_schema_extra = {
            "example": {
                "token": "access-token-to-verify"
            }
        }


class TokenVerificationResponse(BaseModel):
    valid: bool
    user_id: Optional[str] = None
    email: Optional[EmailStr] = None

    class Config:
        json_schema_extra = {
            "example": {
                "valid": True,
                "user_id": "user-uuid",
                "email": "user@example.com"
            }
        }


class Token(BaseModel):
    access_token: str
    token_type: str
    converted_bookings: Optional[List[str]] = None
    failed_bookings: Optional[List[Dict[str, str]]] = None


class SignupResponse(BaseModel):
    message: str
    email: EmailStr
    requires_confirmation: bool = True

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Please check your email to confirm your account before logging in.",
                "email": "user@example.com",
                "requires_confirmation": True
            }
        }

# Profile Schemas


class UserProfile(BaseModel):
    id: str
    name: Optional[str]
    email: EmailStr
    phone: Optional[str]
    role: Optional[str]

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    name: Optional[str]
    phone: Optional[str]
    role: Optional[str]

# Booking Schemas


class PostcodeRequest(BaseModel):
    postcode: str


class PostcodeResponse(BaseModel):
    available: bool
    message: str


class MediaUploadRequest(BaseModel):
    """Pydantic model for media upload request validation."""

    booking_id: str
    image_urls: List[str]  # URLs or file references
    waste_location: str  # e.g., "Roadside", "Basement", etc.
    access_restricted: bool = False
    dismantling_required: bool = False

    class Config:
        from_attributes = True


class CustomerDetails(BaseModel):
    booking_id: str
    full_name: str
    contact_number: str
    email: EmailStr
    collection_date: datetime


class QuoteResponse(BaseModel):
    breakdown: Any
    compliance: List[str]
    explanation: Optional[Any]


class BookingCreate(BaseModel):
    postcode: str
    address: str
    geolocation: Optional[str]
    status: str
    collection_time: Optional[datetime]
    quote: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True


class BookingUpdate(BaseModel):
    postcode: Optional[str]
    address: Optional[str]
    status: Optional[str]
    collection_time: Optional[datetime]

    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }
        from_attributes = True


class Booking(BaseModel):
    id: str
    user_id: Optional[str]
    postcode: str
    address: str
    geolocation: Optional[str]
    status: str
    collection_time: Optional[datetime]
    quote: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Admin Schemas


class AdminAuditLog(BaseModel):
    id: str
    admin_user_id: str
    action: str
    previous_value: Optional[Dict[str, Any]]
    new_value: Optional[Dict[str, Any]]
    reason: Optional[str]
    created_at: datetime


class ComplianceRegulation(BaseModel):
    id: str  # Example: "550e8400-e29b-41d4-a716-446655440000"
    region: str  # Example: "Greater London"
    regulation_code: str  # Example: "WM2015-GL"
    notes: Optional[str]  # Example: "Hazardous waste handling requirements"
    effective_date: datetime  # Example: "2023-01-01T00:00:00"
    expiry_date: datetime  # Example: "2024-12-31T23:59:59"

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "region": "Greater London",
                "regulation_code": "WM2015-GL",
                "notes": "Hazardous waste handling requirements",
                "effective_date": "2023-01-01T00:00:00",
                "expiry_date": "2024-12-31T23:59:59"
            }
        }


class EstimationRule(BaseModel):
    id: str
    rule_name: str
    rule_description: Optional[str] = None
    rule_type: str
    min_value: Optional[float] = None  # Changed from Decimal to float
    max_value: Optional[float] = None  # Changed from Decimal to float
    multiplier: float  # Changed from Decimal to float
    active: bool = True
    currency: str = "GBP"
    zipcode: Optional[str] = None
    postcode_prefix: Optional[str] = None
    base_rate: Optional[float] = None  # Changed from Decimal to float
    hazard_surcharge: Optional[float] = None  # Changed from Decimal to float
    access_fee: Optional[float] = None  # Changed from Decimal to float
    dismantling_fee: Optional[float] = None  # Changed from Decimal to float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Updated from orm_mode
        json_schema_extra = {  # Updated from schema_extra
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "rule_name": "London Base Rate",
                "rule_description": "Base rate adjustment for London area",
                "rule_type": "base_rate_adjustment",
                "min_value": 50.00,
                "max_value": 200.00,
                "multiplier": 1.25,
                "active": True,
                "currency": "GBP",
                "postcode_prefix": "E1",
                "base_rate": 100.00,
                "hazard_surcharge": 25.00,
                "access_fee": 15.00,
                "dismantling_fee": 30.00
            }
        }


class MediaUploadResponse(BaseModel):
    id: str
    booking_id: str
    image_urls: List[str]
    waste_location: str
    access_restricted: bool
    dismantling_required: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CustomerDetailsResponse(BaseModel):
    booking_id: str
    full_name: str
    contact_number: str
    email: EmailStr
    collection_date: datetime
    address: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AnonymousBookingCreate(BaseModel):
    """Schema for creating an anonymous booking."""
    # Booking details
    postcode: str
    address: str
    geolocation: Optional[str] = None
    collection_time: Optional[datetime] = None

    # Customer details
    name: str
    phone: str
    email: EmailStr

    class Config:
        json_schema_extra = {
            "example": {
                "postcode": "SW1A 1AA",
                "address": "10 Downing Street, London",
                "name": "John Doe",
                "phone": "+44123456789",
                "email": "john.doe@example.com",
                "collection_time": "2024-03-20T14:00:00Z"
            }
        }


class UserCreateWithBookings(UserCreate):
    """Schema for user creation with optional booking conversion."""
    booking_ids: Optional[List[str]] = None

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "password": "securepassword",
                "phone": "+44123456789",
                "booking_ids": ["booking-id-1", "booking-id-2"]
            }
        }


class BookingMergeRequest(BaseModel):
    """Schema for merging anonymous bookings into an authenticated account."""
    booking_ids: List[str]

    class Config:
        json_schema_extra = {
            "example": {
                "booking_ids": ["booking-id-1", "booking-id-2"]
            }
        }


class BookingMergeResponse(BaseModel):
    """Schema for the response of a booking merge operation."""
    converted_bookings: List[str]
    failed_bookings: List[Dict[str, str]]

    class Config:
        json_schema_extra = {
            "example": {
                "converted_bookings": ["booking-id-1"],
                "failed_bookings": [{
                    "booking_id": "booking-id-2",
                    "reason": "Email does not match booking's customer details"
                }]
            }
        }


class AnonymousTokenRequest(BaseModel):
    """Schema for requesting an anonymous token."""
    email: EmailStr

    class Config:
        json_schema_extra = {
            "example": {
                "email": "anonymous@example.com"
            }
        }


class AnonymousToken(BaseModel):
    """Schema for anonymous token response."""
    access_token: str
    token_type: str = "bearer"
    email: EmailStr
    expires_in: int  # Seconds until token expires

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
                "token_type": "bearer",
                "email": "anonymous@example.com",
                "expires_in": 3600
            }
        }


class PaymentCreate(BaseModel):
    """Schema for creating a new payment."""
    booking_id: str
    amount: Decimal
    currency: str = "GBP"
    payment_method_id: Optional[str] = None
    setup_future_usage: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "booking_id": "550e8400-e29b-41d4-a716-446655440000",
                "amount": "199.99",
                "currency": "GBP",
                "payment_method_id": "pm_1Q0PsIJvEtkwdCNYMSaVuRz6",
                "setup_future_usage": "off_session"
            }
        }


class PaymentResponse(BaseModel):
    """Schema for payment response."""
    id: str
    booking_id: str
    amount: Decimal
    currency: str
    status: str
    client_secret: Optional[str] = None
    stripe_payment_intent_id: Optional[str] = None
    stripe_charge_id: Optional[str] = None
    refund_amount: Optional[Decimal] = None
    dispute_reason: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "booking_id": "550e8400-e29b-41d4-a716-446655440000",
                "amount": "199.99",
                "currency": "GBP",
                "status": "succeeded",
                "client_secret": "pi_1234567890_secret_1234567890",
                "stripe_payment_intent_id": "pi_1234567890",
                "stripe_charge_id": "ch_1234567890",
                "refund_amount": "0.00",
                "dispute_reason": None,
                "error_message": None,
                "created_at": "2024-02-21T16:00:00Z",
                "updated_at": "2024-02-21T16:00:00Z"
            }
        }


class PaymentWebhookEvent(BaseModel):
    """Schema for Stripe webhook events."""
    id: str
    type: str
    data: Dict[str, Any]
    created: int

    class Config:
        json_schema_extra = {
            "example": {
                "id": "evt_1234567890",
                "type": "payment_intent.succeeded",
                "data": {
                    "object": {
                        "id": "pi_1234567890",
                        "status": "succeeded"
                    }
                },
                "created": 1645459200
            }
        }


class ReviewBase(BaseModel):
    """Base schema for review data."""
    booking_id: str
    rating: int
    comment: str


class ReviewCreate(ReviewBase):
    """Schema for creating a new review."""
    user_id: str


class ReviewResponse(ReviewBase):
    """Schema for review responses."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "booking_id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "rating": 5,
                "comment": "Great experience!",
                "created_at": "2024-02-21T16:00:00Z",
                "updated_at": "2024-02-21T16:00:00Z"
            }
        }


class TimeSeriesPoint(BaseModel):
    """Data point for time series visualization."""
    name: str
    value: int


class BookingStats(BaseModel):
    """Statistics about bookings for admin dashboard."""
    total: int
    time_series: List[TimeSeriesPoint]
    status_distribution: List[Dict[str, Any]]


class PaymentStats(BaseModel):
    """Statistics about payments for admin dashboard."""
    total_revenue: float
    successful_revenue: float
    count: int
    time_series: List[TimeSeriesPoint]


class UserStats(BaseModel):
    """Statistics about users for admin dashboard."""
    total: int
    time_series: List[TimeSeriesPoint]


class ReviewStats(BaseModel):
    """Statistics about reviews for admin dashboard."""
    count: int
    average_rating: float


class DashboardStats(BaseModel):
    """Complete statistics for admin dashboard."""
    booking_stats: BookingStats
    payment_stats: PaymentStats
    user_stats: UserStats
    review_stats: ReviewStats


class User(BaseModel):
    """Schema for user responses."""
    id: str
    name: str
    email: EmailStr
    role: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "name": "John Doe",
                "email": "john@example.com",
                "role": "customer",
                "phone": "+44123456789",
                "created_at": "2024-02-21T16:00:00Z",
                "updated_at": "2024-02-21T16:00:00Z"
            }
        }


class RoleUpdate(BaseModel):
    user_id: str
    role: str
