"""
Kiangombe Patient Center - FastAPI Application
Healthcare management system with appointments, prescriptions, and payments.
"""
import logging
import uuid
from datetime import datetime, timedelta
import io
from starlette.responses import StreamingResponse
from reportlab.pdfgen import canvas
from typing import Annotated, List, Optional
from pathlib import Path
from decimal import Decimal

from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import joinedload, Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_, and_
from dotenv import load_dotenv

import models
from database import engine, get_db
from models import (
    User, Appointment, Prescription, Doctor, Medication,
    Role, AppointmentStatus,
    MedicalInfo, EmergencyContact, Insurance, NotificationSettings,
    SecuritySettings, ActivityLog, Wishlist
)
from auth_router import (
    router as auth_router, 
    get_current_user, 
    get_current_active_user,
    bcrypt_context
)
from doctor_profile_router import router as doctor_profile_router
from patient_router import router as patient_router
from medical_history_router import router as medical_history_router
from pgfunc import (
    dashboard_snapshot,
    get_appointments_for_user,
    get_all_doctors,
    get_doctor_by_id,
    get_doctors_by_specialization,
)
from pydantic_models import (
    CreateUserRequest, UserProfileResponse, Token, LoginUserRequest, 
    AppointmentCreateRequest, AppointmentUpdateRequest, AppointmentResponse, AppointmentRescheduleRequest,
    PrescriptionCreateRequest, PrescriptionUpdateRequest, PrescriptionResponse,
    PrescriptionStatus,
    MedicationCreateRequest,
    MedicationUpdateRequest,
    MedicationResponse,
    StaffCreateRequest,
    StaffResponse,
    DoctorCreateRequest,
    DoctorResponse,
    ImageResponse,
    MessageResponse,
    # Patient Profile Models
    MedicalInfoRequest,
    MedicalInfoResponse,
    EmergencyContactRequest,
    EmergencyContactResponse,
    InsuranceRequest,
    InsuranceResponse,
    NotificationSettingsRequest,
    NotificationSettingsResponse,
    SecuritySettingsRequest,
    SecuritySettingsResponse,
    ActivityLogResponse,
)

# Load environment
load_dotenv()

# Setup logging
logging.basicConfig(    
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Type dependency
user_dependency = Annotated[dict, Depends(get_current_active_user)]

# FastAPI App Setup
app = FastAPI(
    title="Kiangombe Patient Center API",
    description="Healthcare management system with appointments, prescriptions, and payments",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Create tables on startup
try:
    models.Base.metadata.create_all(bind=engine)
    logger.info("✓ Database tables created successfully")
except Exception as e:
    logger.warning(f"⚠ Could not create database tables: {e}")
    logger.warning("Make sure MySQL is running and credentials in .env are correct")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/test")
def test_endpoint():
    """Test endpoint to verify backend is running"""
    return {"message": "Backend is running!", "status": "ok"}

# Ensure uploads directory exists
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth_router)
app.include_router(doctor_profile_router)
app.include_router(patient_router)
app.include_router(medical_history_router)


def require_admin(*allowed_roles: Role):
    """Dependency to check if user has required admin roles."""
    async def check_admin(user: User = Depends(get_current_active_user)) -> User:
        user_role = user.role
        
        if allowed_roles and user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        return user
    
    return check_admin


# ============================================================================
# Health Check
# ============================================================================

@app.get("/health", response_model=MessageResponse)
def health_check():
    """Health check endpoint."""
    return {
        "message": "Kiangombe Patient Center API is running",
        "detail": "ok"
    }


@app.post("/upload-image", response_model=ImageResponse, status_code=status.HTTP_201_CREATED)
async def upload_image(current_user: User = Depends(get_current_active_user), file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload profile image."""
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are allowed")
        
        # Validate file size (e.g., max 5MB)
        max_size = 5 * 1024 * 1024  # 5MB in bytes
        content = await file.read()
        if len(content) > max_size:
            raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
        
        # Generate unique filename
        file_extension = file.filename.split(".")[-1].lower()
        if file_extension not in ["jpg", "jpeg", "png", "gif"]:
            raise HTTPException(status_code=400, detail="Unsupported image format")
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file
        with file_path.open("wb") as f:
            f.write(content)
        
        # Generate full URL for frontend consumption
        img_url = f"/uploads/{unique_filename}"
        
        # Update user's profile_picture in database
        current_user.profile_picture = img_url.strip()  # Remove any extra quotes or whitespace
        db.commit()
        db.refresh(current_user)
        
        logger.info(f"Profile image uploaded: {unique_filename} by user {current_user.id}")
        return {"message": "Image uploaded successfully", "img_url": img_url.strip()}
    except Exception as e:
        logger.error(f"Error uploading image: {str(e)}")
        raise HTTPException(status_code=500, detail="Error uploading image")


@app.post("/upload-medication-image", response_model=ImageResponse, status_code=status.HTTP_201_CREATED)
async def upload_medication_image(
    current_user: User = Depends(require_admin(Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN, Role.PHARMACIST)),
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    """Upload medication image (does NOT update user profile)."""
    try:
        logger.info(f"=== MEDICATION IMAGE UPLOAD REQUEST ===")
        logger.info(f"User: {current_user.full_name} (ID: {current_user.id}, Role: {current_user.role})")
        logger.info(f"File: {file.filename}, Content-Type: {file.content_type}")
        
        # Validate filename
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are allowed")
        
        # Validate file size (e.g., max 5MB)
        max_size = 5 * 1024 * 1024  # 5MB in bytes
        content = await file.read()
        logger.info(f"File size: {len(content)} bytes")
        
        if len(content) > max_size:
            raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
        
        # Generate unique filename
        if "." not in file.filename:
            raise HTTPException(status_code=400, detail="Invalid filename format")
        file_extension = file.filename.split(".")[-1].lower()
        if file_extension not in ["jpg", "jpeg", "png", "gif"]:
            raise HTTPException(status_code=400, detail="Unsupported image format")
        
        # Test UUID generation
        test_uuid = uuid.uuid4()
        logger.info(f"UUID generation test: {test_uuid}")
        
        unique_filename = f"med_{test_uuid}.{file_extension}"  # Prefix with 'med_' for medication images
        file_path = UPLOAD_DIR / unique_filename
        
        logger.info(f"Saving to: {file_path}")
        
        # Save file
        with file_path.open("wb") as f:
            f.write(content)
        
        # Generate full URL for frontend consumption
        img_url = f"/uploads/{unique_filename}"
        
        # NOTE: We do NOT update the user's profile_picture for medication images
        logger.info(f"Medication image uploaded successfully: {unique_filename} by user {current_user.id}")
        return {"message": "Medication image uploaded successfully", "img_url": img_url.strip()}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading medication image: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error uploading medication image: {str(e)}")


@app.options("/upload-image")
async def upload_image_options():
    """Handle OPTIONS requests for upload endpoint."""
    return {"message": "OPTIONS request handled"}


@app.options("/upload-medication-image")
async def upload_medication_image_options():
    """Handle OPTIONS requests for medication upload endpoint."""
    return {"message": "OPTIONS request handled"}


# ============================================================================
# User Routes
# ============================================================================

@app.post(
    "/users",
    response_model=UserProfileResponse,
    status_code=status.HTTP_201_CREATED
)
def create_user_account(
    payload: CreateUserRequest,
    db: Session = Depends(get_db)
) -> User:
    """
    Register a new user account.
    Public endpoint - no authentication required.
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered."
        )

    # Create new user with hashed password
    new_user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=bcrypt_context.hash(payload.password),
        role=Role.PATIENT,  # Default to PATIENT for all newly registered users
        phone=payload.phone,
        date_of_birth=payload.date_of_birth,
        gender=payload.gender,
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        logger.info(f"New user registered: {new_user.email}")
        return new_user
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error creating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account."
        )


@app.get("/users/me", response_model=UserProfileResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> UserProfileResponse:
    """Get current user profile."""
    # Convert relative profile_picture URL to full URL if needed
    profile_picture = current_user.profile_picture
    if profile_picture and not profile_picture.startswith('http'):
        profile_picture = f"http://localhost:8000{profile_picture}"
    
    # Get medical info and emergency contact
    medical_info = db.query(MedicalInfo).filter(MedicalInfo.patient_id == current_user.id).first()
    emergency_contact = db.query(EmergencyContact).filter(EmergencyContact.patient_id == current_user.id).first()
    
    # Get insurance information for ALL users (not just patients)
    insurance = db.query(Insurance).filter(Insurance.patient_id == current_user.id).first()
    
    return UserProfileResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        date_of_birth=current_user.date_of_birth,
        gender=current_user.gender,
        role=current_user.role.value,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        profile_picture=profile_picture,
        address=current_user.address,
        emergencyContact=emergency_contact.phone if emergency_contact else None,
        bloodType=medical_info.blood_type if medical_info else None,
        allergies=', '.join(medical_info.allergies) if medical_info and medical_info.allergies else None,
        # Include insurance data for all users
        insuranceProvider=insurance.provider if insurance else None,
        insurancePolicyNumber=insurance.policy_number if insurance else None,
        insuranceGroupNumber=insurance.group_number if insurance else None,
        insuranceHolderName=insurance.holder_name if insurance else None,
        insuranceType=insurance.insurance_type if insurance else 'standard',
        insuranceQuarterlyLimit=float(insurance.quarterly_limit) if insurance and insurance.quarterly_limit else 0,
        insuranceQuarterlyUsed=float(insurance.quarterly_used) if insurance and insurance.quarterly_used else 0,
        insuranceCoverageStartDate=insurance.coverage_start_date.strftime('%Y-%m-%d') if insurance and insurance.coverage_start_date else None,
        insuranceCoverageEndDate=insurance.coverage_end_date.strftime('%Y-%m-%d') if insurance and insurance.coverage_end_date else None
    )


@app.put("/users/me", response_model=UserProfileResponse)
def update_current_user_profile(
    update_data: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> UserProfileResponse:
    """Update current user profile."""
    # Update allowed fields
    allowed_fields = ['full_name', 'phone', 'date_of_birth', 'gender', 'profile_picture', 'address']
    for field, value in update_data.items():
        if field in allowed_fields and hasattr(current_user, field):
            setattr(current_user, field, value)
    
    # Handle insurance updates for ALL users
    insurance_fields = [
        'insuranceProvider', 'insurancePolicyNumber', 'insuranceGroupNumber', 
        'insuranceHolderName', 'insuranceType', 'insuranceQuarterlyLimit', 
        'insuranceQuarterlyUsed', 'insuranceCoverageStartDate', 'insuranceCoverageEndDate'
    ]
    
    insurance_updates = {}
    for field in insurance_fields:
        if field in update_data:
            insurance_updates[field] = update_data[field]
    
    if insurance_updates:
        # Get or create insurance record for the user
        insurance = db.query(Insurance).filter(Insurance.patient_id == current_user.id).first()
        
        if not insurance:
            # Create new insurance record
            insurance = Insurance(patient_id=current_user.id)
            db.add(insurance)
        
        # Map frontend field names to backend model fields
        field_mapping = {
            'insuranceProvider': 'provider',
            'insurancePolicyNumber': 'policy_number',
            'insuranceGroupNumber': 'group_number',
            'insuranceHolderName': 'holder_name',
            'insuranceType': 'insurance_type',
            'insuranceQuarterlyLimit': 'quarterly_limit',
            'insuranceQuarterlyUsed': 'quarterly_used',
            'insuranceCoverageStartDate': 'coverage_start_date',
            'insuranceCoverageEndDate': 'coverage_end_date'
        }
        
        # Update insurance fields
        for frontend_field, backend_field in field_mapping.items():
            if frontend_field in insurance_updates:
                value = insurance_updates[frontend_field]
                if value is not None and value != '':
                    if backend_field in ['quarterly_limit', 'quarterly_used']:
                        setattr(insurance, backend_field, value)
                    elif backend_field in ['coverage_start_date', 'coverage_end_date']:
                        if value and value != '':
                            setattr(insurance, backend_field, datetime.strptime(value, '%Y-%m-%d'))
                    else:
                        setattr(insurance, backend_field, value)
        
        insurance.updated_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(current_user)
        logger.info(f"User profile updated: {current_user.id}")
        
        # Log profile update
        from activity_logger import create_activity_log
        create_activity_log(
            user_id=current_user.id,
            action="Profile Update",
            device="Web Application",
            db=db
        )
        
        # Convert relative profile_picture URL to full URL if needed
        profile_picture = current_user.profile_picture
        if profile_picture and not profile_picture.startswith('http'):
            profile_picture = f"http://localhost:8000{profile_picture}"
        
        # Get medical info and emergency contact
        medical_info = db.query(MedicalInfo).filter(MedicalInfo.patient_id == current_user.id).first()
        emergency_contact = db.query(EmergencyContact).filter(EmergencyContact.patient_id == current_user.id).first()
        
        # Get insurance information for ALL users
        insurance = db.query(Insurance).filter(Insurance.patient_id == current_user.id).first()
        
        return UserProfileResponse(
            id=current_user.id,
            full_name=current_user.full_name,
            email=current_user.email,
            phone=current_user.phone,
            date_of_birth=current_user.date_of_birth,
            gender=current_user.gender,
            role=current_user.role.value,
            is_verified=current_user.is_verified,
            created_at=current_user.created_at,
            profile_picture=profile_picture,
            address=current_user.address,
            emergencyContact=emergency_contact.phone if emergency_contact else None,
            bloodType=medical_info.blood_type if medical_info else None,
            allergies=medical_info.allergies if medical_info else None,
            # Include insurance data for all users
            insuranceProvider=insurance.provider if insurance else None,
            insurancePolicyNumber=insurance.policy_number if insurance else None,
            insuranceGroupNumber=insurance.group_number if insurance else None,
            insuranceHolderName=insurance.holder_name if insurance else None,
            insuranceType=insurance.insurance_type if insurance else 'standard',
            insuranceQuarterlyLimit=float(insurance.quarterly_limit) if insurance and insurance.quarterly_limit else 0,
            insuranceQuarterlyUsed=float(insurance.quarterly_used) if insurance and insurance.quarterly_used else 0,
            insuranceCoverageStartDate=insurance.coverage_start_date.strftime('%Y-%m-%d') if insurance and insurance.coverage_start_date else None,
            insuranceCoverageEndDate=insurance.coverage_end_date.strftime('%Y-%m-%d') if insurance and insurance.coverage_end_date else None
        )
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error updating user profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile."
        )


# ============================================================================
# Appointment Routes
# ============================================================================

@app.post(
    "/appointments",
    response_model=None,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_active_user)],
)
def create_appointment(
    payload: AppointmentCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Appointment:
    """Create new appointment (patients can book for themselves, admins can book for anyone)."""
    
    # Check permissions: patients can only book for themselves
    if current_user.role == Role.PATIENT and payload.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patients can only book appointments for themselves"
        )
    
    # Verify patient exists
    patient = db.query(User).filter(
        User.id == payload.patient_id,
        User.role == Role.PATIENT
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient does not exist."
        )

    # Verify clinician exists
    clinician = db.query(User).filter(User.id == payload.clinician_id).first()
    if not clinician:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Clinician does not exist."
        )

    # Validate scheduled_at is in the future
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    if payload.scheduled_at <= now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Appointment time must be in the future"
        )
    
    # Validate business hours (9 AM - 6 PM)
    appointment_hour = payload.scheduled_at.hour
    if appointment_hour < 9 or appointment_hour > 18:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Appointments can only be booked between 9:00 AM and 6:00 PM"
        )

    appt = Appointment(
        patient_id=payload.patient_id,
        clinician_id=payload.clinician_id,
        visit_type=payload.visit_type,
        scheduled_at=payload.scheduled_at,
        triage_notes=payload.triage_notes,
    )
    
    try:
        db.add(appt)
        db.commit()
        db.refresh(appt)
        
        # Get clinician info for response
        clinician = db.query(User).filter(User.id == appt.clinician_id).first()
        
        appointment_response = {
            'id': appt.id,
            'patient_id': appt.patient_id,
            'clinician_id': appt.clinician_id,
            'doctor_id': appt.clinician_id,  # Add for frontend compatibility
            'doctor_name': clinician.full_name if clinician else '',
            'clinician_name': clinician.full_name if clinician else '',
            'visit_type': appt.visit_type,
            'scheduled_at': appt.scheduled_at,
            'status': appt.status.value if appt.status else 'scheduled',
            'triage_notes': appt.triage_notes,
            'cost': float(appt.cost) if appt.cost else 0.0,
            'cancellation_reason': appt.cancellation_reason,
            'created_at': appt.created_at,
            'updated_at': appt.updated_at
        }
        
        logger.info(f"Appointment created: ID {appt.id}")
        return appointment_response
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error creating appointment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create appointment."
        )


@app.get("/appointments", response_model=None)
def list_appointments(
    status_filter: Optional[AppointmentStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List appointments (filtered by user role)."""
    return get_appointments_for_user(db, current_user, status_filter)


@app.get("/appointments/{appointment_id}", response_model=None)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Appointment:
    """Get single appointment by ID."""
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )

    # Check permissions
    if current_user.role == Role.PATIENT and appt.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this appointment"
        )
    elif current_user.role == Role.CLINICIAN_ADMIN and appt.clinician_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this appointment"
        )

    return appt


@app.patch("/appointments/{appointment_id}", response_model=UserProfileResponse)
def update_appointment(
    appointment_id: int,
    payload: AppointmentRescheduleRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin(Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN)),
) -> Appointment:
    """Update appointment (admin/clinician only)."""
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(appt, field, value)

    try:
        db.commit()
        db.refresh(appt)
        logger.info(f"Appointment updated: ID {appt.id}")
        return appt
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error updating appointment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update appointment."
        )


@app.patch("/appointments/{appointment_id}/reschedule", response_model=UserProfileResponse)
def reschedule_appointment(
    appointment_id: int,
    payload: AppointmentRescheduleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Appointment:
    """Reschedule an appointment (patient or clinician only)."""
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )

    # Check permissions - allow patients, doctors, and admin
    if current_user.role == Role.PATIENT and appt.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to reschedule this appointment"
        )
    elif current_user.role == Role.DOCTOR and appt.doctor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to reschedule this appointment"
        )

    # Update appointment with new date and time
    appt.date = payload.date
    appt.time = payload.time
    appt.updated_at = datetime.utcnow()
    
    # Add notes if provided
    if payload.notes:
        appt.notes = payload.notes

    try:
        db.commit()
        db.refresh(appt)
        logger.info(f"Appointment rescheduled: ID {appt.id} by user {current_user.id}")
        return appt
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error rescheduling appointment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reschedule appointment."
        )


@app.patch("/appointments/{appointment_id}/cancel", response_model=UserProfileResponse)
def cancel_appointment(
    appointment_id: int,
    cancellation_reason: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Appointment:
    """Cancel an appointment (patient or clinician)."""
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )

    # Check permissions
    if current_user.role == Role.PATIENT and appt.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this appointment"
        )
    elif current_user.role == Role.CLINICIAN_ADMIN and appt.clinician_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this appointment"
        )

    appt.status = AppointmentStatus.CANCELLED
    appt.cancellation_reason = cancellation_reason
    
    try:
        db.commit()
        db.refresh(appt)
        logger.info(f"Appointment cancelled: ID {appt.id}")
        return appt
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error cancelling appointment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel appointment."
        )


# ============================================================================
# Prescription Routes
# ============================================================================



@app.get("/prescriptions", response_model=List[PrescriptionResponse])
def list_prescriptions(
    status_filter: Optional[PrescriptionStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[Prescription]:
    """List prescriptions (filtered by user role)."""
    # Use LEFT OUTER JOIN so prescriptions without an appointment are still returned
    query = db.query(Prescription).outerjoin(Appointment, Prescription.appointment_id == Appointment.id)

    if current_user.role == Role.PATIENT:
        # Prescriptions can either be linked directly to the patient or via an appointment
        query = query.filter(
            or_(
                Prescription.patient_id == current_user.id,
                Appointment.patient_id == current_user.id
            )
        )
    elif current_user.role == Role.CLINICIAN_ADMIN:
        # Clinicians should see prescriptions they issued directly or through appointments
        query = query.filter(
            or_(
                Appointment.clinician_id == current_user.id,
                Prescription.issued_by_doctor_id == current_user.id
            )
        )

    if status_filter:
        query = query.filter(Prescription.status == status_filter)

    prescriptions = query.all()
    return [prescription_to_response(prescription, db) for prescription in prescriptions]


def enrich_prescription_medications(medications: Optional[list], db: Session) -> list:
    if not medications:
        return []

    enriched: list = []
    for idx, item in enumerate(medications):
        if not isinstance(item, dict):
            enriched.append(item)
            continue

        medication_id = item.get("medicationId") or item.get("medication_id") or item.get("id")
        name = item.get("name") or item.get("medicine") or item.get("drug") or item.get("medication_name")
        price = item.get("price") or item.get("cost") or item.get("unit_price")

        if medication_id and (not name or price is None):
            med = db.query(Medication).filter(Medication.id == int(medication_id)).first()
            if med:
                if not name:
                    name = med.name
                if price is None:
                    # Decimal -> float for JSON serialization
                    price = float(med.price) if med.price is not None else 0

        enriched.append(
            {
                **item,
                "id": item.get("id") or medication_id or idx,
                "name": name,
                "price": price,
            }
        )

    return enriched


def prescription_to_response(prescription: Prescription, db: Session) -> PrescriptionResponse:
    return PrescriptionResponse.model_validate(
        {
            "id": prescription.id,
            "appointment_id": prescription.appointment_id,
            "patient_id": prescription.patient_id,
            "issued_by_doctor_id": prescription.issued_by_doctor_id,
            "doctor_name": getattr(prescription, "doctor_name", None),
            "pharmacy_name": prescription.pharmacy_name,
            "medications_json": enrich_prescription_medications(prescription.medications_json, db),
            "status": str(prescription.status) if prescription.status is not None else None,
            "qr_code_path": prescription.qr_code_path,
            "issued_date": prescription.issued_date,
            "expiry_date": prescription.expiry_date,
            "created_at": prescription.created_at,
            "updated_at": prescription.updated_at,
        }
    )


@app.get("/prescriptions/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Prescription:
    """Get single prescription by ID."""
    prescription = db.query(Prescription).filter(
        Prescription.id == prescription_id
    ).first()
    
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )

    # Check permissions
    appointment = prescription.appointment
    if current_user.role == Role.PATIENT:
        # allow direct prescriptions (no appointment) via patient_id
        if appointment and appointment.patient_id != current_user.id:
            if prescription.patient_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to view this prescription"
                )
        elif not appointment and prescription.patient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this prescription"
            )
    elif current_user.role == Role.CLINICIAN_ADMIN and appointment and appointment.clinician_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this prescription"
        )

    return prescription_to_response(prescription, db)


@app.post("/prescriptions", response_model=PrescriptionResponse)
def create_prescription(
    payload: PrescriptionCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Prescription:
    """Create new prescription (doctor/clinician only)."""
    logger.info("--- CREATE PRESCRIPTION ENDPOINT HIT ---")
    logger.info(f"Prescription creation request from user {current_user.id}")
    logger.info(f"Payload: {payload}")
    
    # Check permissions - only doctors, nurses, and admins can create prescriptions
    if current_user.role not in [Role.DOCTOR, Role.NURSE, Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN]:
        logger.warning(f"Unauthorized prescription creation attempt by user {current_user.id} with role {current_user.role}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create prescriptions"
        )
    
    try:
        enriched_meds = enrich_prescription_medications(payload.medications, db)

        # Create the prescription
        prescription = Prescription(
            appointment_id=payload.appointment_id,
            issued_by_doctor_id=payload.doctor_id,
            patient_id=payload.patient_id,
            pharmacy_name=payload.pharmacy_name or "Main Pharmacy",
            medications_json=enriched_meds,  # Store enriched list so UI can show medication names
            status=models.PrescriptionStatus.PENDING,
            issued_date=datetime.utcnow()
        )

        # Handle expiry date if provided
        if payload.expiry_date:
            try:
                prescription.expiry_date = datetime.fromisoformat(payload.expiry_date.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                try:
                    # Try alternative date formats
                    prescription.expiry_date = datetime.strptime(payload.expiry_date, '%Y-%m-%d')
                except ValueError:
                    prescription.expiry_date = datetime.utcnow() + timedelta(days=30)  # Default to 30 days
        
        db.add(prescription)
        db.commit()
        db.refresh(prescription)
        
        logger.info(f"Prescription created: ID {prescription.id} by user {current_user.id}")
        return prescription
        
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"SQLAlchemy Error creating prescription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"General Error creating prescription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {str(e)}"
        )


@app.patch("/prescriptions/{prescription_id}", response_model=PrescriptionResponse)
def update_prescription(
    prescription_id: int,
    payload: PrescriptionUpdateRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin(Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN)),
) -> Prescription:
    """Update prescription (admin/clinician only)."""
    prescription = db.query(Prescription).filter(
        Prescription.id == prescription_id
    ).first()
    
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prescription, field, value)

    try:
        db.commit()
        db.refresh(prescription)
        logger.info(f"Prescription updated: ID {prescription.id}")
        return prescription
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error updating prescription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update prescription."
        )



@app.get("/prescriptions/{prescription_id}/pdf")
def download_prescription_pdf(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Generate and stream a simple PDF of the prescription."""
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")

    # permission check – reuse logic similar to get_prescription
    appointment = prescription.appointment
    if current_user.role == Role.PATIENT and appointment and appointment.patient_id != current_user.id:
        if prescription.patient_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this prescription")
    if current_user.role == Role.CLINICIAN_ADMIN and appointment and appointment.clinician_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this prescription")

    # generate pdf
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=(595, 842))  # A4 points
    y = 800
    c.setFont("Helvetica-Bold", 16)
    c.drawString(40, y, f"Prescription #{prescription.id}")
    y -= 30
    c.setFont("Helvetica", 12)
    c.drawString(40, y, f"Doctor: {prescription.doctor_name or prescription.issued_by_doctor_id}")
    y -= 20
    c.drawString(40, y, f"Patient ID: {prescription.patient_id}")
    y -= 20
    c.drawString(40, y, f"Issued: {prescription.issued_date}")
    y -= 20
    c.drawString(40, y, f"Expires: {prescription.expiry_date}")
    y -= 30
    c.setFont("Helvetica-Bold", 14)
    c.drawString(40, y, "Medications:")
    y -= 20
    c.setFont("Helvetica", 12)
    meds = enrich_prescription_medications(prescription.medications_json or [], db)
    for med in meds:
        line = f"- {med.get('name', 'Medication')} {med.get('dosage', '')} {med.get('frequency', '')} {med.get('duration', '')}"
        c.drawString(50, y, line)
        y -= 18
        if y < 50:
            c.showPage()
            y = 800
    c.showPage()
    c.save()
    buffer.seek(0)
    headers = {"Content-Disposition": f"attachment; filename=prescription-{prescription.id}.pdf"}
    return StreamingResponse(buffer, media_type="application/pdf", headers=headers)


@app.delete("/prescriptions/{prescription_id}")
def delete_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete prescription (admin/clinician only)."""
    # Check permissions - only doctors, nurses, and admins can delete prescriptions
    if current_user.role not in [Role.DOCTOR, Role.NURSE, Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete prescriptions"
        )
    
    prescription = db.query(Prescription).filter(
        Prescription.id == prescription_id
    ).first()
    
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found"
        )
    
    try:
        db.delete(prescription)
        db.commit()
        logger.info(f"Prescription deleted: ID {prescription_id} by user {current_user.id}")
        return {"detail": "Prescription deleted successfully"}
        
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error deleting prescription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete prescription."
        )


@app.get("/patients", response_model=List[UserProfileResponse])
def list_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all patients (staff/admin only)."""
    # Check permissions - only staff and admins can view patient list
    if current_user.role not in [Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST, Role.PHARMACIST, Role.LAB_TECHNICIAN, Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view patient list"
        )
    
    try:
        # Return only users with PATIENT role, with their medical info eagerly loaded
        patients = db.query(User).options(joinedload(User.medical_info), joinedload(User.emergency_contact)).filter(User.role == Role.PATIENT).order_by(User.created_at.desc()).all()
        logger.info(f"Retrieved {len(patients)} patients for user {current_user.id}")
        
        # Transform to UserProfileResponse format
        patient_responses = []
        for patient in patients:
            # Extract medical info if available
            conditions = []
            medications = []
            blood_type = None
            if hasattr(patient, 'medical_info') and patient.medical_info:
                medical_info = patient.medical_info
                conditions = medical_info.conditions or []
                medications = medical_info.medications or []
                blood_type = medical_info.blood_type
            
            # Get emergency contact phone if available
            emergency_contact_phone = None
            if hasattr(patient, 'emergency_contact') and patient.emergency_contact:
                # emergency_contact might be a list, get the first item
                emergency_contact = patient.emergency_contact[0] if isinstance(patient.emergency_contact, list) else patient.emergency_contact
                if emergency_contact and hasattr(emergency_contact, 'phone'):
                    emergency_contact_phone = emergency_contact.phone
            
            patient_responses.append(UserProfileResponse(
                id=patient.id,
                full_name=patient.full_name,
                email=patient.email,
                phone=patient.phone,
                date_of_birth=patient.date_of_birth,
                gender=patient.gender,
                role=patient.role,
                is_verified=patient.is_verified,
                created_at=patient.created_at,
                profile_picture=patient.profile_picture,
                address=patient.address,
                emergencyContact=emergency_contact_phone,  # Use emergency contact phone
                bloodType=blood_type,  # Use blood type from medical info
                conditions=conditions,  # Add medical conditions
                medications=medications,  # Add medications
            ))
        
        # Debug: Log first patient data to see structure
        if patient_responses:
            first_patient = patient_responses[0]
            logger.info(f"First patient response: {first_patient.dict()}")
            logger.info(f"First patient conditions: {first_patient.conditions}")
            logger.info(f"First patient medications: {first_patient.medications}")
            logger.info(f"First patient emergency contact: {first_patient.emergencyContact}")
        else:
            logger.info("No patients found")
        
        return patient_responses
        
    except SQLAlchemyError as e:
        logger.error(f"Error fetching patients: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch patients."
        )


@app.get("/patients/{patient_id}", response_model=UserProfileResponse)
def get_patient_details(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed patient information including medical data."""
    # Check permissions - only staff and admins can view patient details
    if current_user.role not in [Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST, Role.PHARMACIST, Role.LAB_TECHNICIAN, Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view patient details"
        )
    
    try:
        # Get patient with medical info eagerly loaded
        patient = db.query(User).options(joinedload(User.medical_info), joinedload(User.emergency_contact)).filter(
            User.id == patient_id,
            User.role == Role.PATIENT
        ).first()
        
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        
        logger.info(f"Retrieved patient details for patient {patient_id} by user {current_user.id}")
        
        # Transform to UserProfileResponse format
        conditions = []
        medications = []
        blood_type = None
        if hasattr(patient, 'medical_info') and patient.medical_info:
            medical_info = patient.medical_info
            conditions = medical_info.conditions or []
            medications = medical_info.medications or []
            blood_type = medical_info.blood_type
        
        # Get emergency contact phone if available
        emergency_contact_phone = None
        if hasattr(patient, 'emergency_contact') and patient.emergency_contact:
            # emergency_contact might be a list, get the first item
            emergency_contact = patient.emergency_contact[0] if isinstance(patient.emergency_contact, list) else patient.emergency_contact
            if emergency_contact and hasattr(emergency_contact, 'phone'):
                emergency_contact_phone = emergency_contact.phone
        
        # Debug: Log medical info structure
        if hasattr(patient, 'medical_info') and patient.medical_info:
            logger.info(f"Medical info for patient {patient_id}: {patient.medical_info.__dict__}")
        else:
            logger.info(f"No medical info found for patient {patient_id}")
        
        return UserProfileResponse(
            id=patient.id,
            full_name=patient.full_name,
            email=patient.email,
            phone=patient.phone,
            date_of_birth=patient.date_of_birth,
            gender=patient.gender,
            role=patient.role,
            is_verified=patient.is_verified,
            created_at=patient.created_at,
            profile_picture=patient.profile_picture,
            address=patient.address,
            emergencyContact=emergency_contact_phone,  # Use emergency contact phone
            bloodType=blood_type,  # Use blood type from medical info
            conditions=conditions,  # Add medical conditions
            medications=medications,  # Add medications
        )
        
    except SQLAlchemyError as e:
        logger.error(f"Error fetching patient details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch patient details."
        )


@app.post("/patients/{patient_id}/medical-info")
def create_medical_info(
    patient_id: int,
    medical_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create or update medical information for a patient."""
    # Check permissions - only staff and admins can update medical info
    if current_user.role not in [Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST, Role.PHARMACIST, Role.LAB_TECHNICIAN, Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update medical information"
        )
    
    try:
        # Check if medical info already exists
        existing_medical = db.query(MedicalInfo).filter(MedicalInfo.patient_id == patient_id).first()
        
        if existing_medical:
            # Update existing medical info
            for key, value in medical_data.items():
                if hasattr(existing_medical, key):
                    setattr(existing_medical, key, value)
            existing_medical.updated_at = datetime.utcnow()
            db.commit()
            logger.info(f"Updated medical info for patient {patient_id}")
        else:
            # Create new medical info
            new_medical = MedicalInfo(
                patient_id=patient_id,
                **medical_data
            )
            db.add(new_medical)
            db.commit()
            logger.info(f"Created medical info for patient {patient_id}")
        
        return {"message": "Medical information updated successfully"}
        
    except SQLAlchemyError as e:
        logger.error(f"Error updating medical info: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update medical information."
        )


@app.post("/add-sample-medical-data")
def add_sample_medical_data(db: Session = Depends(get_db)):
    """Add sample medical data for existing patients (for testing)."""
    try:
        # Get all patients
        patients = db.query(User).filter(User.role == Role.PATIENT).all()
        
        sample_data = [
            {
                "blood_type": "A+",
                "height": "175 cm", 
                "weight": "70 kg",
                "allergies": ["Penicillin", "Peanuts"],
                "conditions": ["Hypertension", "Type 2 Diabetes"],
                "medications": ["Metformin", "Lisinopril"]
            },
            {
                "blood_type": "O+",
                "height": "162 cm",
                "weight": "58 kg", 
                "allergies": ["Dust mites"],
                "conditions": ["Asthma"],
                "medications": ["Albuterol inhaler"]
            },
            {
                "blood_type": "B+",
                "height": "180 cm",
                "weight": "85 kg",
                "allergies": [],
                "conditions": [],
                "medications": []
            }
        ]
        
        added_count = 0
        for i, patient in enumerate(patients):
            if i < len(sample_data):
                # Check if medical info already exists
                existing = db.query(MedicalInfo).filter(MedicalInfo.patient_id == patient.id).first()
                
                if not existing:
                    medical_info = MedicalInfo(
                        patient_id=patient.id,
                        **sample_data[i]
                    )
                    db.add(medical_info)
                    added_count += 1
        
        db.commit()
        logger.info(f"Added sample medical data for {added_count} patients")
        
        return {"message": f"Added sample medical data for {added_count} patients"}
        
    except Exception as e:
        logger.error(f"Error adding sample medical data: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add sample medical data."
        )


# ============================================================================
# Doctor Routes
# ============================================================================

@app.get("/doctors", response_model=List[DoctorResponse])
def list_doctors(
    specialization: Optional[str] = None,
    is_available: Optional[bool] = True,
    db: Session = Depends(get_db),
):
    """List all doctors, optionally filtered by specialization and availability."""
    try:
        logger.info(f"Fetching doctors with specialization: {specialization}, is_available: {is_available}")
        
        if specialization:
            doctors = get_doctors_by_specialization(db, specialization, is_available)
        else:
            doctors = get_all_doctors(db, is_available)

        logger.info(f"Found {len(doctors)} doctors in database")

        # Enrich doctor data with user information
        result = []
        for doctor in doctors:
            try:
                user = doctor.user
                logger.info(f"Processing doctor {doctor.id} with user {user.id if user else 'None'}")
                
                doctor_response = DoctorResponse(
                    id=doctor.id,
                    user_id=doctor.user_id,
                    fullName=user.full_name if user else "Unknown",
                    email=user.email if user else "unknown@example.com",
                    phone=user.phone if user else None,
                    specialization=doctor.specialization,
                    bio=doctor.bio,
                    isAvailable=doctor.is_available,
                    rating=doctor.rating,
                    consultationFee=doctor.consultation_fee,
                    video_consultation_fee=doctor.video_consultation_fee,
                    phone_consultation_fee=doctor.phone_consultation_fee,
                    chat_consultation_fee=doctor.chat_consultation_fee,
                    patientsCount=0,  # Would need to calculate from appointments
                    avatar=user.profile_picture if user else None
                )
                result.append(doctor_response)
                
            except Exception as e:
                logger.error(f"Error processing doctor {doctor.id}: {str(e)}")
                continue

        logger.info(f"Returning {len(result)} doctor responses")
        return result
        
    except Exception as e:
        logger.error(f"Error in list_doctors: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/doctors/{doctor_id}", response_model=DoctorResponse)
def get_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
):
    """Get a specific doctor by ID."""
    doctor = get_doctor_by_id(db, doctor_id)
    
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )

    user = doctor.user
    return {
        "id": doctor.id,
        "user_id": doctor.user_id,
        "fullName": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "specialization": doctor.specialization,
        "bio": doctor.bio,
        "isAvailable": doctor.is_available,
        "rating": float(doctor.rating) if doctor.rating else 0.0,
        "consultationFee": float(doctor.consultation_fee) if doctor.consultation_fee else 0.0,
        "patientsCount": 0,  # TODO: Calculate from appointments
        "avatar": user.profile_picture,
    }


@app.post("/add-sample-doctors")
def add_sample_doctors(db: Session = Depends(get_db)):
    """Add sample doctors for testing."""
    try:
        # Check if there are any users with doctor role
        doctor_users = db.query(User).filter(User.role == Role.DOCTOR).all()
        
        if not doctor_users:
            # Create sample doctor users first
            sample_doctors = [
                {
                    "full_name": "Dr. Sarah Johnson",
                    "email": "sarah.johnson@kiangombe.com",
                    "password_hash": bcrypt_context.hash("password123"),
                    "phone": "+254712345678",
                    "role": Role.DOCTOR,
                    "is_verified": True
                },
                {
                    "full_name": "Dr. Michael Chen",
                    "email": "michael.chen@kiangombe.com", 
                    "password_hash": bcrypt_context.hash("password123"),
                    "phone": "+254723456789",
                    "role": Role.DOCTOR,
                    "is_verified": True
                },
                {
                    "full_name": "Dr. Emily Williams",
                    "email": "emily.williams@kiangombe.com",
                    "password_hash": bcrypt_context.hash("password123"),
                    "phone": "+254734567890",
                    "role": Role.DOCTOR,
                    "is_verified": True
                }
            ]
            
            created_users = []
            for doctor_data in sample_doctors:
                user = User(**doctor_data)
                db.add(user)
                db.flush()  # Get the ID
                created_users.append(user)
            
            # Create doctor profiles for the users
            specializations = ["Cardiology", "Pediatrics", "General Practice"]
            for i, user in enumerate(created_users):
                doctor = Doctor(
                    user_id=user.id,
                    specialization=specializations[i],
                    bio=f"Experienced {specializations[i]} specialist with over 10 years of practice",
                    is_available=True,
                    rating=4.5,
                    consultation_fee=150.00,
                    video_consultation_fee=100.00,
                    phone_consultation_fee=80.00,
                    chat_consultation_fee=50.00
                )
                db.add(doctor)
            
            db.commit()
            logger.info(f"Created {len(created_users)} sample doctors")
            return {"message": f"Created {len(created_users)} sample doctors"}
        else:
            # Create doctor profiles for existing doctor users who don't have one
            existing_doctor_profiles = db.query(Doctor).all()
            existing_user_ids = [doc.user_id for doc in existing_doctor_profiles]
            
            doctors_without_profiles = [user for user in doctor_users if user.id not in existing_user_ids]
            
            if doctors_without_profiles:
                specializations = ["Cardiology", "Pediatrics", "General Practice", "Neurology", "Orthopedics"]
                for i, user in enumerate(doctors_without_profiles):
                    doctor = Doctor(
                        user_id=user.id,
                        specialization=specializations[i % len(specializations)],
                        bio=f"Experienced {specializations[i % len(specializations)]} specialist",
                        is_available=True,
                        rating=4.5,
                        consultation_fee=150.00,
                        video_consultation_fee=100.00,
                        phone_consultation_fee=80.00,
                        chat_consultation_fee=50.00
                    )
                    db.add(doctor)
                
                db.commit()
                logger.info(f"Created doctor profiles for {len(doctors_without_profiles)} existing users")
                return {"message": f"Created doctor profiles for {len(doctors_without_profiles)} existing users"}
            else:
                return {"message": "Sample doctors already exist"}
        
    except Exception as e:
        logger.error(f"Error adding sample doctors: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add sample doctors."
        )


@app.post("/add-doctor-profile-pictures")
def add_doctor_profile_pictures(db: Session = Depends(get_db)):
    """Add default profile pictures for doctors that don't have them."""
    try:
        # Get all doctors with their associated users
        doctors = db.query(Doctor).options(joinedload(Doctor.user)).all()
        
        updated_count = 0
        for doctor in doctors:
            user = doctor.user
            if user and not user.profile_picture:
                # Set a default profile picture based on the doctor's name
                default_avatar = f"/images/doctor-{doctor.id}.jpg"
                user.profile_picture = default_avatar
                updated_count += 1
        
        if updated_count > 0:
            db.commit()
            logger.info(f"Updated profile pictures for {updated_count} doctors")
            return {"message": f"Updated profile pictures for {updated_count} doctors"}
        else:
            return {"message": "All doctors already have profile pictures"}
        
    except Exception as e:
        logger.error(f"Error updating doctor profile pictures: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update doctor profile pictures."
        )


@app.get("/staff")
def list_staff(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """List all staff members (doctors, nurses, receptionists, etc.)."""
    staff_roles = [Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST, Role.LAB_TECHNICIAN, Role.PHARMACIST]
    staff_users = db.query(User).filter(User.role.in_(staff_roles)).all()
    
    logger.info(f"Found {len(staff_users)} staff users")
    for user in staff_users:
        logger.info(f"Staff user: {user.email}, role: {user.role}")
    
    result = []
    for user in staff_users:
        # Get role-specific profile data
        profile_data = None
        if user.role == Role.DOCTOR and user.doctor_profile:
            profile_data = {
                "id": user.doctor_profile.id,
                "specialization": user.doctor_profile.specialization,
                "bio": user.doctor_profile.bio,
                "isAvailable": user.doctor_profile.is_available,
                "rating": float(user.doctor_profile.rating) if user.doctor_profile.rating else 0.0,
                "consultationFee": float(user.doctor_profile.consultation_fee) if user.doctor_profile.consultation_fee else 0.0,
            }
        elif user.role == Role.NURSE and user.nurse_profile:
            profile_data = {
                "id": user.nurse_profile.id,
                "specialization": user.nurse_profile.specialization,
                "bio": user.nurse_profile.bio,
                "isAvailable": user.nurse_profile.is_available,
            }
        elif user.role == Role.RECEPTIONIST and user.receptionist_profile:
            profile_data = {
                "id": user.receptionist_profile.id,
                "bio": user.receptionist_profile.bio,
                "isAvailable": user.receptionist_profile.is_available,
            }
        elif user.role == Role.LAB_TECHNICIAN and user.lab_technician_profile:
            profile_data = {
                "id": user.lab_technician_profile.id,
                "specialization": user.lab_technician_profile.specialization,
                "bio": user.lab_technician_profile.bio,
                "isAvailable": user.lab_technician_profile.is_available,
            }
        elif user.role == Role.PHARMACIST and user.pharmacist_profile:
            profile_data = {
                "id": user.pharmacist_profile.id,
                "specialization": user.pharmacist_profile.specialization,
                "bio": user.pharmacist_profile.bio,
                "isAvailable": user.pharmacist_profile.is_available,
            }
        
        result.append({
            "id": user.id,
            "fullName": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role.value,
            "avatar": user.profile_picture,
            "doctor": profile_data,
            "patientsCount": 0,
        })
    
    return result


@app.get("/staff-roles")
def get_staff_roles(current_user: User = Depends(get_current_active_user)):
    """Get available staff roles."""
    # For now, return predefined staff roles with descriptions
    # TODO: In future, this could fetch from a database table for custom roles
    staff_roles = [
        {
            "id": "doctor",
            "name": "Doctor",
            "description": "Medical doctor who can diagnose, treat, and prescribe medications",
            "isActive": True,
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
            "customizable": True,
            "requiresSpecialization": True,
            "requiresLicense": True,
            "defaultConsultationFee": 1000.00
        },
        {
            "id": "nurse",
            "name": "Nurse",
            "description": "Nursing staff who assists doctors and provides patient care",
            "isActive": True,
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
            "customizable": True,
            "requiresSpecialization": True,
            "requiresLicense": True,
            "defaultConsultationFee": 500.00
        },
        {
            "id": "receptionist",
            "name": "Receptionist",
            "description": "Front desk staff who handles patient registration and appointments",
            "isActive": True,
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
            "customizable": True,
            "requiresSpecialization": False,
            "requiresLicense": False,
            "defaultConsultationFee": 0.00
        },
        {
            "id": "lab_technician",
            "name": "Lab Technician",
            "description": "Laboratory staff who conducts medical tests and analyses",
            "isActive": True,
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
            "customizable": True,
            "requiresSpecialization": True,
            "requiresLicense": True,
            "defaultConsultationFee": 300.00
        },
        {
            "id": "pharmacist",
            "name": "Pharmacist",
            "description": "Pharmacy staff who dispenses medications and manages inventory",
            "isActive": True,
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
            "customizable": True,
            "requiresSpecialization": True,
            "requiresLicense": True,
            "defaultConsultationFee": 400.00
        }
    ]
    
    logger.info(f"Returning {len(staff_roles)} staff roles")
    return staff_roles


@app.post("/staff-roles")
def create_staff_role(
    role_data: dict,
    current_user: User = Depends(get_current_active_user)
):
    """Create a new custom staff role."""
    # Check if user has permission to create roles
    if current_user.role not in [Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create staff roles"
        )
    
    # Validate required fields
    required_fields = ["name", "description"]
    for field in required_fields:
        if field not in role_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required field: {field}"
            )
    
    # Create new role with generated ID
    new_role = {
        "id": f"custom_{datetime.utcnow().timestamp()}",
        "name": role_data["name"],
        "description": role_data["description"],
        "isActive": role_data.get("isActive", True),
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat(),
        "customizable": True,
        "requiresSpecialization": role_data.get("requiresSpecialization", False),
        "requiresLicense": role_data.get("requiresLicense", False),
        "defaultConsultationFee": role_data.get("defaultConsultationFee", 0.0)
    }
    
    logger.info(f"Created new staff role: {new_role['name']}")
    return new_role


@app.put("/staff-roles/{role_id}")
def update_staff_role(
    role_id: str,
    role_data: dict,
    current_user: User = Depends(get_current_active_user)
):
    """Update an existing staff role."""
    # Check if user has permission to update roles
    if current_user.role not in [Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update staff roles"
        )
    
    # For now, return a success response
    # TODO: In future, this would update a database record
    updated_role = {
        "id": role_id,
        "name": role_data.get("name", "Updated Role"),
        "description": role_data.get("description", "Updated description"),
        "isActive": role_data.get("isActive", True),
        "updatedAt": datetime.utcnow().isoformat(),
        "customizable": True,
        "requiresSpecialization": role_data.get("requiresSpecialization", False),
        "requiresLicense": role_data.get("requiresLicense", False),
        "defaultConsultationFee": role_data.get("defaultConsultationFee", 0.0)
    }
    
    logger.info(f"Updated staff role: {role_id}")
    return updated_role


@app.delete("/staff-roles/{role_id}")
def delete_staff_role(
    role_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete a staff role."""
    # Check if user has permission to delete roles
    if current_user.role not in [Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete staff roles"
        )
    
    # Prevent deletion of predefined system roles
    predefined_roles = ["doctor", "nurse", "receptionist", "lab_technician", "pharmacist"]
    if role_id in predefined_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete predefined system roles"
        )
    
    logger.info(f"Deleted staff role: {role_id}")
    return {"message": "Role deleted successfully"}


@app.post(
    "/doctors",
    response_model=DoctorResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin(Role.SUPER_ADMIN))],
)
def create_doctor_endpoint(
    payload: DoctorCreateRequest,
    db: Session = Depends(get_db)
) -> Doctor:
    """Create a new doctor profile (admin only)."""
    # Verify user exists
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found."
        )

    # Check if doctor profile already exists for this user
    existing = db.query(Doctor).filter(Doctor.user_id == payload.user_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor profile already exists for this user."
        )

    doctor = Doctor(
        user_id=payload.user_id,
        specialization=payload.specialization,
        bio=payload.bio,
        license_number=payload.license_number,
        is_available=payload.is_available,
        consultation_fee=payload.consultation_fee,
        rating=payload.rating,
    )

    try:
        db.add(doctor)
        
        # Update user's profile picture if provided
        if payload.profile_picture:
            user.profile_picture = payload.profile_picture
        
        db.commit()
        db.refresh(doctor)
        logger.info(f"Doctor profile created: ID {doctor.id}")
        return doctor
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error creating doctor: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create doctor profile."
        )


# ============================================================================
# Medication Routes
# ============================================================================

@app.get("/medications", response_model=List[MedicationResponse])
def list_medications(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
) -> List[MedicationResponse]:
    """List all medications with optional filtering and search."""
    query = db.query(Medication)
    
    # Filter by category if provided
    if category:
        query = query.filter(Medication.category == category)
    
    # Search by name or description
    if search:
        query = query.filter(
            (Medication.name.ilike(f"%{search}%")) |
            (Medication.description.ilike(f"%{search}%"))
        )
    
    # Apply pagination
    total = query.count()
    medications = query.offset(skip).limit(limit).all()
    
    # Convert to MedicationResponse with absolute URLs
    medication_responses = []
    for med in medications:
        # Convert relative image_url to absolute URL
        image_url = med.image_url
        if image_url and not image_url.startswith('http'):
            image_url = f"http://localhost:8000{image_url}"
        
        medication_responses.append(MedicationResponse(
            id=med.id,
            name=med.name,
            category=med.category,
            dosage=med.dosage,
            price=med.price,
            stock=med.stock,
            description=med.description,
            prescription_required=med.prescription_required,
            expiry_date=med.expiry_date,
            batch_number=med.batch_number,
            supplier=med.supplier,
            image_url=image_url,
            in_stock=med.in_stock,
            created_at=med.created_at,
            updated_at=med.updated_at
        ))
    
    logger.info(f"Retrieved {len(medication_responses)} medications")
    return medication_responses

@app.post(
    "/medications",
    response_model=MedicationResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin(Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN, Role.PHARMACIST))],
)
def create_medication(
    payload: MedicationCreateRequest,
    db: Session = Depends(get_db)
) -> Medication:
    """Create new medication (admin/pharmacist only)."""
    logger.info("=== MEDICATION CREATION REQUEST RECEIVED ===")
    logger.info(f"Payload: {payload}")
    logger.info(f"Payload type: {type(payload)}")
    logger.info(f"Price type: {type(payload.price)}")
    logger.info(f"Price value: {payload.price}")
    logger.info(f"User has admin access")
    # Check if medication with same name already exists
    existing = db.query(Medication).filter(
        Medication.name.ilike(payload.name)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Medication with this name already exists."
        )
    
    # Determine if in stock based on stock quantity
    in_stock = payload.stock > 0
    
    try:
        logger.info("Creating Medication object...")
        logger.info(f"Name: {payload.name}")
        logger.info(f"Category: {payload.category}")
        logger.info(f"Price: {payload.price} (type: {type(payload.price)})")
        logger.info(f"Stock: {payload.stock}")
        
        medication = Medication(
            name=payload.name,
            category=payload.category,
            dosage=payload.dosage,
            price=payload.price,
            stock=payload.stock,
            description=payload.description,
            prescription_required=payload.prescription_required,
            expiry_date=payload.expiry_date,
            batch_number=payload.batch_number,
            supplier=payload.supplier,
            image_url=payload.image_url,
            in_stock=in_stock,
        )
        logger.info("Medication object created successfully")
    except Exception as e:
        logger.error(f"Error creating medication object with image_url: {str(e)}")
        # If image_url column doesn't exist, create without it
        try:
            medication = Medication(
                name=payload.name,
                category=payload.category,
                dosage=payload.dosage,
                price=payload.price,
                stock=payload.stock,
                description=payload.description,
                prescription_required=payload.prescription_required,
                expiry_date=payload.expiry_date,
                batch_number=payload.batch_number,
                supplier=payload.supplier,
                in_stock=in_stock,
            )
            logger.info("Created medication without image_url (column doesn't exist)")
        except Exception as e2:
            logger.error(f"Error creating medication without image_url: {str(e2)}")
            logger.error(f"ERROR TYPE: {type(e2).__name__}")
            logger.error(f"ERROR DETAILS: {repr(e2)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create medication: {str(e2)}"
            )
    
    try:
        logger.info("Attempting to add medication to database...")
        db.add(medication)
        logger.info("Medication added to session, attempting commit...")
        db.commit()
        logger.info("Database commit successful, refreshing medication...")
        db.refresh(medication)
        logger.info(f"SUCCESS: Medication created: {medication.name} (ID: {medication.id})")
        return medication
    except Exception as e:
        db.rollback()
        logger.error(f"DATABASE ERROR: {str(e)}")
        logger.error(f"ERROR TYPE: {type(e).__name__}")
        logger.error(f"ERROR DETAILS: {repr(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@app.get("/medications/{medication_id}", response_model=MedicationResponse)
def get_medication(
    medication_id: int,
    db: Session = Depends(get_db)
) -> Medication:
    """Get single medication by ID."""
    medication = db.query(Medication).filter(
        Medication.id == medication_id
    ).first()
    
    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found."
        )
    
    return medication


@app.put(
    "/medications/{medication_id}",
    response_model=MedicationResponse,
    dependencies=[Depends(require_admin(Role.SUPER_ADMIN, Role.PHARMACIST))],
)
def update_medication(
    medication_id: int,
    payload: MedicationUpdateRequest,
    db: Session = Depends(get_db)
) -> Medication:
    """Update medication (admin/pharmacist only)."""
    medication = db.query(Medication).filter(
        Medication.id == medication_id
    ).first()
    
    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found."
        )
    
    # Update fields if provided
    if payload.name is not None:
        medication.name = payload.name
    if payload.category is not None:
        medication.category = payload.category
    if payload.dosage is not None:
        medication.dosage = payload.dosage
    if payload.price is not None:
        medication.price = payload.price
    if payload.stock is not None:
        medication.stock = payload.stock
        medication.in_stock = payload.stock > 0
    if payload.description is not None:
        medication.description = payload.description
    if payload.prescription_required is not None:
        medication.prescription_required = payload.prescription_required
    if payload.expiry_date is not None:
        medication.expiry_date = payload.expiry_date
    if payload.batch_number is not None:
        medication.batch_number = payload.batch_number
    if payload.supplier is not None:
        medication.supplier = payload.supplier
    if payload.image_url is not None:
        medication.image_url = payload.image_url
    
    try:
        db.commit()
        db.refresh(medication)
        logger.info(f"Medication updated: {medication.name} (ID: {medication.id})")
        return medication
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error updating medication: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update medication."
        )


@app.delete(
    "/medications/{medication_id}",
    response_model=MessageResponse,
    dependencies=[Depends(require_admin(Role.SUPER_ADMIN, Role.PHARMACIST))],
)
def delete_medication(
    medication_id: int,
    db: Session = Depends(get_db)
) -> dict:
    """Delete medication (admin/pharmacist only)."""
    medication = db.query(Medication).filter(
        Medication.id == medication_id
    ).first()
    
    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found."
        )
    
    try:
        db.delete(medication)
        db.commit()
        logger.info(f"Medication deleted: {medication.name} (ID: {medication.id})")
        return {
            "message": "Medication deleted successfully",
            "detail": f"Medication '{medication.name}' has been removed from inventory."
        }
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error deleting medication: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete medication."
        )


# ============================================================================
# Dashboard Routes
# ============================================================================

@app.get("/dashboard/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
) -> dict:
    """Get dashboard summary statistics."""
    try:
        logger.info(f"Dashboard summary requested by user {_.id}")
        summary = dashboard_snapshot(db)
        logger.info(f"Dashboard summary generated: {summary}")
        return summary
    except Exception as e:
        logger.error(f"Error generating dashboard summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate dashboard summary"
        )


# ============================================================================
# Staff Creation (Simplified)
# ============================================================================

@app.post("/staff", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
def create_staff_member(
    payload: StaffCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin(Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN))
) -> User:
    """Create a new staff member with simplified role validation."""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == payload.account.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
    
    # Map role name to enum
    role_mapping = {
        "doctor": Role.DOCTOR,
        "nurse": Role.NURSE,
        "receptionist": Role.RECEPTIONIST,
        "lab_technician": Role.LAB_TECHNICIAN,
        "pharmacist": Role.PHARMACIST,
    }
    
    if payload.account.role not in role_mapping:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role: {payload.account.role}"
        )
    
    user_role = role_mapping[payload.account.role]
    
    # Create user
    new_user = User(
        full_name=payload.account.full_name,
        email=payload.account.email,
        password_hash=bcrypt_context.hash(payload.account.password),
        phone=payload.account.phone,
        role=user_role,
        is_verified=True,
        is_active=True
    )
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Create role-specific profile
        if user_role == Role.DOCTOR:
            doctor = Doctor(
                user_id=new_user.id,
                specialization=payload.profile.specialization,
                bio=payload.profile.bio,
                license_number=payload.profile.license_number,
                consultation_fee=payload.profile.consultation_fee
            )
            db.add(doctor)
        elif user_role == Role.NURSE:
            nurse = Nurse(
                user_id=new_user.id,
                specialization=payload.profile.specialization,
                bio=payload.profile.bio,
                license_number=payload.profile.license_number
            )
            db.add(nurse)
        elif user_role == Role.LAB_TECHNICIAN:
            lab_tech = LabTechnician(
                user_id=new_user.id,
                specialization=payload.profile.specialization,
                bio=payload.profile.bio,
                license_number=payload.profile.license_number
            )
            db.add(lab_tech)
        elif user_role == Role.PHARMACIST:
            pharmacist = Pharmacist(
                user_id=new_user.id,
                specialization=payload.profile.specialization,
                bio=payload.profile.bio,
                license_number=payload.profile.license_number
            )
            db.add(pharmacist)
        elif user_role == Role.RECEPTIONIST:
            receptionist = Receptionist(
                user_id=new_user.id,
                bio=payload.profile.bio
            )
            db.add(receptionist)
        
        db.commit()
        
        logger.info(f"Staff member created: {new_user.email} ({user_role.value})")
        
        return StaffResponse(
            id=new_user.id,
            email=new_user.email,
            full_name=new_user.full_name,
            phone=new_user.phone,
            role=new_user.role.value,
            specialization=payload.profile.specialization,
            is_available=payload.profile.is_available,
            created_at=new_user.created_at
        )
        
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error creating staff member: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create staff member"
        )


# ============================================================================
# Patient Profile Endpoints
# ============================================================================

@app.get("/api/patient/medical-info", response_model=MedicalInfoResponse)
async def get_medical_info(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current patient's medical information."""
    if current_user.role != Role.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can access medical information"
        )
    
    medical_info = db.query(MedicalInfo).filter(MedicalInfo.patient_id == current_user.id).first()
    
    if not medical_info:
        # Create default medical info if none exists
        medical_info = MedicalInfo(patient_id=current_user.id)
        db.add(medical_info)
        db.commit()
        db.refresh(medical_info)
    
    return medical_info

@app.put("/api/patient/medical-info", response_model=MedicalInfoResponse)
async def update_medical_info(
    medical_update: MedicalInfoRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current patient's medical information."""
    if current_user.role != Role.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can update medical information"
        )
    
    logger.info(f"Received medical update request: {medical_update}")
    
    medical_info = db.query(MedicalInfo).filter(MedicalInfo.patient_id == current_user.id).first()
    
    if not medical_info:
        medical_info = MedicalInfo(patient_id=current_user.id)
        db.add(medical_info)
    
    # Update fields
    update_data = medical_update.dict(exclude_unset=True)
    logger.info(f"Medical update data (exclude_unset): {update_data}")
    
    # Special logging for blood type
    if 'blood_type' in update_data:
        logger.info(f"BLOOD TYPE UPDATE: {update_data['blood_type']}")
    
    for field, value in update_data.items():
        logger.info(f"Updating field {field} with value: {value}")
        setattr(medical_info, field, value)
    
    try:
        db.commit()
        db.refresh(medical_info)
        logger.info(f"Medical info updated for patient: {current_user.email}")
        logger.info(f"Final medical info after update: blood_type={medical_info.blood_type}, allergies={medical_info.allergies}")
        
        # Log medical info update
        from activity_logger import create_activity_log
        create_activity_log(
            user_id=current_user.id,
            action="Medical Info Update",
            device="Web Application",
            db=db
        )
        
        return medical_info
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error updating medical info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update medical information"
        )

@app.post("/api/patient/medical-info/{item_type}", response_model=MedicalInfoResponse)
async def add_medical_item(
    item_type: str,
    payload: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add item to medical information arrays (allergies, conditions, medications)."""
    if current_user.role != Role.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can update medical information"
        )
    
    if item_type not in ['allergies', 'conditions', 'medications']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid item type. Must be: allergies, conditions, or medications"
        )
    
    value = payload.get('value')
    if not value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Value is required"
        )
    
    medical_info = db.query(MedicalInfo).filter(MedicalInfo.patient_id == current_user.id).first()
    
    if not medical_info:
        medical_info = MedicalInfo(patient_id=current_user.id)
        db.add(medical_info)
    
    # Add item to the appropriate array
    current_array = getattr(medical_info, item_type) or []
    current_array.append(value)
    setattr(medical_info, item_type, current_array)
    
    try:
        db.commit()
        db.refresh(medical_info)
        logger.info(f"Medical item added for patient {current_user.id}: {item_type} = {value}")
        return medical_info
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error adding medical item: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add medical item"
        )

@app.delete("/api/patient/medical-info/{item_type}/{index}", response_model=MedicalInfoResponse)
async def remove_medical_item(
    item_type: str,
    index: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Remove item from medical information arrays (allergies, conditions, medications)."""
    if current_user.role != Role.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can update medical information"
        )
    
    if item_type not in ['allergies', 'conditions', 'medications']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid item type. Must be: allergies, conditions, or medications"
        )
    
    medical_info = db.query(MedicalInfo).filter(MedicalInfo.patient_id == current_user.id).first()
    
    if not medical_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical information not found"
        )
    
    current_array = getattr(medical_info, item_type) or []
    
    if index < 0 or index >= len(current_array):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid index"
        )
    
    # Remove item at the specified index
    current_array.pop(index)
    setattr(medical_info, item_type, current_array)
    
    try:
        db.commit()
        db.refresh(medical_info)
        logger.info(f"Medical item removed for patient {current_user.id}: {item_type} at index {index}")
        return medical_info
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error removing medical item: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove medical item"
        )

@app.get("/api/patient/emergency-contact", response_model=EmergencyContactResponse)
async def get_emergency_contact(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current patient's emergency contact information."""
    if current_user.role != Role.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can access emergency contact information"
        )
    
    emergency_contact = db.query(EmergencyContact).filter(EmergencyContact.patient_id == current_user.id).first()
    
    if not emergency_contact:
        # Create default emergency contact if none exists
        emergency_contact = EmergencyContact(
            patient_id=current_user.id,
            name="",
            phone="",
            relation=""
        )
        db.add(emergency_contact)
        db.commit()
        db.refresh(emergency_contact)
    
    return emergency_contact

@app.put("/api/patient/emergency-contact", response_model=EmergencyContactResponse)
async def update_emergency_contact(
    contact_update: EmergencyContactRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current patient's emergency contact information."""
    if current_user.role != Role.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can update emergency contact information"
        )
    
    emergency_contact = db.query(EmergencyContact).filter(EmergencyContact.patient_id == current_user.id).first()
    
    if not emergency_contact:
        emergency_contact = EmergencyContact(patient_id=current_user.id)
        db.add(emergency_contact)
    
    # Update fields
    for field, value in contact_update.dict(exclude_unset=True).items():
        setattr(emergency_contact, field, value)
    
    try:
        db.commit()
        db.refresh(emergency_contact)
        logger.info(f"Emergency contact updated for patient: {current_user.email}")
        return emergency_contact
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error updating emergency contact: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update emergency contact"
        )

@app.get("/api/patient/insurance", response_model=InsuranceResponse)
async def get_insurance(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current patient's insurance information."""
    if current_user.role != Role.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can access insurance information"
        )
    
    insurance = db.query(Insurance).filter(Insurance.patient_id == current_user.id).first()
    
    if not insurance:
        # Create default insurance if none exists
        insurance = Insurance(
            patient_id=current_user.id,
            provider="",
            policy_number="",
            holder_name=""
        )
        db.add(insurance)
        db.commit()
        db.refresh(insurance)
    
    return insurance

@app.put("/api/patient/insurance", response_model=InsuranceResponse)
async def update_insurance(
    insurance_update: InsuranceRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current patient's insurance information."""
    if current_user.role != Role.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can update insurance information"
        )
    
    insurance = db.query(Insurance).filter(Insurance.patient_id == current_user.id).first()
    
    if not insurance:
        insurance = Insurance(patient_id=current_user.id)
        db.add(insurance)
    
    # Update fields
    for field, value in insurance_update.dict(exclude_unset=True).items():
        setattr(insurance, field, value)
    
    try:
        db.commit()
        db.refresh(insurance)
        logger.info(f"Insurance updated for patient: {current_user.email}")
        return insurance
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error updating insurance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update insurance information"
        )

@app.get("/api/patient/notifications", response_model=NotificationSettingsResponse)
async def get_notification_settings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current patient's notification settings."""
    if current_user.role != Role.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can access notification settings"
        )
    
    notification_settings = db.query(NotificationSettings).filter(NotificationSettings.patient_id == current_user.id).first()
    
    if not notification_settings:
        # Create default notification settings if none exists
        notification_settings = NotificationSettings(patient_id=current_user.id)
        db.add(notification_settings)
        db.commit()
        db.refresh(notification_settings)
    
    return notification_settings

@app.put("/api/patient/notifications", response_model=NotificationSettingsResponse)
async def update_notification_settings(
    notification_update: NotificationSettingsRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current patient's notification settings."""
    if current_user.role != Role.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can update notification settings"
        )
    
    notification_settings = db.query(NotificationSettings).filter(NotificationSettings.patient_id == current_user.id).first()
    
    if not notification_settings:
        notification_settings = NotificationSettings(patient_id=current_user.id)
        db.add(notification_settings)
    
    # Update fields
    for field, value in notification_update.dict(exclude_unset=True).items():
        setattr(notification_settings, field, value)
    
    try:
        db.commit()
        db.refresh(notification_settings)
        logger.info(f"Notification settings updated for patient: {current_user.email}")
        return notification_settings
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error updating notification settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification settings"
        )

@app.get("/api/patient/security", response_model=SecuritySettingsResponse)
async def get_security_settings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current patient's security settings."""
    if current_user.role != Role.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can access security settings"
        )
    
    security_settings = db.query(SecuritySettings).filter(SecuritySettings.patient_id == current_user.id).first()
    
    if not security_settings:
        # Create default security settings if none exists
        security_settings = SecuritySettings(patient_id=current_user.id)
        db.add(security_settings)
        db.commit()
        db.refresh(security_settings)
    
    return security_settings

@app.put("/api/patient/security", response_model=SecuritySettingsResponse)
async def update_security_settings(
    security_update: SecuritySettingsRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current patient's security settings."""
    if current_user.role != Role.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can update security settings"
        )
    
    security_settings = db.query(SecuritySettings).filter(SecuritySettings.patient_id == current_user.id).first()
    
    if not security_settings:
        security_settings = SecuritySettings(patient_id=current_user.id)
        db.add(security_settings)
    
    # Update fields
    for field, value in security_update.dict(exclude_unset=True).items():
        setattr(security_settings, field, value)
    
    try:
        db.commit()
        db.refresh(security_settings)
        logger.info(f"Security settings updated for patient: {current_user.email}")
        return security_settings
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error updating security settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update security settings"
        )

@app.get("/api/patient/activity-logs", response_model=List[ActivityLogResponse])
async def get_activity_logs(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current patient's activity logs."""
    if current_user.role != Role.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can access activity logs"
        )
    
    activity_logs = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id
    ).order_by(ActivityLog.timestamp.desc()).limit(50).all()
    
    return activity_logs

# ============================================================================
# Application Entry Point
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
