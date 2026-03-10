"""
Doctor Profile API endpoints
Handles CRUD operations for doctor profile sections including:
- Availability Schedule
- Settings & Preferences
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from models import (
    StaffProfile, StaffAvailability, StaffSettings, User
)
from pydantic_models import (
    # Temporarily use old models until we create new staff availability models
    DoctorAvailabilityRequest, DoctorAvailabilityResponse,
    DoctorSettingsRequest, DoctorSettingsResponse
)
from auth_router import get_current_active_user

router = APIRouter(prefix="/api/doctor/profile", tags=["doctor-profile"])

# Helper function to get staff profile for current user
def get_staff_profile(current_user: User, db: Session) -> StaffProfile:
    """Get staff profile for current user."""
    staff = db.query(StaffProfile).filter(StaffProfile.user_id == current_user.id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff profile not found. Please create your profile first."
        )
    return staff

# Helper function to create doctor profile for current user
def create_doctor_profile_for_user(current_user: User, db: Session) -> StaffProfile:
    """Create doctor profile for current user if it doesn't exist."""
    # Check if user is actually a doctor
    if current_user.role.value != 'DOCTOR':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can create doctor profiles."
        )
    
    # Check if profile already exists
    existing_staff = db.query(StaffProfile).filter(StaffProfile.user_id == current_user.id).first()
    if existing_staff:
        return existing_staff
    
    # Create new staff profile
    staff = StaffProfile(
        user_id=current_user.id,
        role=StaffRole.DOCTOR,
        specialization="General Practice",  # Default specialization
        bio="Doctor profile",  # Default bio
        rating=0.0,
        is_available=True,
        consultation_fee=50.0  # Default consultation fee
    )
    
    db.add(staff)
    db.commit()
    db.refresh(staff)
    
    return staff

# ============================================================================
# AVAILABILITY SCHEDULE
# ============================================================================

@router.get("/availability", response_model=List[DoctorAvailabilityResponse])
async def get_availability(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get doctor's weekly availability."""
    staff = get_staff_profile(current_user, db)
    
    availability = db.query(StaffAvailability).filter(
        StaffAvailability.staff_id == staff.id
    ).order_by(StaffAvailability.day).all()
    
    # Create default availability if none exists
    if not availability:
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        for day in days:
            avail = StaffAvailability(
                staff_id=staff.id,
                day=day,
                is_open=(day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
                start_time='09:00',
                end_time='17:00' if day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] else None,
                break_start='12:00' if day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] else None,
                break_end='13:00' if day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] else None
            )
            db.add(avail)
        db.commit()
        db.refresh(avail)
        availability = db.query(StaffAvailability).filter(
            StaffAvailability.staff_id == staff.id
        ).order_by(StaffAvailability.day).all()
    
    return availability

@router.put("/availability/{availability_id}", response_model=DoctorAvailabilityResponse)
async def update_availability(
    availability_id: int,
    availability_data: DoctorAvailabilityRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update doctor's availability for a specific day."""
    staff = get_staff_profile(current_user, db)
    
    availability = db.query(StaffAvailability).filter(
        StaffAvailability.id == availability_id,
        StaffAvailability.staff_id == staff.id
    ).first()
    
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability record not found"
        )
    
    for field, value in availability_data.dict().items():
        setattr(availability, field, value)
    
    db.commit()
    db.refresh(availability)
    
    # Log activity
    from activity_logger import create_activity_log
    create_activity_log(
        user_id=current_user.id,
        action="Updated Availability Schedule",
        device="Web Application",
        db=db
    )
    
    return availability

@router.put("/availability/bulk", response_model=List[DoctorAvailabilityResponse])
async def update_bulk_availability(
    availability_list: List[DoctorAvailabilityRequest],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update doctor's availability for multiple days."""
    staff = get_staff_profile(current_user, db)
    
    updated_availability = []
    
    for avail_data in availability_list:
        availability = db.query(StaffAvailability).filter(
            StaffAvailability.staff_id == staff.id,
            StaffAvailability.day == avail_data.day
        ).first()
        
        if not availability:
            availability = StaffAvailability(staff_id=staff.id, day=avail_data.day)
            db.add(availability)
        
        for field, value in avail_data.dict().items():
            setattr(availability, field, value)
        
        db.commit()
        db.refresh(availability)
        updated_availability.append(availability)
    
    # Log activity
    from activity_logger import create_activity_log
    create_activity_log(
        user_id=current_user.id,
        action="Updated Availability Schedule (Bulk)",
        device="Web Application",
        db=db
    )
    
    return updated_availability

# ============================================================================
# SETTINGS & PREFERENCES
# ============================================================================

@router.get("/settings", response_model=DoctorSettingsResponse)
async def get_settings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get doctor's settings and preferences."""
    staff = get_staff_profile(current_user, db)
    
    settings = db.query(StaffSettings).filter(
        StaffSettings.staff_id == staff.id
    ).first()
    
    if not settings:
        # Create default settings
        settings = StaffSettings(staff_id=staff.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings

@router.put("/settings", response_model=DoctorSettingsResponse)
async def update_settings(
    settings_data: DoctorSettingsRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update doctor's settings and preferences."""
    staff = get_staff_profile(current_user, db)
    
    settings = db.query(StaffSettings).filter(
        StaffSettings.staff_id == staff.id
    ).first()
    
    if not settings:
        settings = StaffSettings(staff_id=staff.id)
        db.add(settings)
    
    for field, value in settings_data.dict().items():
        setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    
    # Log activity
    from activity_logger import create_activity_log
    create_activity_log(
        user_id=current_user.id,
        action="Updated Profile Settings",
        device="Web Application",
        db=db
    )
    
    return settings

# ============================================================================
# PROFILE MANAGEMENT
# ============================================================================

@router.post("/create", response_model=dict)
async def create_doctor_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create doctor profile for current user."""
    try:
        # Check if user is actually a doctor
        if current_user.role.value != 'DOCTOR':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only doctors can create doctor profiles."
            )
        
        # Create doctor profile
        doctor = create_doctor_profile_for_user(current_user, db)
        
        return {
            "message": "Doctor profile created successfully",
            "doctor_id": doctor.id,
            "specialization": doctor.specialization
        }
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create doctor profile: {str(e)}"
        )

# ============================================================================
# COMPLETE PROFILE
# ============================================================================

@router.get("/complete", response_model=dict)
async def get_complete_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get complete doctor profile with all sections."""
    # Get staff profile - create if doesn't exist
    staff = db.query(StaffProfile).filter(StaffProfile.user_id == current_user.id).first()
    
    if not staff:
        # Auto-create staff profile for doctors who don't have one
        if current_user.role.value == 'DOCTOR':
            staff = create_doctor_profile_for_user(current_user, db)
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Staff profile not found. Please create your profile first."
            )
    
    return build_complete_profile_response(staff, db)

@router.get("/complete/{doctor_id}", response_model=dict)
async def get_doctor_profile_by_id(
    doctor_id: int,
    db: Session = Depends(get_db)
):
    """Get complete doctor profile by doctor ID (for public viewing)."""
    staff = db.query(StaffProfile).filter(StaffProfile.id == doctor_id).first()
    
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found"
        )
    
    return build_complete_profile_response(staff, db)

def build_complete_profile_response(staff: StaffProfile, db: Session) -> dict:
    """Build complete profile response for a staff member."""
    
    # Get all sections
    education = db.query(DoctorEducation).filter(
        DoctorEducation.doctor_id == staff.id
    ).order_by(DoctorEducation.year.desc()).all()
    
    contact_info = db.query(DoctorContactInfo).filter(
        DoctorContactInfo.doctor_id == staff.id
    ).first()
    
    if not contact_info:
        contact_info = DoctorContactInfo(doctor_id=staff.id)
        db.add(contact_info)
        db.commit()
        db.refresh(contact_info)
    
    availability = db.query(StaffAvailability).filter(
        StaffAvailability.staff_id == staff.id
    ).order_by(StaffAvailability.day).all()
    
    if not availability:
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        for day in days:
            avail = StaffAvailability(
                staff_id=staff.id,
                day=day,
                is_open=(day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
                start_time='09:00',
                end_time='17:00' if day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] else None,
                break_start='12:00' if day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] else None,
                break_end='13:00' if day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] else None
            )
            db.add(avail)
        db.commit()
        availability = db.query(StaffAvailability).filter(
            StaffAvailability.staff_id == staff.id
        ).order_by(StaffAvailability.day).all()
    
    settings = db.query(StaffSettings).filter(
        StaffSettings.staff_id == staff.id
    ).first()
    
    if not settings:
        settings = StaffSettings(staff_id=staff.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return {
        "staff": {
            "id": staff.id,
            "user_id": staff.user_id,
            "specialization": staff.specialization,
            "bio": staff.bio,
            "rating": float(staff.rating) if staff.rating else 0.0,
            "is_available": staff.is_available,
            "consultation_fee": float(staff.consultation_fee) if staff.consultation_fee else None,
            "license_number": staff.license_number
        },
        "education": [{
            "id": edu.id,
            "doctor_id": edu.doctor_id,
            "title": edu.title,
            "institution": edu.institution,
            "year": edu.year,
            "type": edu.type,
            "created_at": edu.created_at.isoformat() if edu.created_at else None
        } for edu in education],
        "contact_info": {
            "id": contact_info.id,
            "doctor_id": contact_info.doctor_id,
            "hospital": contact_info.hospital,
            "department": contact_info.department,
            "location": contact_info.location,
            "consultation_fee": float(contact_info.consultation_fee) if contact_info.consultation_fee else None,
            "languages": contact_info.languages or [],
            "created_at": contact_info.created_at.isoformat() if contact_info.created_at else None
        },
        "availability": [{
            "id": avail.id,
            "doctor_id": avail.doctor_id,
            "day": avail.day,
            "is_open": avail.is_open,
            "start_time": avail.start_time,
            "end_time": avail.end_time,
            "break_start": avail.break_start,
            "break_end": avail.break_end,
            "appointment_duration": avail.appointment_duration,
            "buffer_time": avail.buffer_time,
            "max_appointments_per_day": avail.max_appointments_per_day,
            "created_at": avail.created_at.isoformat() if avail.created_at else None
        } for avail in availability],
        "settings": {
            "id": settings.id,
            "doctor_id": settings.doctor_id,
            "show_profile_to_patients": settings.show_profile_to_patients,
            "show_rating_reviews": settings.show_rating_reviews,
            "allow_online_booking": settings.allow_online_booking,
            "show_availability": settings.show_availability,
            "email_notifications": settings.email_notifications,
            "sms_notifications": settings.sms_notifications,
            "appointment_reminders": settings.appointment_reminders,
            "new_appointment_requests": settings.new_appointment_requests,
            "cancellation_alerts": settings.cancellation_alerts,
            "patient_messages": settings.patient_messages,
            "weekly_summary": settings.weekly_summary,
            "created_at": settings.created_at.isoformat() if settings.created_at else None
        }
    }
