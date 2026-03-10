"""
SQLAlchemy ORM models for Kiangombe Patient Center API.
Refactored: 18 tables → 13 tables.

Key changes:
  - Doctor, Pharmacist staff tables → unified StaffProfile
  - DoctorAvailability → StaffAvailability
  - DoctorSettings → StaffSettings
  - NotificationSettings + SecuritySettings → UserSettings
  - Payment table removed (payment data lives on Appointment)
  - Nurse, Receptionist, LabTechnician tables dropped (unused roles removed)
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Numeric,
    ForeignKey,
    Enum,
    Boolean,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.dialects.mysql import JSON
import enum
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

Base = declarative_base()


# ============================================================================
# Enums
# ============================================================================

class Role(enum.Enum):
    """User role enumeration."""
    SUPER_ADMIN = "super_admin"
    CLINICIAN_ADMIN = "clinician_admin"
    DOCTOR = "doctor"
    PHARMACIST = "pharmacist"
    PATIENT = "patient"


class StaffRole(enum.Enum):
    """Staff profile role — drives which fields are relevant."""
    DOCTOR = "doctor"
    PHARMACIST = "pharmacist"


class AppointmentStatus(enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PrescriptionStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    FULFILLED = "fulfilled"


class PaymentStatus(enum.Enum):
    UNPAID = "unpaid"
    PENDING = "pending"
    PAID = "paid"
    REFUNDED = "refunded"
    FAILED = "failed"


class PaymentMethod(enum.Enum):
    MPESA = "mpesa"
    CARD = "card"
    CASH = "cash"
    INSURANCE = "insurance"


# ============================================================================
# Core User Model
# ============================================================================

class User(Base):
    """
    Central user model for all actors in the system.
    Role determines which profile (staff_profile) is attached.
    """
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
    role = Column(Enum(Role), nullable=False, default=Role.PATIENT, index=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # ── 1-to-1 patient profile relationships ────────────────────────────────
    medical_info = relationship("MedicalInfo", uselist=False, back_populates="patient")
    emergency_contact = relationship("EmergencyContact", uselist=False, back_populates="patient")
    insurance = relationship("Insurance", uselist=False, back_populates="patient")
    settings = relationship("UserSettings", uselist=False, back_populates="user")

    # ── Staff profile (Doctor or Pharmacist) ────────────────────────────────
    staff_profile = relationship("StaffProfile", uselist=False, back_populates="user")

    # ── Appointments ─────────────────────────────────────────────────────────
    appointments = relationship(
        "Appointment",
        foreign_keys="Appointment.patient_id",
        back_populates="patient",
        cascade="all, delete-orphan",
    )
    consults = relationship(
        "Appointment",
        foreign_keys="Appointment.clinician_id",
        back_populates="clinician",
    )

    # ── Medical history ──────────────────────────────────────────────────────
    medical_history = relationship(
        "MedicalHistory",
        foreign_keys="MedicalHistory.patient_id",
        back_populates="patient",
    )

    # ── Misc ─────────────────────────────────────────────────────────────────
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")
    wishlist_items = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")


# ============================================================================
# Unified Staff Profile  (replaces Doctor + Pharmacist separate tables)
# ============================================================================

class StaffProfile(Base):
    """
    Single profile table for all clinical staff (Doctor, Pharmacist).

    Role-specific fields:
      - Doctor:     consultation_fee, video/phone/chat fees, rating, license_number
      - Pharmacist: license_number only (fees not applicable)

    Fields not relevant to a role are left NULL — this is intentional and keeps
    queries simple (one join instead of conditional joins across 2+ tables).
    """
    __tablename__ = "staff_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    role = Column(Enum(StaffRole), nullable=False, index=True)

    # Shared fields
    specialization = Column(String(120), nullable=True, index=True)
    bio = Column(Text, nullable=True)
    license_number = Column(String(50), unique=True, nullable=True)
    is_available = Column(Boolean, default=True, index=True)

    # Doctor-only fields (NULL for pharmacists)
    rating = Column(Numeric(precision=3, scale=2), default=0.0, nullable=True)
    consultation_fee = Column(Numeric(precision=10, scale=2), nullable=True)
    video_consultation_fee = Column(Numeric(precision=10, scale=2), nullable=True)
    phone_consultation_fee = Column(Numeric(precision=10, scale=2), nullable=True)
    chat_consultation_fee = Column(Numeric(precision=10, scale=2), nullable=True)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="staff_profile")
    availability = relationship(
        "StaffAvailability",
        back_populates="staff",
        cascade="all, delete-orphan",
    )
    staff_settings = relationship("StaffSettings", uselist=False, back_populates="staff")


# ============================================================================
# Staff Availability  (replaces DoctorAvailability)
# ============================================================================

class StaffAvailability(Base):
    """
    Weekly availability schedule for clinical staff.
    Previously DoctorAvailability — now shared by all StaffProfile roles.
    """
    __tablename__ = "staff_availability"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff_profiles.id"), nullable=False, index=True)
    day = Column(
        Enum("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
             name="week_day"),
        nullable=False,
    )
    is_open = Column(Boolean, default=True)
    start_time = Column(String(5), nullable=True)   # HH:MM
    end_time = Column(String(5), nullable=True)     # HH:MM
    break_start = Column(String(5), nullable=True)  # HH:MM
    break_end = Column(String(5), nullable=True)    # HH:MM
    appointment_duration = Column(Integer, default=30)   # minutes
    buffer_time = Column(Integer, default=10)            # minutes between appointments
    max_appointments_per_day = Column(Integer, default=20)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    staff = relationship("StaffProfile", back_populates="availability")

    __table_args__ = (
        UniqueConstraint("staff_id", "day", name="uq_staff_day"),
    )


# ============================================================================
# Staff Settings  (replaces DoctorSettings)
# ============================================================================

class StaffSettings(Base):
    """
    Profile visibility and notification preferences for clinical staff.
    Previously DoctorSettings — now generic across all StaffProfile roles.
    """
    __tablename__ = "staff_settings"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff_profiles.id"), unique=True, nullable=False, index=True)

    # Visibility
    show_profile_to_patients = Column(Boolean, default=True)
    show_rating_reviews = Column(Boolean, default=True)
    allow_online_booking = Column(Boolean, default=True)
    show_availability = Column(Boolean, default=True)

    # Notifications
    email_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=True)
    appointment_reminders = Column(Boolean, default=True)
    new_appointment_requests = Column(Boolean, default=True)
    cancellation_alerts = Column(Boolean, default=True)
    weekly_summary = Column(Boolean, default=False)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    staff = relationship("StaffProfile", back_populates="staff_settings")


# ============================================================================
# User Settings  (merges NotificationSettings + SecuritySettings)
# ============================================================================

class UserSettings(Base):
    """
    All patient-facing preferences in one row.
    Merges the old NotificationSettings and SecuritySettings tables.
    Access via: user.settings.email_notifications, user.settings.two_factor_enabled, etc.
    """
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)

    # Notification prefs (was NotificationSettings)
    email_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=True)
    appointment_reminders = Column(Boolean, default=True)
    lab_results_notifications = Column(Boolean, default=True)

    # Security prefs (was SecuritySettings)
    two_factor_enabled = Column(Boolean, default=False)
    login_alerts = Column(Boolean, default=True)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="settings")


# ============================================================================
# Appointment  (payment columns absorbed from removed Payment table)
# ============================================================================

class Appointment(Base):
    """
    Patient–clinician appointment.

    Payment data lives here directly — the separate Payment table has been
    removed to eliminate duplication. M-Pesa receipt and phone number are
    included for full transaction traceability without a second table.
    """
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    clinician_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    visit_type = Column(String(80), nullable=True)
    specialization = Column(String(80), nullable=True, index=True)
    scheduled_at = Column(DateTime, nullable=False, index=True)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.SCHEDULED, index=True)
    triage_notes = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)

    # ── Payment ──────────────────────────────────────────────────────────────
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.UNPAID, index=True)
    payment_method = Column(Enum(PaymentMethod), nullable=True)
    payment_amount = Column(Numeric(precision=10, scale=2), default=0.0)
    transaction_id = Column(String(100), unique=True, nullable=True, index=True)
    mpesa_receipt_number = Column(String(100), nullable=True, index=True)
    mpesa_phone_number = Column(String(20), nullable=True)
    invoice_number = Column(String(50), unique=True, nullable=True)
    payment_date = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("User", foreign_keys=[patient_id], back_populates="appointments")
    clinician = relationship("User", foreign_keys=[clinician_id], back_populates="consults")
    prescription = relationship("Prescription", back_populates="appointment", uselist=False)


# ============================================================================
# Prescription
# ============================================================================

class Prescription(Base):
    """Medications prescribed for a given appointment."""
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), unique=True, nullable=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    issued_by_doctor_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
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
        return self.issued_by_doctor.full_name if self.issued_by_doctor else None


# ============================================================================
# Medication
# ============================================================================

class Medication(Base):
    """Pharmacy inventory."""
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

    wishlist_items = relationship("Wishlist", back_populates="medication", cascade="all, delete-orphan")


# ============================================================================
# Medical History
# ============================================================================

class MedicalHistory(Base):
    """Chronological health record entries for a patient."""
    __tablename__ = "medical_history"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True, index=True)
    type = Column(String(50), nullable=False)       # consultation | diagnosis | prescription | lab_result | vaccination
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    diagnosis = Column(Text, nullable=True)
    symptoms = Column(Text, nullable=True)
    treatment_plan = Column(Text, nullable=True)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    doctor_name = Column(String(120), nullable=False)   # denormalised for fast display
    notes = Column(Text, nullable=True)
    attachments = Column(JSON, nullable=True)
    date = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("User", foreign_keys=[patient_id], back_populates="medical_history")
    doctor = relationship("User", foreign_keys=[doctor_id], backref="medical_records_created")


# ============================================================================
# Patient Profile Models
# ============================================================================

class MedicalInfo(Base):
    """Baseline health data for a patient (blood type, allergies, etc.)."""
    __tablename__ = "medical_info"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    blood_type = Column(String(10), nullable=True)
    height = Column(String(20), nullable=True)
    weight = Column(String(20), nullable=True)
    allergies = Column(JSON, nullable=True)
    conditions = Column(JSON, nullable=True)
    medications = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    patient = relationship("User", back_populates="medical_info")


class EmergencyContact(Base):
    """Single emergency contact per patient."""
    __tablename__ = "emergency_contacts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    name = Column(String(120), nullable=False)
    phone = Column(String(20), nullable=False)
    relation = Column(String(50), nullable=False)  # Spouse | Parent | Child | Sibling | Friend | Other
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    patient = relationship("User", back_populates="emergency_contact")


class Insurance(Base):
    """Insurance policy details for a patient."""
    __tablename__ = "insurance"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    provider = Column(String(120), nullable=False)
    policy_number = Column(String(100), nullable=False)
    group_number = Column(String(100), nullable=True)
    holder_name = Column(String(120), nullable=False)
    insurance_type = Column(String(50), nullable=True, default="standard")
    quarterly_limit = Column(Numeric(10, 2), nullable=True)
    quarterly_used = Column(Numeric(10, 2), nullable=True, default=0)
    coverage_start_date = Column(DateTime, nullable=True)
    coverage_end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    patient = relationship("User", back_populates="insurance")


# ============================================================================
# Activity & Wishlist
# ============================================================================

class ActivityLog(Base):
    """Immutable audit trail of user account actions."""
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String(200), nullable=False)
    device = Column(String(200), nullable=True)
    location = Column(String(200), nullable=True)
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime, default=func.now(), index=True)
    created_at = Column(DateTime, default=func.now())

    user = relationship("User", back_populates="activity_logs")


class Wishlist(Base):
    """Patient-saved medication favourites."""
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    medication_id = Column(Integer, ForeignKey("medications.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="wishlist_items")
    medication = relationship("Medication", back_populates="wishlist_items")

    __table_args__ = (
        UniqueConstraint("user_id", "medication_id", name="uq_user_medication"),
        {"mysql_charset": "utf8mb4", "mysql_collate": "utf8mb4_unicode_ci"},
    )

