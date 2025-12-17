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


class PaymentStatus(enum.Enum):
    """Payment status enumeration."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# ============================================================================
# ORM Models
# ============================================================================

class StaffRole(Base):
    """Staff role model representing configurable staff roles with permissions."""
    __tablename__ = "staff_roles"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=False)
    permissions = Column(JSON, nullable=False)  # List of permission strings
    is_active = Column(Boolean, default=True, index=True)
    requires_specialization = Column(Boolean, default=False)
    requires_license = Column(Boolean, default=False)
    default_consultation_fee = Column(Numeric(precision=10, scale=2), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


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
    last_login = Column(DateTime, nullable=True)
    role = Column(Enum(Role), nullable=False, default=Role.PATIENT)
    staff_role_id = Column(String(50), ForeignKey("staff_roles.id"), nullable=True, index=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    last_login = Column(DateTime, nullable=True)

    # Relationships
    staff_role = relationship("StaffRole", backref="users")
    appointments = relationship(
        "Appointment",
        back_populates="patient",
        foreign_keys="Appointment.patient_id",
    )
    consults = relationship(
        "Appointment",
        back_populates="clinician",
        foreign_keys="Appointment.clinician_id",
    )
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)
    nurse_profile = relationship("Nurse", back_populates="user", uselist=False)
    receptionist_profile = relationship("Receptionist", back_populates="user", uselist=False)
    lab_technician_profile = relationship("LabTechnician", back_populates="user", uselist=False)
    pharmacist_profile = relationship("Pharmacist", back_populates="user", uselist=False)
    payments = relationship("Payment", back_populates="user")
    medical_history = relationship("MedicalHistory", back_populates="patient")
    addresses = relationship("Address", back_populates="user")


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


class MoodEntry(Base):
    """Mood entry model for tracking user's daily mood."""
    __tablename__ = "mood_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    mood = Column(Integer, nullable=False)  # 1-10 scale
    energy = Column(Integer, nullable=False)  # 1-10 scale
    anxiety = Column(Integer, nullable=False)  # 1-10 scale
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    user = relationship("User", backref="mood_entries")


class GameResult(Base):
    """Game result model for tracking mental health game performance."""
    __tablename__ = "game_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    game = Column(String(50), nullable=False)  # memory, reaction, color, focus
    score = Column(Integer, nullable=False)
    level = Column(Integer, nullable=False)
    metrics = Column(JSON, nullable=True)  # Additional game-specific metrics
    timestamp = Column(DateTime, default=func.now(), index=True)

    # Relationships
    user = relationship("User", backref="game_results")


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
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("User", foreign_keys=[patient_id], back_populates="appointments")
    clinician = relationship("User", foreign_keys=[clinician_id], back_populates="consults")
    prescription = relationship("Prescription", back_populates="appointment", uselist=False)
    payment = relationship("Payment", back_populates="appointment", uselist=False)


class Prescription(Base):
    """Prescription model representing medications prescribed for appointments."""
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(
        Integer,
        ForeignKey("appointments.id"),
        unique=True,
        nullable=False,
        index=True
    )
    issued_by_doctor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    pharmacy_name = Column(String(120), nullable=True)
    medications_json = Column(JSON, nullable=True)
    status = Column(Enum(PrescriptionStatus), default=PrescriptionStatus.PENDING, index=True)
    qr_code_path = Column(String(255), nullable=True)
    issued_date = Column(DateTime, default=func.now())
    expiry_date = Column(DateTime, nullable=True)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    appointment = relationship("Appointment", back_populates="prescription")


class Payment(Base):
    """Payment model representing transactions for appointments."""
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Numeric(precision=12, scale=2), nullable=False)
    payment_method = Column(String(50), nullable=False)  # "card", "mpesa", "bank_transfer"
    transaction_id = Column(String(100), unique=True, nullable=True, index=True)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, index=True)
    reference_number = Column(String(100), nullable=True)
    payment_details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    appointment = relationship("Appointment", back_populates="payment")
    user = relationship("User", back_populates="payments")


class Address(Base):
    """Address model for patient delivery and contact addresses."""
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone_number = Column(String(20), nullable=False)
    address = Column(String(255), nullable=False)
    additional_info = Column(String(255), nullable=True)
    region = Column(String(100), nullable=True)
    city = Column(String(100), nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="addresses")


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


class MedicalHistory(Base):
    """Medical history model for tracking patient health records."""
    __tablename__ = "medical_history"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    diagnosis = Column(Text, nullable=True)
    symptoms = Column(Text, nullable=True)
    treatment_plan = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    attachments_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("User", back_populates="medical_history")


class VideoConsultation(Base):
    """Video consultation model for tracking video call sessions."""
    __tablename__ = "video_consultations"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False, unique=True, index=True)
    room_id = Column(String(255), nullable=False, unique=True, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String(50), default='waiting', index=True)  # waiting, active, ended
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    recording_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    appointment = relationship("Appointment", foreign_keys=[appointment_id])
    doctor = relationship("User", foreign_keys=[doctor_id])
    patient = relationship("User", foreign_keys=[patient_id])


# ============================================================================
# Patient Profile Models
# ============================================================================

class MedicalInfo(Base):
    """Medical information model for patient health details."""
    __tablename__ = "medical_info"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    blood_type = Column(String(10), nullable=True)  # A+, A-, B+, B-, AB+, AB-, O+, O-
    height = Column(String(20), nullable=True)  # e.g., "5'10\"", "178cm"
    weight = Column(String(20), nullable=True)  # e.g., "175 lbs", "79kg"
    allergies = Column(JSON, nullable=True)  # ["Peanuts", "Shellfish", "Penicillin"]
    conditions = Column(JSON, nullable=True)  # ["Diabetes", "Hypertension", "Asthma"]
    medications = Column(JSON, nullable=True)  # ["Aspirin 81mg", "Metformin 500mg", "Lisinopril 10mg"]
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("User", backref="medical_info")


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
    patient = relationship("User", backref="emergency_contact")


class Insurance(Base):
    """Insurance information for patients."""
    __tablename__ = "insurance"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    provider = Column(String(120), nullable=False)  # e.g., "Blue Cross Blue Shield"
    policy_number = Column(String(100), nullable=False)
    group_number = Column(String(100), nullable=True)
    holder_name = Column(String(120), nullable=False)  # Policy holder's name
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("User", backref="insurance")


class DoctorEducation(Base):
    """Doctor education and certifications."""
    __tablename__ = "doctor_education"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)  # e.g., "Doctor of Medicine"
    institution = Column(String(200), nullable=False)  # e.g., "Harvard Medical School"
    year = Column(String(4), nullable=False)  # Graduation year
    type = Column(Enum('degree', 'certification', 'license', name='education_type'), nullable=False)
    license_number = Column(String(50), nullable=True)
    expiry_date = Column(String(10), nullable=True)  # YYYY-MM-DD format
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    doctor = relationship("Doctor", backref="education")


class DoctorContactInfo(Base):
    """Doctor contact and professional information."""
    __tablename__ = "doctor_contact_info"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False, unique=True, index=True)
    hospital = Column(String(200), nullable=True)
    department = Column(String(100), nullable=True)
    location = Column(String(300), nullable=True)  # Office location
    languages = Column(JSON, nullable=True)  # List of languages
    consultation_fee = Column(Numeric(precision=10, scale=2), nullable=True)
    response_rate = Column(Numeric(precision=5, scale=2), default=98.0)
    on_time_rate = Column(Numeric(precision=5, scale=2), default=95.0)
    patient_satisfaction = Column(Numeric(precision=3, scale=2), default=4.9)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    doctor = relationship("Doctor", backref="contact_info")


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
    """Doctor profile and notification settings."""
    __tablename__ = "doctor_settings"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False, unique=True, index=True)
    # Profile visibility settings
    show_profile_to_patients = Column(Boolean, default=True)
    show_rating_reviews = Column(Boolean, default=True)
    allow_online_booking = Column(Boolean, default=True)
    show_availability = Column(Boolean, default=True)
    
    # Notification settings
    email_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=True)
    appointment_reminders = Column(Boolean, default=True)
    new_appointment_requests = Column(Boolean, default=True)
    cancellation_alerts = Column(Boolean, default=True)
    patient_messages = Column(Boolean, default=True)
    weekly_summary = Column(Boolean, default=False)
    marketing_emails = Column(Boolean, default=False)
    
    # Consultation types enabled
    in_person_consultations = Column(Boolean, default=True)
    video_consultations = Column(Boolean, default=True)
    phone_consultations = Column(Boolean, default=True)
    chat_consultations = Column(Boolean, default=False)
    
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
    patient = relationship("User", backref="notification_settings")


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
    patient = relationship("User", backref="security_settings")


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
    user = relationship("User", backref="activity_logs")


class ChatMessage(Base):
    """Chat messages between patients and doctors."""
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True, index=True)
    message = Column(Text, nullable=False)
    message_type = Column(String(20), default="text")  # text, image, file
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now(), index=True)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], backref="sent_messages")
    recipient = relationship("User", foreign_keys=[recipient_id], backref="received_messages")
    appointment = relationship("Appointment", backref="chat_messages")


class ChatRoom(Base):
    """Chat rooms for ongoing conversations."""
    __tablename__ = "chat_rooms"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True, index=True)
    is_active = Column(Boolean, default=True)
    last_message_at = Column(DateTime, default=func.now())
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("User", foreign_keys=[patient_id], backref="patient_chat_rooms")
    doctor = relationship("User", foreign_keys=[doctor_id], backref="doctor_chat_rooms")
    appointment = relationship("Appointment", backref="chat_room")

