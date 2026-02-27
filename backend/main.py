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

from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_, and_
from dotenv import load_dotenv

import models
from database import engine, get_db
from models import (
    User, Appointment, Prescription, Doctor, Medication,
    Role, AppointmentStatus, VideoConsultation, StaffRole,
    MedicalInfo, EmergencyContact, Insurance, NotificationSettings,
    SecuritySettings, ActivityLog, ChatMessage, ChatRoom
)
from auth_router import (
    router as auth_router, 
    get_current_user, 
    get_current_active_user,
    bcrypt_context
)
from doctor_profile_router import router as doctor_profile_router
from mental_health_router import router as mental_health_router
from patient_router import router as patient_router
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
    StaffRoleCreate,
    StaffRoleUpdate,
    StaffRoleResponse,
    StaffCreateRequest,
    StaffResponse,
    DoctorCreateRequest,
    DoctorResponse,
    PaymentRequest,
    PaymentResponse,
    VideoConsultationCreateRequest,
    VideoConsultationUpdateRequest,
    VideoTokenRequest,
    VideoTokenResponse,
    VideoConsultationResponse,
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
    # Chat Models
    ChatMessageRequest,
    ChatMessageResponse,
    ChatRoomRequest,
    ChatRoomResponse,
    ChatRoomWithMessages,
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
    allow_origins=["http://localhost:3000"], 
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
app.include_router(mental_health_router)
app.include_router(patient_router)


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
        
        logger.info(f"Image uploaded: {unique_filename} by user {current_user.id}")
        return {"message": "Image uploaded successfully", "img_url": img_url.strip()}
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
        allergies=', '.join(medical_info.allergies) if medical_info and medical_info.allergies else None
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
            allergies=medical_info.allergies if medical_info else None
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
        # Return only users with PATIENT role, joined with their medical info
        patients = db.query(User).outerjoin(MedicalInfo).filter(User.role == Role.PATIENT).order_by(User.created_at.desc()).all()
        logger.info(f"Retrieved {len(patients)} patients for user {current_user.id}")
        
        # Debug: Log first patient data to see structure
        if patients:
            first_patient = patients[0]
            logger.info(f"First patient data: {first_patient.__dict__}")
            if hasattr(first_patient, 'medical_info') and first_patient.medical_info:
                logger.info(f"Medical info for first patient: {first_patient.medical_info.__dict__}")
            else:
                logger.info("No medical info found for first patient")
        
        return patients
        
    except SQLAlchemyError as e:
        logger.error(f"Error fetching patients: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch patients."
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
        if specialization:
            doctors = get_doctors_by_specialization(db, specialization, is_available)
        else:
            doctors = get_all_doctors(db, is_available)

        logger.info(f"Found {len(doctors)} doctors")

        # Enrich doctor data with user information
        result = []
        for doctor in doctors:
            try:
                user = doctor.user
                if not user:
                    logger.warning(f"Doctor {doctor.id} has no associated user record")
                    continue
                    
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
                    "video_consultation_fee": float(doctor.video_consultation_fee) if doctor.video_consultation_fee else None,
                    "phone_consultation_fee": float(doctor.phone_consultation_fee) if doctor.phone_consultation_fee else None,
                    "chat_consultation_fee": float(doctor.chat_consultation_fee) if doctor.chat_consultation_fee else None,
                    "patientsCount": 0,  # TODO: Calculate from appointments
                    "avatar": user.profile_picture,
                })
            except Exception as e:
                logger.error(f"Error processing doctor {doctor.id}: {str(e)}")
                continue
        
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
    
    # Get medical info for blood type and allergies
    medical_info = db.query(MedicalInfo).filter(MedicalInfo.patient_id == current_user.id).first()
    
    # Create medical info record if it doesn't exist
    if not medical_info:
        medical_info = MedicalInfo(
            patient_id=current_user.id,
            blood_type=None,
            height=None,
            weight=None,
            allergies=[],
            conditions=[],
            medications=[]
        )
        db.add(medical_info)
        db.commit()
        db.refresh(medical_info)
        logger.info(f"Created new medical info record for patient {current_user.id}")
    
    logger.info(f"Fetched medical info for patient {current_user.id}: {medical_info}")
    
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        date_of_birth=current_user.date_of_birth,
        gender=current_user.gender,
        role=current_user.role.value,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        profile_picture=current_user.profile_picture,
        address=current_user.address,
        bloodType=medical_info.blood_type if medical_info else None,
        allergies=', '.join(medical_info.allergies) if medical_info and medical_info.allergies else None
    )
    logger.info(f"Profile response for patient {current_user.id}: bloodType={medical_info.blood_type if medical_info else None}, allergies={', '.join(medical_info.allergies) if medical_info and medical_info.allergies else None}")

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
    allowed_fields = ['full_name', 'phone', 'profile_picture', 'gender', 'date_of_birth', 'address']
    for field, value in profile_update.items():
        if field in allowed_fields and hasattr(current_user, field):
            setattr(current_user, field, value)
    
    try:
        db.commit()
        db.refresh(current_user)
        logger.info(f"Patient profile updated: {current_user.email}")
        
        # Get updated medical info for response
        medical_info = db.query(MedicalInfo).filter(MedicalInfo.patient_id == current_user.id).first()
        
        return UserProfileResponse(
            id=current_user.id,
            email=current_user.email,
            full_name=current_user.full_name,
            phone=current_user.phone,
            date_of_birth=current_user.date_of_birth,
            gender=current_user.gender,
            role=current_user.role.value,
            is_verified=current_user.is_verified,
            created_at=current_user.created_at,
            profile_picture=current_user.profile_picture,
            address=current_user.address,
            bloodType=medical_info.blood_type if medical_info else None,
            allergies=', '.join(medical_info.allergies) if medical_info and medical_info.allergies else None
        )
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error updating patient profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
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
# Chat Endpoints
# ============================================================================

@app.post("/api/chat/rooms", response_model=ChatRoomResponse)
async def create_chat_room(
    room_request: ChatRoomRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new chat room between patient and doctor."""
    # Verify the doctor exists and is actually a doctor
    doctor = db.query(User).filter(
        User.id == room_request.doctor_id,
        User.role == Role.DOCTOR
    ).first()
    
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    # Check if chat room already exists
    existing_room = db.query(ChatRoom).filter(
        ChatRoom.patient_id == current_user.id,
        ChatRoom.doctor_id == room_request.doctor_id,
        ChatRoom.appointment_id == room_request.appointment_id,
        ChatRoom.is_active == True
    ).first()
    
    if existing_room:
        return existing_room
    
    # Create new chat room
    chat_room = ChatRoom(
        patient_id=current_user.id,
        doctor_id=room_request.doctor_id,
        appointment_id=room_request.appointment_id
    )
    
    try:
        db.add(chat_room)
        db.commit()
        db.refresh(chat_room)
        logger.info(f"Chat room created between patient {current_user.id} and doctor {room_request.doctor_id}")
        return chat_room
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error creating chat room: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create chat room"
        )

@app.get("/api/chat/rooms", response_model=List[ChatRoomResponse])
async def get_chat_rooms(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all chat rooms for the current user."""
    if current_user.role == Role.PATIENT:
        rooms = db.query(ChatRoom).filter(
            ChatRoom.patient_id == current_user.id,
            ChatRoom.is_active == True
        ).order_by(ChatRoom.last_message_at.desc()).all()
    else:
        rooms = db.query(ChatRoom).filter(
            ChatRoom.doctor_id == current_user.id,
            ChatRoom.is_active == True
        ).order_by(ChatRoom.last_message_at.desc()).all()
    
    return rooms

@app.get("/api/chat/rooms/{room_id}", response_model=ChatRoomWithMessages)
async def get_chat_room_with_messages(
    room_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get chat room details with all messages."""
    # Verify user has access to this chat room
    room = db.query(ChatRoom).filter(ChatRoom.id == room_id).first()
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat room not found"
        )
    
    if current_user.role == Role.PATIENT and room.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this chat room"
        )
    
    if current_user.role == Role.DOCTOR and room.doctor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this chat room"
        )
    
    # Get all messages for this room
    messages = db.query(ChatMessage).filter(
        ChatMessage.appointment_id == room.appointment_id
    ).order_by(ChatMessage.created_at.asc()).all()
    
    room_response = ChatRoomWithMessages(
        **room.__dict__,
        messages=messages
    )
    
    return room_response

@app.post("/api/chat/messages", response_model=ChatMessageResponse)
async def send_message(
    message_request: ChatMessageRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send a message to another user."""
    # Verify recipient exists
    recipient = db.query(User).filter(User.id == message_request.recipient_id).first()
    
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found"
        )
    
    # Verify appointment exists if provided
    if message_request.appointment_id:
        appointment = db.query(Appointment).filter(
            Appointment.id == message_request.appointment_id
        ).first()
        
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )
    
    # Create message
    message = ChatMessage(
        sender_id=current_user.id,
        recipient_id=message_request.recipient_id,
        appointment_id=message_request.appointment_id,
        message=message_request.message,
        message_type=message_request.message_type
    )
    
    try:
        db.add(message)
        db.commit()
        db.refresh(message)
        
        # Update chat room's last_message_at if applicable
        if message_request.appointment_id:
            chat_room = db.query(ChatRoom).filter(
                ChatRoom.appointment_id == message_request.appointment_id
            ).first()
            
            if chat_room:
                chat_room.last_message_at = message.created_at
                db.commit()
        
        logger.info(f"Message sent from {current_user.id} to {message_request.recipient_id}")
        return message
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error sending message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send message"
        )

@app.get("/api/chat/messages/{recipient_id}", response_model=List[ChatMessageResponse])
async def get_messages_with_user(
    recipient_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all messages between current user and specified recipient."""
    # Verify recipient exists
    recipient = db.query(User).filter(User.id == recipient_id).first()
    
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found"
        )
    
    # Get messages between the two users
    messages = db.query(ChatMessage).filter(
        or_(
            and_(ChatMessage.sender_id == current_user.id, ChatMessage.recipient_id == recipient_id),
            and_(ChatMessage.sender_id == recipient_id, ChatMessage.recipient_id == current_user.id)
        )
    ).order_by(ChatMessage.created_at.asc()).all()
    
    # Mark messages as read if they were sent to current user
    unread_messages = [msg for msg in messages if msg.recipient_id == current_user.id and not msg.is_read]
    for msg in unread_messages:
        msg.is_read = True
    
    if unread_messages:
        db.commit()
    
    return messages

@app.put("/api/chat/messages/{message_id}/read")
async def mark_message_as_read(
    message_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark a message as read."""
    message = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Only recipient can mark message as read
    if message.recipient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only message recipient can mark as read"
        )
    
    message.is_read = True
    
    try:
        db.commit()
        return {"message": "Message marked as read"}
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error marking message as read: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark message as read"
        )

# ============================================================================
# Application Entry Point
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
