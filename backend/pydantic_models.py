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
# Staff Role Models
# ============================================================================

class StaffRoleBase(BaseModel):
    """Base staff role model."""
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    permissions: List[str] = Field(default_factory=list)
    is_active: bool = True
    requires_specialization: bool = False
    requires_license: bool = False
    default_consultation_fee: Optional[Decimal] = Field(None, ge=0)


class StaffRoleCreate(StaffRoleBase):
    """Staff role creation request."""
    pass


class StaffRoleUpdate(BaseModel):
    """Staff role update request."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    permissions: Optional[List[str]] = None
    is_active: Optional[bool] = None
    requires_specialization: Optional[bool] = None
    requires_license: Optional[bool] = None
    default_consultation_fee: Optional[Decimal] = Field(None, ge=0)


class StaffRoleResponse(StaffRoleBase):
    """Staff role response."""
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Staff Creation Models (Updated)
# ============================================================================

class StaffAccountCreate(BaseModel):
    """Staff account creation data."""
    full_name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: Optional[str] = Field(None, max_length=20)
    gender: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[datetime] = None
    role: str  # This will be the role name from StaffRole
    profile_image: Optional[str] = None  # URL to profile image


class StaffProfileCreate(BaseModel):
    """Staff profile creation data."""
    specialization: Optional[str] = Field(None, max_length=120)
    bio: Optional[str] = Field(None, max_length=1000)
    consultation_fee: Optional[Decimal] = Field(None, ge=0)
    license_number: Optional[str] = Field(None, max_length=50)
    is_available: bool = True


class StaffCreateRequest(BaseModel):
    """Complete staff creation request."""
    account: StaffAccountCreate
    profile: StaffProfileCreate


class StaffResponse(BaseModel):
    """Staff member response."""
    id: int
    full_name: str
    email: str
    phone: Optional[str]
    role: str
    staff_role: Optional[StaffRoleResponse] = None
    specialization: Optional[str]
    is_available: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


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
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    role: str
    is_verified: bool
    created_at: datetime
    profile_picture: Optional[str] = None
    address: Optional[str] = None
    emergencyContact: Optional[str] = None
    bloodType: Optional[str] = None
    allergies: Optional[str] = None
    
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


class AppointmentUpdateRequest(BaseModel):
    """Update appointment request."""
    status: Optional[AppointmentStatus] = None
    triage_notes: Optional[str] = None
    cost: Optional[Decimal] = None


class AppointmentResponse(BaseModel):
    """Appointment response model."""
    id: int
    patient_id: int
    clinician_id: int
    visit_type: Optional[str] = None
    specialization: Optional[str] = None
    scheduled_at: datetime
    status: AppointmentStatus
    triage_notes: Optional[str] = None
    cost: Decimal
    cancellation_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AppointmentCancelRequest(BaseModel):
    """Cancel appointment request."""
    cancellation_reason: Optional[str] = None


# ============================================================================
# Prescriptions
# ============================================================================

class PrescriptionCreateRequest(BaseModel):
    """Create prescription request."""
    appointment_id: Optional[int] = None
    patient_id: int
    doctor_id: int
    medications: List[dict]  # List of medication objects
    instructions: Optional[str] = None
    expiry_date: Optional[str] = None
    pharmacy_name: Optional[str] = None


class PrescriptionResponse(BaseModel):
    """Prescription response model."""
    id: int
    appointment_id: Optional[int] = None
    patient_id: Optional[int] = None
    issued_by_doctor_id: Optional[int] = None
    doctor_name: Optional[str] = None
    pharmacy_name: Optional[str] = None
    medications_json: Optional[Any] = None
    status: Optional[str] = None
    qr_code_path: Optional[str] = None
    issued_date: datetime
    expiry_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


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
# Doctor Profile Sections
# ============================================================================

class DoctorEducationRequest(BaseModel):
    """Doctor education/certification request."""
    title: str = Field(..., min_length=1, max_length=200)
    institution: str = Field(..., min_length=1, max_length=200)
    year: Optional[str] = Field(None, min_length=1, max_length=4, pattern=r'^\d{1,4}$')
    type: str = Field(..., enum=['degree', 'certification', 'license'])
    license_number: Optional[str] = Field(None, max_length=50)
    expiry_date: Optional[str] = Field(None, pattern=r'^\d{4}-\d{2}-\d{2}$')

class DoctorEducationResponse(BaseModel):
    """Doctor education/certification response."""
    id: int
    doctor_id: int
    title: str
    institution: str
    year: Optional[str] = None
    type: str
    license_number: Optional[str] = None
    expiry_date: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class DoctorContactInfoRequest(BaseModel):
    """Doctor contact info request."""
    hospital: Optional[str] = Field(None, max_length=200)
    department: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=300)
    languages: Optional[List[str]] = []
    consultation_fee: Optional[Decimal] = Field(None, ge=0)
    response_rate: Optional[Decimal] = Field(None, ge=0, le=100)
    on_time_rate: Optional[Decimal] = Field(None, ge=0, le=100)
    patient_satisfaction: Optional[Decimal] = Field(None, ge=0, le=5)

class DoctorContactInfoResponse(BaseModel):
    """Doctor contact info response."""
    id: int
    doctor_id: int
    hospital: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    languages: Optional[List[str]] = []
    consultation_fee: Optional[Decimal] = None
    response_rate: Optional[Decimal] = None
    on_time_rate: Optional[Decimal] = None
    patient_satisfaction: Optional[Decimal] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class DoctorAvailabilityRequest(BaseModel):
    """Doctor availability request."""
    day: str = Field(..., enum=['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    is_open: bool = True
    start_time: Optional[str] = Field(None, pattern=r'^\d{2}:\d{2}$')
    end_time: Optional[str] = Field(None, pattern=r'^\d{2}:\d{2}$')
    break_start: Optional[str] = Field(None, pattern=r'^\d{2}:\d{2}$')
    break_end: Optional[str] = Field(None, pattern=r'^\d{2}:\d{2}$')
    appointment_duration: int = Field(30, ge=15, le=180)
    buffer_time: int = Field(10, ge=0, le=60)
    max_appointments_per_day: int = Field(20, ge=1, le=50)

class DoctorAvailabilityResponse(BaseModel):
    """Doctor availability response."""
    id: int
    doctor_id: int
    day: str
    is_open: bool
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    break_start: Optional[str] = None
    break_end: Optional[str] = None
    appointment_duration: int
    buffer_time: int
    max_appointments_per_day: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class DoctorSettingsRequest(BaseModel):
    """Doctor settings request."""
    # Profile visibility settings
    show_profile_to_patients: bool = True
    show_rating_reviews: bool = True
    allow_online_booking: bool = True
    show_availability: bool = True
    
    # Notification settings
    email_notifications: bool = True
    sms_notifications: bool = True
    appointment_reminders: bool = True
    new_appointment_requests: bool = True
    cancellation_alerts: bool = True
    patient_messages: bool = True
    weekly_summary: bool = False
    marketing_emails: bool = False
    
    # Consultation types enabled
    in_person_consultations: bool = True
    video_consultations: bool = True
    phone_consultations: bool = True
    chat_consultations: bool = False

class DoctorSettingsResponse(BaseModel):
    """Doctor settings response."""
    id: int
    doctor_id: int
    # Profile visibility settings
    show_profile_to_patients: bool
    show_rating_reviews: bool
    allow_online_booking: bool
    show_availability: bool
    
    # Notification settings
    email_notifications: bool
    sms_notifications: bool
    appointment_reminders: bool
    new_appointment_requests: bool
    cancellation_alerts: bool
    patient_messages: bool
    weekly_summary: bool
    marketing_emails: bool
    
    # Consultation types enabled
    in_person_consultations: bool
    video_consultations: bool
    phone_consultations: bool
    chat_consultations: bool
    
    created_at: datetime
    
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
    image_url: Optional[str] = Field(None, max_length=500)


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
    image_url: Optional[str] = Field(None, max_length=500)


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
    image_url: Optional[str] = None
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


class ImageResponse(BaseModel):
    """Image upload response."""
    message: str
    img_url: str


# ============================================================================
# Patient Profile Models
# ============================================================================

class MedicalInfoRequest(BaseModel):
    """Medical information request model."""
    blood_type: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    allergies: Optional[List[str]] = []
    conditions: Optional[List[str]] = []
    medications: Optional[List[str]] = []


class MedicalInfoResponse(BaseModel):
    """Medical information response model."""
    id: int
    patient_id: int
    blood_type: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    allergies: Optional[List[str]] = []
    conditions: Optional[List[str]] = []
    medications: Optional[List[str]] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EmergencyContactRequest(BaseModel):
    """Emergency contact request model."""
    name: str
    phone: str
    relation: str


class EmergencyContactResponse(BaseModel):
    """Emergency contact response model."""
    id: int
    patient_id: int
    name: str
    phone: str
    relation: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InsuranceRequest(BaseModel):
    """Insurance request model."""
    provider: str
    policy_number: str
    group_number: Optional[str] = None
    holder_name: str


class InsuranceResponse(BaseModel):
    """Insurance response model."""
    id: int
    patient_id: int
    provider: str
    policy_number: str
    group_number: Optional[str] = None
    holder_name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationSettingsRequest(BaseModel):
    """Notification settings request model."""
    email_notifications: Optional[bool] = True
    sms_notifications: Optional[bool] = True
    appointment_reminders: Optional[bool] = True
    lab_results_notifications: Optional[bool] = True


class NotificationSettingsResponse(BaseModel):
    """Notification settings response model."""
    id: int
    patient_id: int
    email_notifications: bool
    sms_notifications: bool
    appointment_reminders: bool
    lab_results_notifications: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SecuritySettingsRequest(BaseModel):
    """Security settings request model."""
    two_factor_enabled: Optional[bool] = False
    login_alerts: Optional[bool] = True


class SecuritySettingsResponse(BaseModel):
    """Security settings response model."""
    id: int
    patient_id: int
    two_factor_enabled: bool
    login_alerts: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ActivityLogResponse(BaseModel):
    """Activity log response model."""
    id: int
    user_id: int
    action: str
    device: Optional[str] = None
    location: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Chat Models
# ============================================================================

class ChatMessageRequest(BaseModel):
    """Chat message request model."""
    recipient_id: int
    appointment_id: Optional[int] = None
    message: str
    message_type: str = "text"

    class Config:
        from_attributes = True


class ChatMessageResponse(BaseModel):
    """Chat message response model."""
    id: int
    sender_id: int
    recipient_id: int
    appointment_id: Optional[int] = None
    message: str
    message_type: str
    is_read: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatRoomRequest(BaseModel):
    """Chat room request model."""
    doctor_id: int
    appointment_id: Optional[int] = None

    class Config:
        from_attributes = True


class ChatRoomResponse(BaseModel):
    """Chat room response model."""
    id: int
    patient_id: int
    doctor_id: int
    appointment_id: Optional[int] = None
    is_active: bool
    last_message_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatRoomWithMessages(BaseModel):
    """Chat room with messages response model."""
    id: int
    patient_id: int
    doctor_id: int
    appointment_id: Optional[int] = None
    is_active: bool
    last_message_at: datetime
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True
