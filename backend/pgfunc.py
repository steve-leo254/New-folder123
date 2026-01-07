"""
Database helper functions for querying User, Appointment, and Prescription models.
Models and database configuration are in models.py and database.py.
"""

import logging
from typing import Optional
from sqlalchemy.orm import aliased, Session

from models import User, Appointment, Prescription, Doctor, Role, AppointmentStatus

logger = logging.getLogger(__name__)

# Convenience DB helper functions used by other modules
def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Return a User by id or None."""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Return a User by email or None."""
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, full_name: str, email: str, password_hash: str, role: Role = Role.PATIENT) -> User:
    """Create and return a new User."""
    user = User(full_name=full_name, email=email, password_hash=password_hash, role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_appointments_for_user(db: Session, current_user, status_filter: Optional[AppointmentStatus] = None):
    """Return appointments filtered by user role and optional status."""
    # Handle both User objects and dict (from JWT token)
    if isinstance(current_user, dict):
        user_role_str = current_user.get("role")
        user_id = current_user.get("id")
        try:
            user_role = Role(user_role_str)
        except (ValueError, TypeError):
            user_role = None
    else:
        user_role = current_user.role
        user_id = current_user.id
    
    logger.info(f"Getting appointments for user role: {user_role}, user_id: {user_id}")
    
    # Create aliases for the User table to join both clinician and patient
    ClinicianUser = aliased(User)
    PatientUser = aliased(User)
    
    query = db.query(
        Appointment,
        ClinicianUser.full_name.label('clinician_full_name'),
        PatientUser.full_name.label('patient_full_name')
    ).join(ClinicianUser, Appointment.clinician_id == ClinicianUser.id).join(PatientUser, Appointment.patient_id == PatientUser.id)
    if user_role == Role.PATIENT:
        query = query.filter(Appointment.patient_id == user_id)
        logger.info(f"Filtering for PATIENT {user_id}")
    elif user_role == Role.CLINICIAN_ADMIN:
        # Allow CLINICIAN_ADMIN to see all appointments (for admin dashboard)
        logger.info(f"CLINICIAN_ADMIN - showing all appointments for admin dashboard")
    elif user_role == Role.SUPER_ADMIN:
        logger.info("SUPER_ADMIN - showing all appointments")
    # SUPER_ADMIN sees all appointments
    if status_filter:
        query = query.filter(Appointment.status == status_filter)
    
    appointments = query.order_by(Appointment.scheduled_at.desc()).all()
    logger.info(f"Found {len(appointments)} appointments")
    
    # Add doctor and patient names to appointments
    result = []
    for apt, clinician_full_name, patient_full_name in appointments:
        appointment_dict = {
            'id': apt.id,
            'patient_id': apt.patient_id,
            'clinician_id': apt.clinician_id,
            'doctor_id': apt.clinician_id,  # Add for frontend compatibility
            'doctor_name': clinician_full_name or '',
            'clinician_name': clinician_full_name or '',
            'patient_name': patient_full_name or '',
            'visit_type': apt.visit_type,
            'scheduled_at': apt.scheduled_at,
            'status': apt.status.value if apt.status else 'scheduled',
            'triage_notes': apt.triage_notes,
            'cost': float(apt.cost) if apt.cost else 0.0,
            'cancellation_reason': apt.cancellation_reason,
            'created_at': apt.created_at,
            'updated_at': apt.updated_at
        }
        result.append(appointment_dict)
    
    return result


def dashboard_snapshot(db: Session) -> dict:
    """Return a simple dashboard summary counts."""
    total_users = db.query(User).count()
    total_appointments = db.query(Appointment).count()
    total_prescriptions = db.query(Prescription).count()
    upcoming = db.query(Appointment).filter(Appointment.status == AppointmentStatus.SCHEDULED).count()
    return {
        "users": total_users,
        "appointments": total_appointments,
        "prescriptions": total_prescriptions,
        "upcoming": upcoming,
    }


# Doctor helper functions
def get_all_doctors(db: Session, is_available: bool = True):
    """Return all doctors, optionally filtered by availability."""
    query = db.query(Doctor)
    if is_available:
        query = query.filter(Doctor.is_available == True)
    return query.all()


def get_doctor_by_id(db: Session, doctor_id: int) -> Optional[Doctor]:
    """Return a Doctor by id or None."""
    return db.query(Doctor).filter(Doctor.id == doctor_id).first()


def get_doctors_by_specialization(db: Session, specialization: str, is_available: bool = True):
    """Return doctors filtered by specialization and availability."""
    query = db.query(Doctor).filter(Doctor.specialization == specialization)
    if is_available:
        query = query.filter(Doctor.is_available == True)
    return query.all()


def get_doctor_by_user_id(db: Session, user_id: int) -> Optional[Doctor]:
    """Return a Doctor profile for a given user_id or None."""
    return db.query(Doctor).filter(Doctor.user_id == user_id).first()


def create_doctor(db: Session, user_id: int, specialization: str, bio: str = None, rating: float = 0.0) -> Doctor:
    """Create and return a new Doctor profile."""
    doctor = Doctor(user_id=user_id, specialization=specialization, bio=bio, rating=rating)
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor