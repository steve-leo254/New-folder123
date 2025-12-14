"""
Doctor Profile API endpoints
Handles CRUD operations for doctor profile sections including:
- Education & Certifications
- Contact Information  
- Availability Schedule
- Settings & Preferences
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from models import (
    Doctor, DoctorEducation, DoctorContactInfo, 
    DoctorAvailability, DoctorSettings, User
)
from pydantic_models import (
    DoctorEducationRequest, DoctorEducationResponse,
    DoctorContactInfoRequest, DoctorContactInfoResponse,
    DoctorAvailabilityRequest, DoctorAvailabilityResponse,
    DoctorSettingsRequest, DoctorSettingsResponse
)
from auth_router import get_current_active_user

router = APIRouter(prefix="/api/doctor/profile", tags=["doctor-profile"])

# Helper function to get doctor profile for current user
def get_doctor_profile(current_user: User, db: Session) -> Doctor:
    """Get doctor profile for current user."""
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found"
        )
    return doctor

# ============================================================================
# EDUCATION & CERTIFICATIONS
# ============================================================================

@router.get("/education", response_model=List[DoctorEducationResponse])
async def get_education(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get doctor's education and certifications."""
    doctor = get_doctor_profile(current_user, db)
    education = db.query(DoctorEducation).filter(
        DoctorEducation.doctor_id == doctor.id
    ).order_by(DoctorEducation.year.desc()).all()
    return education

@router.post("/education", response_model=DoctorEducationResponse)
async def add_education(
    education_data: DoctorEducationRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add new education/certification."""
    doctor = get_doctor_profile(current_user, db)
    
    education = DoctorEducation(
        doctor_id=doctor.id,
        **education_data.dict()
    )
    db.add(education)
    db.commit()
    db.refresh(education)
    
    # Log activity
    from activity_logger import create_activity_log
    create_activity_log(
        user_id=current_user.id,
        action="Added Education/Certification",
        device="Web Application",
        db=db
    )
    
    return education

@router.put("/education/{education_id}", response_model=DoctorEducationResponse)
async def update_education(
    education_id: int,
    education_data: DoctorEducationRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update education/certification."""
    doctor = get_doctor_profile(current_user, db)
    
    education = db.query(DoctorEducation).filter(
        DoctorEducation.id == education_id,
        DoctorEducation.doctor_id == doctor.id
    ).first()
    
    if not education:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education record not found"
        )
    
    for field, value in education_data.dict().items():
        setattr(education, field, value)
    
    db.commit()
    db.refresh(education)
    
    # Log activity
    from activity_logger import create_activity_log
    create_activity_log(
        user_id=current_user.id,
        action="Updated Education/Certification",
        device="Web Application",
        db=db
    )
    
    return education

@router.delete("/education/{education_id}")
async def delete_education(
    education_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete education/certification."""
    doctor = get_doctor_profile(current_user, db)
    
    education = db.query(DoctorEducation).filter(
        DoctorEducation.id == education_id,
        DoctorEducation.doctor_id == doctor.id
    ).first()
    
    if not education:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education record not found"
        )
    
    db.delete(education)
    db.commit()
    
    # Log activity
    from activity_logger import create_activity_log
    create_activity_log(
        user_id=current_user.id,
        action="Deleted Education/Certification",
        device="Web Application",
        db=db
    )
    
    return {"message": "Education record deleted successfully"}

# ============================================================================
# CONTACT INFORMATION
# ============================================================================

@router.get("/contact", response_model=DoctorContactInfoResponse)
async def get_contact_info(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get doctor's contact information."""
    doctor = get_doctor_profile(current_user, db)
    
    contact_info = db.query(DoctorContactInfo).filter(
        DoctorContactInfo.doctor_id == doctor.id
    ).first()
    
    if not contact_info:
        # Create default contact info
        contact_info = DoctorContactInfo(doctor_id=doctor.id)
        db.add(contact_info)
        db.commit()
        db.refresh(contact_info)
    
    return contact_info

@router.put("/contact", response_model=DoctorContactInfoResponse)
async def update_contact_info(
    contact_data: DoctorContactInfoRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update doctor's contact information."""
    doctor = get_doctor_profile(current_user, db)
    
    contact_info = db.query(DoctorContactInfo).filter(
        DoctorContactInfo.doctor_id == doctor.id
    ).first()
    
    if not contact_info:
        contact_info = DoctorContactInfo(doctor_id=doctor.id)
        db.add(contact_info)
    
    for field, value in contact_data.dict().items():
        setattr(contact_info, field, value)
    
    db.commit()
    db.refresh(contact_info)
    
    # Log activity
    from activity_logger import create_activity_log
    create_activity_log(
        user_id=current_user.id,
        action="Updated Contact Information",
        device="Web Application",
        db=db
    )
    
    return contact_info

# ============================================================================
# AVAILABILITY SCHEDULE
# ============================================================================

@router.get("/availability", response_model=List[DoctorAvailabilityResponse])
async def get_availability(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get doctor's weekly availability."""
    doctor = get_doctor_profile(current_user, db)
    
    availability = db.query(DoctorAvailability).filter(
        DoctorAvailability.doctor_id == doctor.id
    ).order_by(DoctorAvailability.day).all()
    
    # Create default availability if none exists
    if not availability:
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        for day in days:
            avail = DoctorAvailability(
                doctor_id=doctor.id,
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
        availability = db.query(DoctorAvailability).filter(
            DoctorAvailability.doctor_id == doctor.id
        ).order_by(DoctorAvailability.day).all()
    
    return availability

@router.put("/availability/{availability_id}", response_model=DoctorAvailabilityResponse)
async def update_availability(
    availability_id: int,
    availability_data: DoctorAvailabilityRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update doctor's availability for a specific day."""
    doctor = get_doctor_profile(current_user, db)
    
    availability = db.query(DoctorAvailability).filter(
        DoctorAvailability.id == availability_id,
        DoctorAvailability.doctor_id == doctor.id
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
    doctor = get_doctor_profile(current_user, db)
    
    updated_availability = []
    
    for avail_data in availability_list:
        availability = db.query(DoctorAvailability).filter(
            DoctorAvailability.doctor_id == doctor.id,
            DoctorAvailability.day == avail_data.day
        ).first()
        
        if not availability:
            availability = DoctorAvailability(doctor_id=doctor.id, day=avail_data.day)
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
    doctor = get_doctor_profile(current_user, db)
    
    settings = db.query(DoctorSettings).filter(
        DoctorSettings.doctor_id == doctor.id
    ).first()
    
    if not settings:
        # Create default settings
        settings = DoctorSettings(doctor_id=doctor.id)
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
    doctor = get_doctor_profile(current_user, db)
    
    settings = db.query(DoctorSettings).filter(
        DoctorSettings.doctor_id == doctor.id
    ).first()
    
    if not settings:
        settings = DoctorSettings(doctor_id=doctor.id)
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
# COMPLETE PROFILE
# ============================================================================

@router.get("/complete", response_model=dict)
async def get_complete_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get complete doctor profile with all sections."""
    # Get doctor profile - don't auto-create
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found. Please create your profile first."
        )
    
    # Get all sections
    education = db.query(DoctorEducation).filter(
        DoctorEducation.doctor_id == doctor.id
    ).order_by(DoctorEducation.year.desc()).all()
    
    contact_info = db.query(DoctorContactInfo).filter(
        DoctorContactInfo.doctor_id == doctor.id
    ).first()
    
    if not contact_info:
        contact_info = DoctorContactInfo(doctor_id=doctor.id)
        db.add(contact_info)
        db.commit()
        db.refresh(contact_info)
    
    availability = db.query(DoctorAvailability).filter(
        DoctorAvailability.doctor_id == doctor.id
    ).order_by(DoctorAvailability.day).all()
    
    if not availability:
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        for day in days:
            avail = DoctorAvailability(
                doctor_id=doctor.id,
                day=day,
                is_open=(day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
                start_time='09:00',
                end_time='17:00' if day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] else None,
                break_start='12:00' if day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] else None,
                break_end='13:00' if day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] else None
            )
            db.add(avail)
        db.commit()
        availability = db.query(DoctorAvailability).filter(
            DoctorAvailability.doctor_id == doctor.id
        ).order_by(DoctorAvailability.day).all()
    
    settings = db.query(DoctorSettings).filter(
        DoctorSettings.doctor_id == doctor.id
    ).first()
    
    if not settings:
        settings = DoctorSettings(doctor_id=doctor.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return {
        "doctor": {
            "id": doctor.id,
            "user_id": doctor.user_id,
            "specialization": doctor.specialization,
            "bio": doctor.bio,
            "rating": float(doctor.rating) if doctor.rating else 0.0,
            "is_available": doctor.is_available,
            "consultation_fee": float(doctor.consultation_fee) if doctor.consultation_fee else None,
            "license_number": doctor.license_number
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
