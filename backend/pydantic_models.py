"""
Pydantic models and request/response schemas for Kiangombe Patient Center API.
Organized by feature/concern for better maintainability.
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from decimal import Decimal


# ============================================================================
# Enums
# ============================================================================

class Role(str, Enum):
    """User roles."""
    SUPER_ADMIN = "super_admin"
    CLINICIAN_ADMIN = "clinician_admin"
    DOCTOR = "doctor"
    NURSE = "nurse"
    RECEPTIONIST = "receptionist"
    LAB_TECHNICIAN = "lab_technician"
    PHARMACIST = "pharmacist"
    PATIENT = "patient"


class AppointmentStatus(str, Enum):
    """Appointment statuses."""
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PaymentStatus(str, Enum):
    """Payment statuses."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class PrescriptionStatus(str, Enum):
    """Prescription statuses."""
    PENDING = "pending"
    FILLED = "filled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# ============================================================================
# Authentication
# ============================================================================

class CreateUserRequest(BaseModel):
    """User registration request."""
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72, description="Password must be 8-72 characters (bcrypt limit)")
    phone: Optional[str] = Field(None, max_length=20)
    gender: Optional[str] = Field(None, description="Gender: male, female, other, prefer_not_to_say")
    date_of_birth: Optional[str] = Field(None, description="Date of birth in ISO format (YYYY-MM-DD)")


class CreateStaffRequest(BaseModel):
    """Staff registration request with role."""
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72, description="Password must be 8-72 characters (bcrypt limit)")
    phone: Optional[str] = Field(None, max_length=20)
    gender: Optional[str] = Field(None, description="Gender: male, female, other, prefer_not_to_say")
    date_of_birth: Optional[str] = Field(None, description="Date of birth in ISO format (YYYY-MM-DD)")
    role: str = Field(..., description="Staff role: doctor, nurse, receptionist, lab_technician, pharmacist")
    specialization: Optional[str] = Field(None, max_length=120)
    bio: Optional[str] = None
    license_number: Optional[str] = None
    consultation_fee: Optional[Decimal] = None
    is_available: bool = True


class LoginUserRequest(BaseModel):
    """User login request."""
    email: EmailStr
    password: str = Field(..., max_length=72)


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Optional[dict] = None


class TokenVerifyRequest(BaseModel):
    """Token verification request."""
    token: str


class TokenVerificationResponse(BaseModel):
    """Token verification response."""
    valid: bool
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    """Password reset request."""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Password reset with token."""
    new_password: str = Field(..., min_length=8, max_length=72)


# ============================================================================
# User & Profile
# ============================================================================

class UserProfileResponse(BaseModel):
    """User profile response."""
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_verified: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Appointments
# ============================================================================

class AppointmentCreateRequest(BaseModel):
    """Create appointment request."""
    patient_id: int
    clinician_id: int
    visit_type: Optional[str] = None
    scheduled_at: datetime
    triage_notes: Optional[str] = None
    specialization: Optional[str] = None
    cost: Decimal = Decimal("0.0")


class AppointmentRescheduleRequest(BaseModel):
    """Reschedule appointment request."""
    scheduled_at: Optional[datetime] = None


class AppointmentCancelRequest(BaseModel):
    """Cancel appointment request."""
    cancellation_reason: Optional[str] = None


# ============================================================================
# Prescriptions
# ============================================================================

class PrescriptionCreateRequest(BaseModel):
    """Create prescription request."""
    appointment_id: int
    pharmacy_name: Optional[str] = None
    medications_json: Optional[str] = None
    status: Optional[str] = None
    qr_code_path: Optional[str] = None


class PrescriptionUpdateRequest(BaseModel):
    """Update prescription request."""
    pharmacy_name: Optional[str] = None
    medications_json: Optional[str] = None
    status: Optional[str] = None
    qr_code_path: Optional[str] = None


# ============================================================================
# Doctors
# ============================================================================

class DoctorCreateRequest(BaseModel):
    """Create doctor profile request."""
    user_id: int
    specialization: Optional[str] = Field(None, max_length=120)
    bio: Optional[str] = None
    license_number: Optional[str] = None
    consultation_fee: Optional[Decimal] = None
    rating: Optional[Decimal] = None
    is_available: bool = True


class DoctorUpdateRequest(BaseModel):
    """Update doctor profile request."""
    specialization: Optional[str] = None
    bio: Optional[str] = None
    license_number: Optional[str] = None
    consultation_fee: Optional[Decimal] = None
    is_available: Optional[bool] = None
    rating: Optional[Decimal] = None


class DoctorResponse(BaseModel):
    """Doctor profile response."""
    id: int
    user_id: int
    fullName: str
    email: str
    phone: Optional[str] = None
    specialization: Optional[str] = None
    bio: Optional[str] = None
    isAvailable: bool
    rating: Decimal
    consultationFee: Optional[Decimal] = None
    patientsCount: int
    avatar: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Payments
# ============================================================================

class PaymentRequest(BaseModel):
    """Payment request."""
    appointment_id: int
    amount: Decimal = Field(..., gt=0)
    payment_method: str = Field(..., description="card, mpesa, bank_transfer")
    card_number: Optional[str] = None
    card_expiry: Optional[str] = None
    card_cvv: Optional[str] = None
    phone_number: Optional[str] = None


class PaymentResponse(BaseModel):
    """Payment response."""
    transaction_id: str
    status: str
    amount: Decimal
    message: str


# ============================================================================
# Medications
# ============================================================================

class MedicationCreateRequest(BaseModel):
    """Create medication request."""
    name: str = Field(..., min_length=1, max_length=150)
    category: str = Field(..., min_length=1, max_length=100)
    dosage: Optional[str] = Field(None, max_length=100)
    price: Decimal = Field(..., gt=0)
    stock: int = Field(default=0, ge=0)
    description: Optional[str] = None
    prescription_required: bool = False
    expiry_date: Optional[datetime] = None
    batch_number: Optional[str] = Field(None, max_length=100)
    supplier: Optional[str] = Field(None, max_length=150)


class MedicationUpdateRequest(BaseModel):
    """Update medication request."""
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    dosage: Optional[str] = Field(None, max_length=100)
    price: Optional[Decimal] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    description: Optional[str] = None
    prescription_required: Optional[bool] = None
    expiry_date: Optional[datetime] = None
    batch_number: Optional[str] = Field(None, max_length=100)
    supplier: Optional[str] = Field(None, max_length=150)


class MedicationResponse(BaseModel):
    """Medication response."""
    id: int
    name: str
    category: str
    dosage: Optional[str] = None
    price: Decimal
    stock: int
    description: Optional[str] = None
    prescription_required: bool
    expiry_date: Optional[datetime] = None
    batch_number: Optional[str] = None
    supplier: Optional[str] = None
    in_stock: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Addresses
# ============================================================================

class AddressCreateRequest(BaseModel):
    """Create address request."""
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    phone_number: str = Field(..., max_length=20)
    address: str = Field(..., max_length=100)
    additional_info: Optional[str] = Field(None, max_length=255)
    region: Optional[str] = Field(None, max_length=100)
    city: str = Field(..., max_length=100)
    is_default: bool = False


class AddressResponse(AddressCreateRequest):
    """Address response."""
    id: int
    user_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Generic Responses
# ============================================================================

class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    detail: Optional[str] = None


class ErrorResponse(BaseModel):
    """Error response."""
    error: str
    status_code: int
    detail: Optional[str] = None


class PaginatedResponse(BaseModel):
    """Paginated response wrapper."""
    items: List[Dict[str, Any]]
    total: int
    page: int
    limit: int
    pages: int


# ============================================================================
# Video Consultations
# ============================================================================

class VideoConsultationCreateRequest(BaseModel):
    """Create video consultation request."""
    appointment_id: int


class VideoConsultationUpdateRequest(BaseModel):
    """Update video consultation request."""
    status: Optional[str] = None  # waiting, active, ended
    notes: Optional[str] = None


class VideoTokenRequest(BaseModel):
    """Request for video token."""
    uid: int


class VideoTokenResponse(BaseModel):
    """Video token response."""
    token: str
    uid: int
    appId: str
    channelName: str


class VideoConsultationResponse(BaseModel):
    """Video consultation response."""
    id: int
    appointment_id: int
    room_id: str
    doctor_id: int
    patient_id: int
    status: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    recording_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
