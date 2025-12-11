"""
Kiangombe Patient Center - FastAPI Application
Healthcare management system with appointments, prescriptions, and payments.
"""
import logging
import uuid
from datetime import datetime
from typing import Annotated, List, Optional
from pathlib import Path

from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv

import models
from database import engine, get_db
from models import (
    User, Appointment, Prescription, Doctor, Medication,
    Role, AppointmentStatus, VideoConsultation, StaffRole
)
from auth_router import (
    router as auth_router, 
    get_current_user, 
    get_current_active_user,
    bcrypt_context
)
from pgfunc import (
    dashboard_snapshot,
    get_appointments_for_user,
    get_all_doctors,
    get_doctor_by_id,
    get_doctors_by_specialization,
)
from pydantic_models import (
    AppointmentCreateRequest,
    AppointmentRescheduleRequest,
    DoctorCreateRequest,
    DoctorResponse,
    PaymentRequest,
    PaymentResponse,
    UserProfileResponse,
    CreateUserRequest,
    MessageResponse,
    PrescriptionCreateRequest,
    PrescriptionUpdateRequest,
    PrescriptionStatus,
    MedicationCreateRequest,
    MedicationUpdateRequest,
    MedicationResponse,
    StaffRoleCreate,
    StaffRoleUpdate,
    StaffRoleResponse,
    StaffCreateRequest,
    StaffResponse,
    VideoConsultationCreateRequest,
    VideoConsultationUpdateRequest,
    VideoTokenRequest,
    VideoTokenResponse,
    VideoConsultationResponse,
    ImageResponse,
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
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"], 
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


def require_admin(*allowed_roles: Role):
    """Dependency to check if user has required admin roles."""
    async def check_admin(user: User = Depends(get_current_active_user)) -> dict:
        user_role = user.role
        
        if allowed_roles and user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        return {
            "id": user.id,
            "username": user.full_name,
            "role": user.role.value
        }
    
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
async def upload_image(current_user: User = Depends(get_current_active_user), file: UploadFile = File(...)):
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
        img_url = f"http://localhost:8000/uploads/{unique_filename}"
        
        logger.info(f"Image uploaded: {unique_filename} by user {current_user.id}")
        return {"message": "Image uploaded successfully", "img_url": img_url}
    except Exception as e:
        logger.error(f"Error uploading image: {str(e)}")
        raise HTTPException(status_code=500, detail="Error uploading image")


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
    current_user: User = Depends(get_current_active_user)
) -> UserProfileResponse:
    """Get current user profile."""
    # Convert relative profile_picture URL to full URL if needed
    profile_picture = current_user.profile_picture
    if profile_picture and not profile_picture.startswith('http'):
        profile_picture = f"http://localhost:8000{profile_picture}"
    
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
        emergencyContact=None,  
        bloodType=None,  
        allergies=None  
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
    
    try:
        db.commit()
        db.refresh(current_user)
        logger.info(f"User profile updated: {current_user.id}")
        
        # Convert relative profile_picture URL to full URL if needed
        profile_picture = current_user.profile_picture
        if profile_picture and not profile_picture.startswith('http'):
            profile_picture = f"http://localhost:8000{profile_picture}"
        
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
            emergencyContact=current_user.emergencyContact,  
            bloodType=current_user.bloodType,  
            allergies=current_user.allergies  
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
    new_scheduled_at: datetime,
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

    # Check permissions
    if current_user.role == Role.PATIENT and appt.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to reschedule this appointment"
        )
    elif current_user.role == Role.CLINICIAN_ADMIN and appt.clinician_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to reschedule this appointment"
        )

    appt.scheduled_at = new_scheduled_at
    
    try:
        db.commit()
        db.refresh(appt)
        logger.info(f"Appointment rescheduled: ID {appt.id}")
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

@app.post(
    "/prescriptions",
    response_model=UserProfileResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin(Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN))],
)
def create_prescription(
    payload: PrescriptionCreateRequest,
    db: Session = Depends(get_db)
) -> Prescription:
    """Create prescription for appointment (admin/clinician only)."""
    appointment = db.query(Appointment).filter(
        Appointment.id == payload.appointment_id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Appointment not found."
        )

    # Check if prescription already exists
    if appointment.prescription:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prescription already exists for this appointment."
        )

    prescription = Prescription(
        appointment_id=payload.appointment_id,
        pharmacy_name=payload.pharmacy_name,
        medications_json=payload.medications_json,
        status=payload.status or PrescriptionStatus.PENDING,
        qr_code_path=payload.qr_code_path,
    )

    try:
        db.add(prescription)
        db.commit()
        db.refresh(prescription)
        logger.info(f"Prescription created: ID {prescription.id}")
        return prescription
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error creating prescription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create prescription."
        )


@app.get("/prescriptions", response_model=List[UserProfileResponse])
def list_prescriptions(
    status_filter: Optional[PrescriptionStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[Prescription]:
    """List prescriptions (filtered by user role)."""
    query = db.query(Prescription).join(Appointment)

    if current_user.role == Role.PATIENT:
        query = query.filter(Appointment.patient_id == current_user.id)
    elif current_user.role == Role.CLINICIAN_ADMIN:
        query = query.filter(Appointment.clinician_id == current_user.id)

    if status_filter:
        query = query.filter(Prescription.status == status_filter)

    return query.all()


@app.get("/prescriptions/{prescription_id}", response_model=UserProfileResponse)
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
    if current_user.role == Role.PATIENT and appointment.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this prescription"
        )
    elif current_user.role == Role.CLINICIAN_ADMIN and appointment.clinician_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this prescription"
        )

    return prescription


@app.patch("/prescriptions/{prescription_id}", response_model=UserProfileResponse)
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
    if specialization:
        doctors = get_doctors_by_specialization(db, specialization, is_available)
    else:
        doctors = get_all_doctors(db, is_available)

    # Enrich doctor data with user information
    result = []
    for doctor in doctors:
        user = doctor.user
        result.append({
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
        })
    
    return result


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
# Payment Routes
# ============================================================================

@app.post("/payments", response_model=PaymentResponse)
def process_payment(
    payload: PaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> PaymentResponse:
    """Process payment for an appointment (STUB - integrate with payment gateway)."""
    # Verify appointment exists and belongs to current user
    appointment = db.query(Appointment).filter(
        Appointment.id == payload.appointment_id,
        Appointment.patient_id == current_user.id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found or unauthorized."
        )

    # TODO: Integrate with Stripe, M-Pesa, or other payment provider
    # For now, return a stub response
    transaction_id = str(uuid.uuid4())
    
    logger.info(f"Payment initiated: Transaction {transaction_id}, Amount {payload.amount}")
    
    return PaymentResponse(
        transaction_id=transaction_id,
        status="pending",
        amount=payload.amount,
        message="Payment processing initiated. Please check email for confirmation."
    )


@app.get("/payments/history")
def get_payment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """Get user's payment history (STUB)."""
    # TODO: Implement once Payment model is created
    return {
        "user_id": current_user.id,
        "payments": [],
        "message": "Payment history feature coming soon"
    }

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
    return dashboard_snapshot(db)


# ============================================================================
# Video Consultation Routes
# ============================================================================

@app.post("/video-consultations", response_model=dict)
def initialize_video_consultation(
    payload: VideoConsultationCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """Initialize a video consultation session."""
    # Verify appointment exists
    appointment = db.query(Appointment).filter(
        Appointment.id == payload.appointment_id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Check authorization
    if current_user.role == Role.PATIENT and appointment.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this appointment"
        )
    elif current_user.role == Role.CLINICIAN_ADMIN and appointment.clinician_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this appointment"
        )
    
    # Check if session already exists
    existing = db.query(VideoConsultation).filter(
        VideoConsultation.appointment_id == payload.appointment_id
    ).first()
    
    if existing:
        return {
            "id": existing.id,
            "appointmentId": existing.appointment_id,
            "roomId": existing.room_id,
            "doctorId": existing.doctor_id,
            "patientId": existing.patient_id,
            "status": existing.status,
            "startTime": existing.start_time.isoformat() if existing.start_time else None,
            "endTime": existing.end_time.isoformat() if existing.end_time else None,
            "recordingUrl": existing.recording_url,
            "notes": existing.notes,
        }
    
    # Create new session
    room_id = f"room-{payload.appointment_id}-{uuid.uuid4().hex[:8]}"
    
    session = VideoConsultation(
        appointment_id=payload.appointment_id,
        room_id=room_id,
        doctor_id=appointment.clinician_id,
        patient_id=appointment.patient_id,
        status='waiting'
    )
    
    try:
        db.add(session)
        db.commit()
        db.refresh(session)
        logger.info(f"Video consultation session created: ID {session.id}, Room {room_id}")
        
        return {
            "id": session.id,
            "appointmentId": session.appointment_id,
            "roomId": session.room_id,
            "doctorId": session.doctor_id,
            "patientId": session.patient_id,
            "status": session.status,
            "startTime": session.start_time.isoformat() if session.start_time else None,
            "endTime": session.end_time.isoformat() if session.end_time else None,
            "recordingUrl": session.recording_url,
            "notes": session.notes,
        }
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error creating video consultation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize video consultation"
        )


@app.get("/video-consultations/{session_id}")
def get_video_consultation(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """Get video consultation session details."""
    session = db.query(VideoConsultation).filter(
        VideoConsultation.id == session_id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video consultation session not found"
        )
    
    # Check authorization
    if current_user.id not in [session.doctor_id, session.patient_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )
    
    return {
        "id": session.id,
        "appointmentId": session.appointment_id,
        "roomId": session.room_id,
        "doctorId": session.doctor_id,
        "patientId": session.patient_id,
        "status": session.status,
        "startTime": session.start_time.isoformat() if session.start_time else None,
        "endTime": session.end_time.isoformat() if session.end_time else None,
        "recordingUrl": session.recording_url,
        "notes": session.notes,
    }


@app.get("/video-consultations/{session_id}/token")
def get_video_token(
    session_id: int,
    uid: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """Get Agora token for video consultation."""
    session = db.query(VideoConsultation).filter(
        VideoConsultation.id == session_id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video consultation session not found"
        )
    
    # Check authorization
    if current_user.id not in [session.doctor_id, session.patient_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )
    
    # TODO: Integrate with Agora SDK to generate real token
    # For now, return a mock token
    mock_token = f"mock_token_{session_id}_{uid}_{uuid.uuid4().hex[:16]}"
    
    return {
        "token": mock_token,
        "uid": uid,
        "appId": "mock_agora_app_id",
        "channelName": session.room_id,
    }


@app.patch("/video-consultations/{session_id}")
def update_video_consultation(
    session_id: int,
    payload: VideoConsultationUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """Update video consultation session."""
    session = db.query(VideoConsultation).filter(
        VideoConsultation.id == session_id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video consultation session not found"
        )
    
    # Check authorization
    if current_user.id not in [session.doctor_id, session.patient_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )
    
    try:
        if payload.status:
            session.status = payload.status
            if payload.status == 'active' and not session.start_time:
                session.start_time = datetime.now()
            elif payload.status == 'ended' and not session.end_time:
                session.end_time = datetime.now()
        
        if payload.notes:
            session.notes = payload.notes
        
        db.commit()
        db.refresh(session)
        logger.info(f"Video consultation updated: ID {session.id}, Status {session.status}")
        
        return {
            "id": session.id,
            "appointmentId": session.appointment_id,
            "roomId": session.room_id,
            "doctorId": session.doctor_id,
            "patientId": session.patient_id,
            "status": session.status,
            "startTime": session.start_time.isoformat() if session.start_time else None,
            "endTime": session.end_time.isoformat() if session.end_time else None,
            "recordingUrl": session.recording_url,
            "notes": session.notes,
        }
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error updating video consultation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update video consultation"
        )

# Staff Role Management Routes
# ============================================================================

@app.get("/staff-roles", response_model=List[StaffRoleResponse])
def list_staff_roles(
    status_filter: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin(Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN))
) -> List[models.StaffRole]:
    """List all staff roles (super admin and clinical admin)."""
    query = db.query(models.StaffRole)
    
    if status_filter is not None:
        query = query.filter(models.StaffRole.is_active == status_filter)
    
    roles = query.order_by(models.StaffRole.name).all()
    return roles


@app.post("/staff-roles", response_model=StaffRoleResponse, status_code=status.HTTP_201_CREATED)
def create_staff_role(
    payload: StaffRoleCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin(Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN))
) -> models.StaffRole:
    """Create a new staff role (super admin only)."""
    # Check if role name already exists
    existing_role = db.query(models.StaffRole).filter(models.StaffRole.name == payload.name).first()
    if existing_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role name already exists"
        )
    
    # Generate role ID
    role_id = f"role_{uuid.uuid4().hex[:8]}"
    
    new_role = models.StaffRole(
        id=role_id,
        name=payload.name,
        description=payload.description,
        permissions=payload.permissions,
        is_active=payload.is_active,
        requires_specialization=payload.requires_specialization,
        requires_license=payload.requires_license,
        default_consultation_fee=payload.default_consultation_fee
    )
    
    try:
        db.add(new_role)
        db.commit()
        db.refresh(new_role)
        logger.info(f"Staff role created: {new_role.name}")
        return new_role
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error creating staff role: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create staff role"
        )


@app.get("/staff-roles/{role_id}", response_model=StaffRoleResponse)
def get_staff_role(
    role_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin(Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN))
) -> models.StaffRole:
    """Get a specific staff role (super admin and clinical admin)."""
    role = db.query(models.StaffRole).filter(models.StaffRole.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff role not found"
        )
    return role


@app.put("/staff-roles/{role_id}", response_model=StaffRoleResponse)
def update_staff_role(
    role_id: str,
    payload: StaffRoleUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin(Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN))
) -> models.StaffRole:
    """Update a staff role (super admin and clinical admin)."""
    role = db.query(models.StaffRole).filter(models.StaffRole.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff role not found"
        )
    
    # Check if new name conflicts with existing role
    if payload.name and payload.name != role.name:
        existing_role = db.query(models.StaffRole).filter(
            models.StaffRole.name == payload.name,
            models.StaffRole.id != role_id
        ).first()
        if existing_role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role name already exists"
            )
    
    # Update role fields
    update_data = payload.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(role, field, value)
    
    try:
        db.commit()
        db.refresh(role)
        logger.info(f"Staff role updated: {role.name}")
        return role
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error updating staff role: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update staff role"
        )


@app.delete("/staff-roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_staff_role(
    role_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin(Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN))
):
    """Delete a staff role (super admin and clinical admin)."""
    role = db.query(models.StaffRole).filter(models.StaffRole.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff role not found"
        )
    
    # Check if role is in use
    users_with_role = db.query(User).filter(User.staff_role_id == role_id).count()
    if users_with_role > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete role: {users_with_role} users are assigned to this role"
        )
    
    try:
        db.delete(role)
        db.commit()
        logger.info(f"Staff role deleted: {role.name}")
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Error deleting staff role: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete staff role"
        )


# ============================================================================
# Staff Creation (Updated)
# ============================================================================

@app.post("/staff", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
def create_staff_member(
    payload: StaffCreateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin(Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN))
) -> User:
    """Create a new staff member with role-based validation."""
    # Find the staff role
    staff_role = db.query(models.StaffRole).filter(
        models.StaffRole.name == payload.account.role,
        models.StaffRole.is_active == True
    ).first()
    
    if not staff_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Staff role '{payload.account.role}' not found or inactive"
        )
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == payload.account.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
    
    # Validate role requirements
    if staff_role.requires_specialization and not payload.profile.specialization:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Specialization is required for this role"
        )
    
    if staff_role.requires_license and not payload.profile.license_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="License number is required for this role"
        )
    
    # Map role name to enum
    role_mapping = {
        "doctor": Role.DOCTOR,
        "nurse": Role.NURSE,
        "receptionist": Role.RECEPTIONIST,
        "lab_technician": Role.LAB_TECHNICIAN,
        "pharmacist": Role.PHARMACIST,
    }
    
    user_role = role_mapping.get(payload.account.role.lower())
    if not user_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role: {payload.account.role}"
        )
    
    # Create user
    new_user = User(
        full_name=payload.account.full_name,
        email=payload.account.email,
        password_hash=bcrypt_context.hash(payload.account.password),
        phone=payload.account.phone,
        gender=payload.account.gender,
        date_of_birth=payload.account.date_of_birth,
        role=user_role,
        staff_role_id=staff_role.id,
        profile_picture=payload.account.profile_image
    )
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Create role-specific profile
        if user_role == Role.DOCTOR:
            doctor_profile = Doctor(
                user_id=new_user.id,
                specialization=payload.profile.specialization,
                bio=payload.profile.bio,
                license_number=payload.profile.license_number,
                consultation_fee=payload.profile.consultation_fee or staff_role.default_consultation_fee,
                is_available=payload.profile.is_available
            )
            db.add(doctor_profile)
        elif user_role == Role.NURSE:
            nurse_profile = Nurse(
                user_id=new_user.id,
                specialization=payload.profile.specialization,
                bio=payload.profile.bio,
                license_number=payload.profile.license_number,
                is_available=payload.profile.is_available
            )
            db.add(nurse_profile)
        elif user_role == Role.RECEPTIONIST:
            receptionist_profile = Receptionist(
                user_id=new_user.id,
                bio=payload.profile.bio,
                is_available=payload.profile.is_available
            )
            db.add(receptionist_profile)
        elif user_role == Role.LAB_TECHNICIAN:
            lab_profile = LabTechnician(
                user_id=new_user.id,
                specialization=payload.profile.specialization,
                bio=payload.profile.bio,
                license_number=payload.profile.license_number,
                is_available=payload.profile.is_available
            )
            db.add(lab_profile)
        elif user_role == Role.PHARMACIST:
            pharmacist_profile = Pharmacist(
                user_id=new_user.id,
                specialization=payload.profile.specialization,
                bio=payload.profile.bio,
                license_number=payload.profile.license_number,
                is_available=payload.profile.is_available
            )
            db.add(pharmacist_profile)
        
        db.commit()
        logger.info(f"Staff member created: {new_user.email} with role {payload.account.role}")
        
        # Return staff response
        return StaffResponse(
            id=new_user.id,
            full_name=new_user.full_name,
            email=new_user.email,
            phone=new_user.phone,
            role=payload.account.role,
            staff_role=StaffRoleResponse.model_validate(staff_role),
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

@app.get("/api/patient/profile", response_model=UserProfileResponse)
async def get_patient_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current patient's profile information."""
    if current_user.role != Role.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can access patient profile"
        )
    
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        role=current_user.role.value,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        profile_picture=current_user.profile_picture
    )

@app.put("/api/patient/profile", response_model=UserProfileResponse)
async def update_patient_profile(
    profile_update: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current patient's profile information."""
    if current_user.role != Role.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can update patient profile"
        )
    
    # Update allowed fields
    allowed_fields = ['full_name', 'phone', 'profile_picture']
    for field, value in profile_update.items():
        if field in allowed_fields and hasattr(current_user, field):
            setattr(current_user, field, value)
    
    try:
        db.commit()
        db.refresh(current_user)
        logger.info(f"Patient profile updated: {current_user.email}")
        
        return UserProfileResponse(
            id=current_user.id,
            email=current_user.email,
            full_name=current_user.full_name,
            phone=current_user.phone,
            role=current_user.role.value,
            is_verified=current_user.is_verified,
            created_at=current_user.created_at,
            profile_picture=current_user.profile_picture
        )
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error updating patient profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

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
