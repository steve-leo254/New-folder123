"""
SQLAlchemy ORM models for Kiangombe Patient Center API.
Clean, centralized models following professional patterns.
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Date,
    Numeric,
    ForeignKey,
    Enum,
    Boolean,
    Text,
    func,
    
)
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.dialects.mysql import JSON
import enum
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Setup Base (define here to avoid circular imports)
Base = declarative_base()


# ============================================================================
# Enums
# ============================================================================

class Role(enum.Enum):
    """User role enumeration."""
    SUPER_ADMIN = "super_admin"
    CLINICIAN_ADMIN = "clinician_admin"
    DOCTOR = "doctor"
    NURSE = "nurse"
    RECEPTIONIST = "receptionist"
    LAB_TECHNICIAN = "lab_technician"
    PHARMACIST = "pharmacist"
    PATIENT = "patient"


class AppointmentStatus(enum.Enum):
    """Appointment status enumeration."""
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PrescriptionStatus(enum.Enum):
    """Prescription status enumeration."""
    PENDING = "pending"
    APPROVED = "approved"
    FULFILLED = "fulfilled"


# ============================================================================
# ORM Models
# ============================================================================

class User(Base):
    """User model representing patients, clinicians, and admins in Kiangombe."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True, index=True)
    gender = Column(String(20), nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    address = Column(String(255), nullable=True)
    profile_picture = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True, index=True)
    last_login = Column(DateTime, nullable=True)
    role = Column(Enum(Role), nullable=False, default=Role.PATIENT)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    medical_info = relationship("MedicalInfo", uselist=False, back_populates="patient")
    emergency_contact = relationship("EmergencyContact", uselist=False, back_populates="patient")
    insurance = relationship("Insurance", uselist=False, back_populates="patient")
    notification_settings = relationship("NotificationSettings", uselist=False, back_populates="patient")
    security_settings = relationship("SecuritySettings", uselist=False, back_populates="patient")

    # Appointments
    appointments = relationship(
        "Appointment",
        back_populates="patient",
        foreign_keys="Appointment.patient_id",
        cascade="all, delete-orphan"
    )

    # Relationships

    # Medical History
    medical_history = relationship("MedicalHistory", foreign_keys="MedicalHistory.patient_id", back_populates="patient")
    
    # Staff Profiles
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)
    nurse_profile = relationship("Nurse", back_populates="user", uselist=False)
    receptionist_profile = relationship("Receptionist", back_populates="user", uselist=False)
    lab_technician_profile = relationship("LabTechnician", back_populates="user", uselist=False)
    pharmacist_profile = relationship("Pharmacist", back_populates="user", uselist=False)
    
    # Activity & Wishlist
    activity_logs = relationship("ActivityLog", back_populates="user")
    wishlist_items = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")
    
    # Payments (as patient)
    payments = relationship("Payment", foreign_keys="Payment.patient_id", back_populates="patient")
    
    # Consultations (as clinician)
    consults = relationship("Appointment", foreign_keys="Appointment.clinician_id", back_populates="clinician")


class Payment(Base):
    """Payment model representing M-Pesa and other payment transactions."""
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False, index=True)
    
    # Transaction details
    transaction_id = Column(String(100), unique=True, nullable=False, index=True)  # M-Pesa transaction ID
    amount = Column(Numeric(precision=10, scale=2), nullable=False)  # Payment amount
    payment_method = Column(String(50), nullable=False, default='mpesa')  # 'mpesa', 'card', 'cash', 'insurance'
    payment_status = Column(String(20), default='pending', index=True)  # 'pending', 'paid', 'refunded', 'failed', 'cancelled'
    
    # M-Pesa specific fields
    phone_number = Column(String(20), nullable=True, index=True)  # Patient phone number for M-Pesa
    mpesa_receipt_number = Column(String(100), nullable=True, index=True)  # M-Pesa receipt number
    
    # Timestamps
    payment_date = Column(DateTime, nullable=True, index=True)  # When payment was made
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    patient = relationship("User", foreign_keys=[patient_id], back_populates="payments")
    doctor = relationship("User", foreign_keys=[doctor_id], back_populates="payments")
    appointment = relationship("Appointment", back_populates="payments")


class Doctor(Base):
    """Doctor model representing clinicians with specializations."""
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    specialization = Column(String(120), nullable=True, index=True)
    bio = Column(Text, nullable=True)
    rating = Column(Numeric(precision=3, scale=2), default=0.0)
    license_number = Column(String(50), unique=True, nullable=True)
    is_available = Column(Boolean, default=True, index=True)
    consultation_fee = Column(Numeric(precision=10, scale=2), nullable=True)
    video_consultation_fee = Column(Numeric(precision=10, scale=2), nullable=True)
    phone_consultation_fee = Column(Numeric(precision=10, scale=2), nullable=True)
    chat_consultation_fee = Column(Numeric(precision=10, scale=2), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="doctor_profile")


class Nurse(Base):
    """Nurse model representing nursing staff."""
    __tablename__ = "nurses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    specialization = Column(String(120), nullable=True)
    bio = Column(Text, nullable=True)
    license_number = Column(String(50), unique=True, nullable=True)
    is_available = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="nurse_profile")


class Receptionist(Base):
    """Receptionist model representing reception staff."""
    __tablename__ = "receptionists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    bio = Column(Text, nullable=True)
    is_available = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="receptionist_profile")


class LabTechnician(Base):
    """Lab Technician model representing laboratory staff."""
    __tablename__ = "lab_technicians"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    specialization = Column(String(120), nullable=True)
    bio = Column(Text, nullable=True)
    license_number = Column(String(50), unique=True, nullable=True)
    is_available = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="lab_technician_profile")


class Pharmacist(Base):
    """Pharmacist model representing pharmacy staff."""
    __tablename__ = "pharmacists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    specialization = Column(String(120), nullable=True)
    bio = Column(Text, nullable=True)
    license_number = Column(String(50), unique=True, nullable=True)
    is_available = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="pharmacist_profile")


class Appointment(Base):
    """Appointment model representing patient-clinician appointments."""
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    clinician_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    visit_type = Column(String(80), nullable=True)
    specialization = Column(String(80), nullable=True, index=True)
    scheduled_at = Column(DateTime, nullable=False, index=True)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.SCHEDULED, index=True)
    triage_notes = Column(Text, nullable=True)
    cost = Column(Numeric(precision=10, scale=2), default=0.0)
    cancellation_reason = Column(Text, nullable=True)
    
    # Payment fields
    payment_status = Column(String(20), default='unpaid', index=True)  # 'unpaid', 'paid', 'refunded', 'pending'
    payment_method = Column(String(50), nullable=True)  # 'mpesa', 'card', 'cash', 'insurance'
    payment_amount = Column(Numeric(precision=10, scale=2), default=0.0)
    transaction_id = Column(String(100), unique=True, nullable=True)
    payment_date = Column(DateTime, nullable=True)
    invoice_number = Column(String(50), unique=True, nullable=True)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("User", foreign_keys=[patient_id], back_populates="appointments")
    clinician = relationship("User", foreign_keys=[clinician_id], back_populates="consults")
    prescription = relationship("Prescription", back_populates="appointment", uselist=False)
    payments = relationship("Payment", back_populates="appointment")


class Prescription(Base):
    """Prescription model representing medications prescribed for appointments."""
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(
        Integer,
        ForeignKey("appointments.id"),
        unique=True,
        nullable=True,  # Made nullable for direct prescription creation
        index=True
    )
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Added for direct prescription
    issued_by_doctor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    pharmacy_name = Column(String(120), nullable=True)
    medications_json = Column(JSON, nullable=True)
    status = Column(Enum(PrescriptionStatus), default=PrescriptionStatus.PENDING, index=True)
    qr_code_path = Column(String(255), nullable=True)
    issued_date = Column(DateTime, default=func.now())
    expiry_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    appointment = relationship("Appointment", back_populates="prescription")
    patient = relationship("User", foreign_keys=[patient_id])
    issued_by_doctor = relationship("User", foreign_keys=[issued_by_doctor_id])

    @property
    def doctor_name(self):
        """Convenience property for the issuing doctor's full name."""
        return self.issued_by_doctor.full_name if self.issued_by_doctor else None


class Medication(Base):
    """Medication model for pharmacy inventory management."""
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    dosage = Column(String(100), nullable=True)
    price = Column(Numeric(precision=10, scale=2), nullable=False)
    stock = Column(Integer, default=0, nullable=False)
    description = Column(Text, nullable=True)
    prescription_required = Column(Boolean, default=False)
    expiry_date = Column(DateTime, nullable=True)
    batch_number = Column(String(100), nullable=True, index=True)
    supplier = Column(String(150), nullable=True)
    image_url = Column(String(500), nullable=True)
    in_stock = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    wishlist_items = relationship("Wishlist", back_populates="medication", cascade="all, delete-orphan")


class MedicalHistory(Base):
    """Medical history model for tracking patient health records."""
    __tablename__ = "medical_history"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    type = Column(String(50), nullable=False)  # consultation, diagnosis, prescription, lab_result, vaccination
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    diagnosis = Column(Text, nullable=True)
    symptoms = Column(Text, nullable=True)
    treatment_plan = Column(Text, nullable=True)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_name = Column(String(120), nullable=False)
    notes = Column(Text, nullable=True)
    attachments_json = Column(JSON, nullable=True)  # Legacy field
    attachments = Column(JSON, nullable=True)  # New field for list of attachment file names
    date = Column(DateTime, nullable=False, default=datetime.utcnow)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("User", foreign_keys=[patient_id], back_populates="medical_history")
    doctor = relationship("User", foreign_keys=[doctor_id], backref="medical_records_created")


# ============================================================================
# Patient Profile Models
# ============================================================================

class MedicalInfo(Base):
    """Medical information model for patient health details."""
    __tablename__ = "medical_info"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    blood_type = Column(String(10), nullable=True)
    height = Column(String(20), nullable=True) 
    weight = Column(String(20), nullable=True) 
    allergies = Column(JSON, nullable=True)
    conditions = Column(JSON, nullable=True) 
    medications = Column(JSON, nullable=True) 
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("User", back_populates="medical_info")


class EmergencyContact(Base):
    """Emergency contact information for patients."""
    __tablename__ = "emergency_contacts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    name = Column(String(120), nullable=False)
    phone = Column(String(20), nullable=False)
    relation = Column(String(50), nullable=False)  # Spouse, Parent, Child, Sibling, Friend, Other
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("User", back_populates="emergency_contact")


class Insurance(Base):
    """Insurance information for patients."""
    __tablename__ = "insurance"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    provider = Column(String(120), nullable=False)  # e.g., "Blue Cross Blue Shield"
    policy_number = Column(String(100), nullable=False)
    group_number = Column(String(100), nullable=True)
    holder_name = Column(String(120), nullable=False)  # Policy holder's name
    insurance_type = Column(String(50), nullable=True, default="standard")
    quarterly_limit = Column(Numeric(10, 2), nullable=True)
    quarterly_used = Column(Numeric(10, 2), nullable=True, default=0)
    coverage_start_date = Column(DateTime, nullable=True)
    coverage_end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("User", back_populates="insurance")


class DoctorAvailability(Base):
    """Doctor weekly availability schedule."""
    __tablename__ = "doctor_availability"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False, index=True)
    day = Column(Enum('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', name='week_day'), nullable=False)
    is_open = Column(Boolean, default=True)
    start_time = Column(String(5), nullable=True)  # HH:MM format
    end_time = Column(String(5), nullable=True)    # HH:MM format
    break_start = Column(String(5), nullable=True)  # HH:MM format
    break_end = Column(String(5), nullable=True)    # HH:MM format
    appointment_duration = Column(Integer, default=30)  # minutes
    buffer_time = Column(Integer, default=10)  # minutes between appointments
    max_appointments_per_day = Column(Integer, default=20)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    doctor = relationship("Doctor", backref="availability")


class DoctorSettings(Base):
    """Doctor profile and notification settings - simplified for offline-first app."""
    __tablename__ = "doctor_settings"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False, unique=True, index=True)
    # Profile visibility settings
    show_profile_to_patients = Column(Boolean, default=True)
    show_rating_reviews = Column(Boolean, default=True)
    allow_online_booking = Column(Boolean, default=True)
    show_availability = Column(Boolean, default=True)
    
    # Notification settings (email/SMS focused)
    email_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=True)
    appointment_reminders = Column(Boolean, default=True)
    new_appointment_requests = Column(Boolean, default=True)
    cancellation_alerts = Column(Boolean, default=True)
    weekly_summary = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    doctor = relationship("Doctor", backref="settings")


class NotificationSettings(Base):
    """Notification preferences for patients."""
    __tablename__ = "notification_settings"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    email_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=True)
    appointment_reminders = Column(Boolean, default=True)
    lab_results_notifications = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("User", back_populates="notification_settings")


class SecuritySettings(Base):
    """Security settings for patient accounts."""
    __tablename__ = "security_settings"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    two_factor_enabled = Column(Boolean, default=False)
    login_alerts = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("User", back_populates="security_settings")


class ActivityLog(Base):
    """Activity logs for tracking user account activity."""
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String(200), nullable=False)  # e.g., "Login", "Password Change", "Profile Update"
    device = Column(String(200), nullable=True)  # e.g., "Chrome on Windows", "iPhone Safari"
    location = Column(String(200), nullable=True)  # e.g., "Nairobi, Kenya", "New York, USA"
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    timestamp = Column(DateTime, default=func.now(), index=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    user = relationship("User", back_populates="activity_logs")


class Wishlist(Base):
    """Wishlist model for patient medication favorites."""
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    medication_id = Column(Integer, ForeignKey("medications.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="wishlist_items")
    medication = relationship("Medication", back_populates="wishlist_items")

    # Ensure unique user-medication combination
    __table_args__ = (
        {"mysql_charset": "utf8mb4", "mysql_collate": "utf8mb4_unicode_ci"},
    )

