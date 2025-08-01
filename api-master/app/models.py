# app/models.py
from datetime import datetime
from typing import Optional, Dict, Any, List
from uuid import uuid4
from pydantic import BaseModel, Field, EmailStr, validator
from decimal import Decimal


def generate_uuid() -> str:
    return str(uuid4())


class BookingBase(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    user_id: Optional[str] = None
    postcode: str
    address: Optional[str] = None
    geolocation: Optional[str] = None  # "latitude,longitude" as string
    status: str
    collection_time: Optional[datetime] = None
    quote: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class VisionAnalysisResultBase(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    booking_id: str
    result_json: Dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.now)


class AdminAuditLogBase(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    admin_user_id: Optional[str] = None
    action: str
    previous_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None
    reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)


class QuoteHistoryBase(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    booking_id: str
    breakdown: Dict[str, Any]
    override: bool = False
    override_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class StripePaymentBase(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    booking_id: str
    stripe_payment_intent_id: Optional[str] = None
    stripe_charge_id: Optional[str] = None
    amount: Decimal
    currency: str
    status: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class StripeEventBase(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    stripe_event_id: str
    event_type: str
    payload: Dict[str, Any]
    processed: bool = False
    created_at: datetime = Field(default_factory=datetime.now)


class UserBase(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    name: str
    email: EmailStr
    role: str = "customer"
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class EstimationRuleBase(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    rule_name: str
    rule_description: Optional[str] = None
    rule_type: str
    min_value: Optional[Decimal] = None
    max_value: Optional[Decimal] = None
    multiplier: Decimal
    active: bool = True
    currency: str = "GBP"
    zipcode: Optional[str] = None
    postcode_prefix: Optional[str] = None
    base_rate: Optional[Decimal] = None
    hazard_surcharge: Optional[Decimal] = None
    access_fee: Optional[Decimal] = None
    dismantling_fee: Optional[Decimal] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    @validator('rule_type')
    def validate_rule_type(cls, v):
        allowed_types = [
            "hazard_multiplier",
            "location_modifier",
            "dismantling_fee_adjustment",
            "base_rate_adjustment",
            "volume_estimation"
        ]
        if v not in allowed_types:
            raise ValueError(f"rule_type must be one of {allowed_types}")
        return v


class MediaUploadBase(BaseModel):
    """Model for storing media uploads associated with bookings."""
    id: str = Field(default_factory=generate_uuid)
    booking_id: str
    image_urls: List[str]
    waste_location: str
    access_restricted: bool = False
    dismantling_required: bool = False
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class CustomerDetailsBase(BaseModel):
    """Model for storing customer details associated with bookings."""
    id: str = Field(default_factory=generate_uuid)
    booking_id: str
    full_name: str
    contact_number: str
    email: EmailStr
    collection_date: datetime
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class ComplianceRegulationBase(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    region: str
    regulation_code: str
    notes: Optional[str] = None
    effective_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class MediaAttachmentBase(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    booking_id: str
    s3_key: str
    ai_analysis: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.now)


class ReviewBase(BaseModel):
    """Model for storing user reviews and ratings for bookings."""
    id: str = Field(default_factory=generate_uuid)
    booking_id: str
    user_id: str
    rating: int
    comment: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    @validator('rating')
    def validate_rating(cls, v):
        if not 1 <= v <= 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

class User(UserBase):
    pass


class EstimationRule(EstimationRuleBase):
    pass

class MediaUpload(MediaUploadBase):
    pass

