# Kiangombe Health Center - Entity Relationship Diagram

## Database Overview
This ERD represents a comprehensive health center management system with the following main entities:
- User Management (Patients, Doctors, Staff)
- Appointments & Scheduling
- Medical Records & History
- Prescriptions & Medications
- Payments & Billing
- Pharmacy Inventory

---

## Core Entity Relationships

```mermaid
erDiagram
    USERS {
        int id PK
        string full_name
        string email UK
        string password_hash
        string phone
        string gender
        datetime date_of_birth
        string address
        string profile_picture
        boolean is_verified
        boolean is_active
        datetime last_login
        enum role
        datetime created_at
        datetime updated_at
    }
    
    DOCTORS {
        int id PK
        int user_id FK
        string specialization
        text bio
        decimal rating
        string license_number UK
        boolean is_available
        decimal consultation_fee
        decimal video_consultation_fee
        decimal phone_consultation_fee
        decimal chat_consultation_fee
        datetime created_at
        datetime updated_at
    }
    
    APPOINTMENTS {
        int id PK
        int patient_id FK
        int clinician_id FK
        string visit_type
        string specialization
        datetime scheduled_at
        enum status
        text triage_notes
        decimal cost
        text cancellation_reason
        string payment_status
        string payment_method
        decimal payment_amount
        string transaction_id UK
        datetime payment_date
        string invoice_number UK
        datetime created_at
        datetime updated_at
    }
    
    PRESCRIPTIONS {
        int id PK
        int appointment_id FK
        int patient_id FK
        int issued_by_doctor_id FK
        string pharmacy_name
        json medications_json
        enum status
        string qr_code_path
        datetime issued_date
        datetime expiry_date
        datetime created_at
        datetime updated_at
    }
    
    MEDICATIONS {
        int id PK
        string name
        string category
        string dosage
        decimal price
        int stock
        text description
        boolean prescription_required
        datetime expiry_date
        string batch_number UK
        string supplier
        string image_url
        boolean in_stock
        datetime created_at
        datetime updated_at
    }
    
    PAYMENTS {
        int id PK
        int patient_id FK
        int doctor_id FK
        int appointment_id FK
        string transaction_id UK
        decimal amount
        string payment_method
        string payment_status
        string phone_number
        string mpesa_receipt_number
        datetime payment_date
        datetime created_at
        datetime updated_at
    }
    
    MEDICAL_HISTORY {
        int id PK
        int patient_id FK
        int appointment_id FK
        string type
        string title
        text description
        text diagnosis
        text symptoms
        text treatment_plan
        int doctor_id FK
        string doctor_name
        text notes
        json attachments
        datetime date
        datetime created_at
        datetime updated_at
    }

    %% Relationships
    USERS ||--o{ DOCTORS : "has profile"
    USERS ||--o{ APPOINTMENTS : "patient has"
    USERS ||--o{ APPOINTMENTS : "clinician conducts"
    USERS ||--o{ PRESCRIPTIONS : "patient receives"
    USERS ||--o{ PRESCRIPTIONS : "doctor issues"
    USERS ||--o{ PAYMENTS : "patient makes"
    USERS ||--o{ PAYMENTS : "doctor receives"
    USERS ||--o{ MEDICAL_HISTORY : "patient has"
    USERS ||--o{ MEDICAL_HISTORY : "doctor creates"
    
    APPOINTMENTS ||--o{ PRESCRIPTIONS : "may have"
    APPOINTMENTS ||--o{ PAYMENTS : "generates"
    APPOINTMENTS ||--o{ MEDICAL_HISTORY : "generates"
    
    MEDICATIONS ||--o{ PRESCRIPTIONS : "prescribed in"
```

---

## Patient Profile Support Tables

```mermaid
erDiagram
    MEDICAL_INFO {
        int id PK
        int patient_id FK UK
        string blood_type
        string height
        string weight
        json allergies
        json conditions
        json medications
        datetime created_at
        datetime updated_at
    }
    
    EMERGENCY_CONTACTS {
        int id PK
        int patient_id FK UK
        string name
        string phone
        string relation
        datetime created_at
        datetime updated_at
    }
    
    INSURANCE {
        int id PK
        int patient_id FK UK
        string provider
        string policy_number
        string group_number
        string holder_name
        string insurance_type
        decimal quarterly_limit
        decimal quarterly_used
        datetime coverage_start_date
        datetime coverage_end_date
        datetime created_at
        datetime updated_at
    }
    
    NOTIFICATION_SETTINGS {
        int id PK
        int patient_id FK UK
        boolean email_notifications
        boolean sms_notifications
        boolean appointment_reminders
        boolean lab_results_notifications
        datetime created_at
        datetime updated_at
    }
    
    SECURITY_SETTINGS {
        int id PK
        int patient_id FK UK
        boolean two_factor_enabled
        boolean login_alerts
        datetime created_at
        datetime updated_at
    }

    USERS ||--|| MEDICAL_INFO : "has"
    USERS ||--|| EMERGENCY_CONTACTS : "has"
    USERS ||--|| INSURANCE : "has"
    USERS ||--|| NOTIFICATION_SETTINGS : "has"
    USERS ||--|| SECURITY_SETTINGS : "has"
```

---

## Staff Management Tables

```mermaid
erDiagram
    NURSES {
        int id PK
        int user_id FK UK
        string specialization
        text bio
        string license_number UK
        boolean is_available
        datetime created_at
        datetime updated_at
    }
    
    RECEPTIONISTS {
        int id PK
        int user_id FK UK
        text bio
        boolean is_available
        datetime created_at
        datetime updated_at
    }
    
    LAB_TECHNICIANS {
        int id PK
        int user_id FK UK
        string specialization
        text bio
        string license_number UK
        boolean is_available
        datetime created_at
        datetime updated_at
    }
    
    PHARMACISTS {
        int id PK
        int user_id FK UK
        string specialization
        text bio
        string license_number UK
        boolean is_available
        datetime created_at
        datetime updated_at
    }
    
    DOCTOR_AVAILABILITY {
        int id PK
        int doctor_id FK
        enum day
        boolean is_open
        string start_time
        string end_time
        string break_start
        string break_end
        int appointment_duration
        int buffer_time
        int max_appointments_per_day
        datetime created_at
        datetime updated_at
    }
    
    DOCTOR_SETTINGS {
        int id PK
        int doctor_id FK UK
        boolean show_profile_to_patients
        boolean show_rating_reviews
        boolean allow_online_booking
        boolean show_availability
        boolean email_notifications
        boolean sms_notifications
        boolean appointment_reminders
        boolean new_appointment_requests
        boolean cancellation_alerts
        boolean weekly_summary
        datetime created_at
        datetime updated_at
    }

    USERS ||--|| NURSES : "has profile"
    USERS ||--|| RECEPTIONISTS : "has profile"
    USERS ||--|| LAB_TECHNICIANS : "has profile"
    USERS ||--|| PHARMACISTS : "has profile"
    DOCTORS ||--o{ DOCTOR_AVAILABILITY : "has schedule"
    DOCTORS ||--|| DOCTOR_SETTINGS : "has settings"
```

---

## Additional Support Tables

```mermaid
erDiagram
    ACTIVITY_LOGS {
        int id PK
        int user_id FK
        string action
        string device
        string location
        string ip_address
        datetime timestamp
        datetime created_at
    }
    
    WISHLISTS {
        int id PK
        int user_id FK
        int medication_id FK
        datetime created_at
        datetime updated_at
    }

    USERS ||--o{ ACTIVITY_LOGS : "performs"
    USERS ||--o{ WISHLISTS : "has"
    MEDICATIONS ||--o{ WISHLISTS : "in"
```

---

## Key Relationships Summary

### Primary Relationships:
1. **Users** is the central table with one-to-one relationships to profile tables
2. **Appointments** link patients to clinicians and generate payments/medical records
3. **Prescriptions** are created from appointments and contain medication details
4. **Payments** are tied to appointments and link patients to doctors
5. **Medical History** tracks all patient interactions through appointments

### Cardinality Patterns:
- **One-to-One**: User ↔ Profile tables (Medical Info, Emergency Contact, etc.)
- **One-to-Many**: User ↔ Appointments, User ↔ Medical History, Doctor ↔ Availability
- **Many-to-Many**: User ↔ Medication (through Wishlist)

### Foreign Key References:
- All profile tables reference `users.id`
- Appointment tables reference `users.id` for both patient and clinician
- Medical records reference both patient and doctor through `users.id`

---

## Data Types & Constraints

### Common Patterns:
- **Primary Keys**: Integer, auto-increment
- **Foreign Keys**: Integer, indexed
- **Timestamps**: DateTime with `func.now()` defaults
- **Enums**: For status fields (appointment_status, prescription_status, user_role)
- **JSON**: For complex data (allergies, conditions, medications, attachments)
- **Decimal**: For financial values (precision=10, scale=2)
- **Boolean**: For flags and settings
- **String**: Various lengths based on content

### Constraints:
- **Unique**: Email addresses, license numbers, transaction IDs, invoice numbers
- **Indexed**: Foreign keys, frequently queried fields
- **Nullable**: Optional fields marked as nullable
- **Defaults**: Sensible defaults for boolean flags and timestamps

---

## Import Notes for Microsoft Access

1. **Create tables in order**: Start with USERS, then dependent tables
2. **Handle Enums**: Convert to Text fields with validation rules
3. **JSON Fields**: Convert to Memo fields or separate related tables
4. **Relationships**: Set up referential integrity after all tables exist
5. **Indexes**: Create on foreign keys and frequently searched fields
6. **Data Types**: Map SQLAlchemy types to Access equivalents:
   - Integer → Number (Long Integer)
   - String → Text
   - Text → Memo
   - DateTime → Date/Time
   - Decimal → Number (Double)
   - Boolean → Yes/No
   - JSON → Memo (or parse into related tables)
