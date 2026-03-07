-- =============================================
-- Kiangombe Health Center Database Schema
-- Microsoft Access Compatible SQL
-- =============================================

-- Create main tables in dependency order

-- 1. USERS Table (Central table)
CREATE TABLE users (
    id COUNTER PRIMARY KEY,
    full_name TEXT(120) NOT NULL,
    email TEXT(120) UNIQUE NOT NULL,
    password_hash TEXT(255) NOT NULL,
    phone TEXT(20),
    gender TEXT(20),
    date_of_birth DATETIME,
    address TEXT(255),
    profile_picture TEXT(255),
    is_verified YESNO DEFAULT FALSE,
    is_active YESNO DEFAULT TRUE,
    last_login DATETIME,
    role TEXT(20) NOT NULL DEFAULT 'patient',
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- 2. DOCTORS Table
CREATE TABLE doctors (
    id COUNTER PRIMARY KEY,
    user_id LONG UNIQUE REFERENCES users(id),
    specialization TEXT(120),
    bio MEMO,
    rating DOUBLE DEFAULT 0.0,
    license_number TEXT(50) UNIQUE,
    is_available YESNO DEFAULT TRUE,
    consultation_fee DOUBLE,
    video_consultation_fee DOUBLE,
    phone_consultation_fee DOUBLE,
    chat_consultation_fee DOUBLE,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- 3. NURSES Table
CREATE TABLE nurses (
    id COUNTER PRIMARY KEY,
    user_id LONG UNIQUE REFERENCES users(id),
    specialization TEXT(120),
    bio MEMO,
    license_number TEXT(50) UNIQUE,
    is_available YESNO DEFAULT TRUE,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- 4. RECEPTIONISTS Table
CREATE TABLE receptionists (
    id COUNTER PRIMARY KEY,
    user_id LONG UNIQUE REFERENCES users(id),
    bio MEMO,
    is_available YESNO DEFAULT TRUE,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- 5. LAB_TECHNICIANS Table
CREATE TABLE lab_technicians (
    id COUNTER PRIMARY KEY,
    user_id LONG UNIQUE REFERENCES users(id),
    specialization TEXT(120),
    bio MEMO,
    license_number TEXT(50) UNIQUE,
    is_available YESNO DEFAULT TRUE,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- 6. PHARMACISTS Table
CREATE TABLE pharmacists (
    id COUNTER PRIMARY KEY,
    user_id LONG UNIQUE REFERENCES users(id),
    specialization TEXT(120),
    bio MEMO,
    license_number TEXT(50) UNIQUE,
    is_available YESNO DEFAULT TRUE,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- 7. MEDICATIONS Table
CREATE TABLE medications (
    id COUNTER PRIMARY KEY,
    name TEXT(150) NOT NULL,
    category TEXT(100) NOT NULL,
    dosage TEXT(100),
    price DOUBLE NOT NULL,
    stock LONG DEFAULT 0,
    description MEMO,
    prescription_required YESNO DEFAULT FALSE,
    expiry_date DATETIME,
    batch_number TEXT(50),
    supplier TEXT(150),
    image_url TEXT(500),
    in_stock YESNO DEFAULT TRUE,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- 8. APPOINTMENTS Table
CREATE TABLE appointments (
    id COUNTER PRIMARY KEY,
    patient_id LONG NOT NULL REFERENCES users(id),
    clinician_id LONG NOT NULL REFERENCES users(id),
    visit_type TEXT(80),
    specialization TEXT(80),
    scheduled_at DATETIME NOT NULL,
    status TEXT(20) DEFAULT 'scheduled',
    triage_notes MEMO,
    cost DOUBLE DEFAULT 0.0,
    cancellation_reason MEMO,
    payment_status TEXT(20) DEFAULT 'unpaid',
    payment_method TEXT(50),
    payment_amount DOUBLE DEFAULT 0.0,
    transaction_id TEXT(100) UNIQUE,
    payment_date DATETIME,
    invoice_number TEXT(50) UNIQUE,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- 9. PRESCRIPTIONS Table
CREATE TABLE prescriptions (
    id COUNTER PRIMARY KEY,
    appointment_id LONG UNIQUE REFERENCES appointments(id),
    patient_id LONG REFERENCES users(id),
    issued_by_doctor_id LONG REFERENCES users(id),
    pharmacy_name TEXT(120),
    medications_json MEMO,
    status TEXT(20) DEFAULT 'pending',
    qr_code_path TEXT(255),
    issued_date DATETIME DEFAULT NOW(),
    expiry_date DATETIME,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- 10. PAYMENTS Table
CREATE TABLE payments (
    id COUNTER PRIMARY KEY,
    patient_id LONG NOT NULL REFERENCES users(id),
    doctor_id LONG NOT NULL REFERENCES users(id),
    appointment_id LONG NOT NULL REFERENCES appointments(id),
    transaction_id TEXT(100) UNIQUE NOT NULL,
    amount DOUBLE NOT NULL,
    payment_method TEXT(50) DEFAULT 'mpesa',
    payment_status TEXT(20) DEFAULT 'pending',
    phone_number TEXT(20),
    mpesa_receipt_number TEXT(100),
    payment_date DATETIME,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- 11. MEDICAL_HISTORY Table
CREATE TABLE medical_history (
    id COUNTER PRIMARY KEY,
    patient_id LONG NOT NULL REFERENCES users(id),
    appointment_id LONG REFERENCES appointments(id),
    type TEXT(50) NOT NULL,
    title TEXT(200) NOT NULL,
    description MEMO NOT NULL,
    diagnosis MEMO,
    symptoms MEMO,
    treatment_plan MEMO,
    doctor_id LONG NOT NULL REFERENCES users(id),
    doctor_name TEXT(120) NOT NULL,
    notes MEMO,
    attachments MEMO,
    [date] DATETIME DEFAULT NOW(),
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- 12. Patient Profile Tables

-- MEDICAL_INFO
CREATE TABLE medical_info (
    id COUNTER PRIMARY KEY,
    patient_id LONG UNIQUE NOT NULL REFERENCES users(id),
    blood_type TEXT(10),
    height TEXT(20),
    weight TEXT(20),
    allergies MEMO,
    conditions MEMO,
    medications MEMO,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- EMERGENCY_CONTACTS
CREATE TABLE emergency_contacts (
    id COUNTER PRIMARY KEY,
    patient_id LONG UNIQUE NOT NULL REFERENCES users(id),
    name TEXT(120) NOT NULL,
    phone TEXT(20) NOT NULL,
    relation TEXT(50) NOT NULL,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- INSURANCE
CREATE TABLE insurance (
    id COUNTER PRIMARY KEY,
    patient_id LONG UNIQUE NOT NULL REFERENCES users(id),
    provider TEXT(120) NOT NULL,
    policy_number TEXT(100) NOT NULL,
    group_number TEXT(100),
    holder_name TEXT(120) NOT NULL,
    insurance_type TEXT(50) DEFAULT 'standard',
    quarterly_limit DOUBLE,
    quarterly_used DOUBLE DEFAULT 0,
    coverage_start_date DATETIME,
    coverage_end_date DATETIME,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- NOTIFICATION_SETTINGS
CREATE TABLE notification_settings (
    id COUNTER PRIMARY KEY,
    patient_id LONG UNIQUE NOT NULL REFERENCES users(id),
    email_notifications YESNO DEFAULT TRUE,
    sms_notifications YESNO DEFAULT TRUE,
    appointment_reminders YESNO DEFAULT TRUE,
    lab_results_notifications YESNO DEFAULT TRUE,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- SECURITY_SETTINGS
CREATE TABLE security_settings (
    id COUNTER PRIMARY KEY,
    patient_id LONG UNIQUE NOT NULL REFERENCES users(id),
    two_factor_enabled YESNO DEFAULT FALSE,
    login_alerts YESNO DEFAULT TRUE,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- 13. Staff Management Tables

-- DOCTOR_AVAILABILITY
CREATE TABLE doctor_availability (
    id COUNTER PRIMARY KEY,
    doctor_id LONG NOT NULL REFERENCES doctors(id),
    day TEXT(10) NOT NULL,
    is_open YESNO DEFAULT TRUE,
    start_time TEXT(5),
    end_time TEXT(5),
    break_start TEXT(5),
    break_end TEXT(5),
    appointment_duration LONG DEFAULT 30,
    buffer_time LONG DEFAULT 10,
    max_appointments_per_day LONG DEFAULT 20,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- DOCTOR_SETTINGS
CREATE TABLE doctor_settings (
    id COUNTER PRIMARY KEY,
    doctor_id LONG UNIQUE NOT NULL REFERENCES doctors(id),
    show_profile_to_patients YESNO DEFAULT TRUE,
    show_rating_reviews YESNO DEFAULT TRUE,
    allow_online_booking YESNO DEFAULT TRUE,
    show_availability YESNO DEFAULT TRUE,
    email_notifications YESNO DEFAULT TRUE,
    sms_notifications YESNO DEFAULT TRUE,
    appointment_reminders YESNO DEFAULT TRUE,
    new_appointment_requests YESNO DEFAULT TRUE,
    cancellation_alerts YESNO DEFAULT TRUE,
    weekly_summary YESNO DEFAULT FALSE,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- 14. Support Tables

-- ACTIVITY_LOGS
CREATE TABLE activity_logs (
    id COUNTER PRIMARY KEY,
    user_id LONG NOT NULL REFERENCES users(id),
    action TEXT(200) NOT NULL,
    device TEXT(200),
    location TEXT(200),
    ip_address TEXT(45),
    timestamp DATETIME DEFAULT NOW(),
    created_at DATETIME DEFAULT NOW()
);

-- WISHLISTS
CREATE TABLE wishlists (
    id COUNTER PRIMARY KEY,
    user_id LONG NOT NULL REFERENCES users(id),
    medication_id LONG NOT NULL REFERENCES medications(id),
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);

-- =============================================
-- Create Indexes for Performance
-- =============================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Appointments table indexes
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_clinician ON appointments(clinician_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_payment_status ON appointments(payment_status);

-- Medical history indexes
CREATE INDEX idx_medical_history_patient ON medical_history(patient_id);
CREATE INDEX idx_medical_history_doctor ON medical_history(doctor_id);
CREATE INDEX idx_medical_history_date ON medical_history([date]);

-- Payments table indexes
CREATE INDEX idx_payments_patient ON payments(patient_id);
CREATE INDEX idx_payments_doctor ON payments(doctor_id);
CREATE INDEX idx_payments_appointment ON payments(appointment_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(payment_status);

-- Medications table indexes
CREATE INDEX idx_medications_name ON medications(name);
CREATE INDEX idx_medications_category ON medications(category);
CREATE INDEX idx_medications_stock ON medications(stock);

-- =============================================
-- Create Validation Rules (Access-specific)
-- =============================================

-- Users table validation rules
ALTER TABLE users ADD CONSTRAINT chk_role CHECK (role IN ('super_admin', 'clinician_admin', 'doctor', 'nurse', 'receptionist', 'lab_technician', 'pharmacist', 'patient'));

-- Appointments table validation rules
ALTER TABLE appointments ADD CONSTRAINT chk_appointment_status CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'));
ALTER TABLE appointments ADD CONSTRAINT chk_payment_status CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'pending', 'cancelled'));
ALTER TABLE appointments ADD CONSTRAINT chk_payment_method CHECK (payment_method IN ('mpesa', 'card', 'cash', 'insurance') OR payment_method IS NULL);

-- Prescriptions table validation rules
ALTER TABLE prescriptions ADD CONSTRAINT chk_prescription_status CHECK (status IN ('pending', 'approved', 'fulfilled'));

-- Medical history table validation rules
ALTER TABLE medical_history ADD CONSTRAINT chk_history_type CHECK (type IN ('consultation', 'diagnosis', 'prescription', 'lab_result', 'vaccination'));

-- Doctor availability table validation rules
ALTER TABLE doctor_availability ADD CONSTRAINT chk_day CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'));

-- =============================================
-- Sample Data for Testing (Optional)
-- =============================================

-- Sample Users
INSERT INTO users (full_name, email, password_hash, phone, role) VALUES 
('Dr. John Smith', 'john.smith@healthcenter.com', 'hashed_password_1', '+254712345678', 'doctor'),
('Jane Doe', 'jane.doe@email.com', 'hashed_password_2', '+254712345679', 'patient'),
('Admin User', 'admin@healthcenter.com', 'hashed_password_3', '+254712345680', 'super_admin');

-- Sample Medications
INSERT INTO medications (name, category, price, stock, description) VALUES
('Amoxicillin 500mg', 'Antibiotics', 150.00, 100, 'Broad-spectrum antibiotic'),
('Paracetamol 500mg', 'Pain Relief', 50.00, 200, 'Pain and fever relief'),
('Vitamin C 500mg', 'Vitamins', 80.00, 150, 'Vitamin C supplement');

-- =============================================
-- Views for Common Queries (Access-specific)
-- =============================================

-- Patient Appointments View
CREATE VIEW patient_appointments AS
SELECT 
    a.id,
    a.scheduled_at,
    a.status,
    a.payment_status,
    u.full_name AS patient_name,
    u.phone AS patient_phone,
    d.full_name AS doctor_name,
    d.specialization,
    a.cost,
    a.invoice_number
FROM appointments a
JOIN users u ON a.patient_id = u.id
JOIN users d ON a.clinician_id = d.id;

-- Doctor Schedule View
CREATE VIEW doctor_schedule AS
SELECT 
    u.full_name AS doctor_name,
    d.specialization,
    da.day,
    da.start_time,
    da.end_time,
    da.is_open,
    da.appointment_duration
FROM doctor_availability da
JOIN doctors d ON da.doctor_id = d.id
JOIN users u ON d.user_id = u.id
WHERE da.is_open = TRUE
ORDER BY da.day, da.start_time;

-- Payment Summary View
CREATE VIEW payment_summary AS
SELECT 
    p.transaction_id,
    p.amount,
    p.payment_status,
    p.payment_method,
    p.payment_date,
    patient.full_name AS patient_name,
    doctor.full_name AS doctor_name,
    a.invoice_number
FROM payments p
JOIN users patient ON p.patient_id = patient.id
JOIN users doctor ON p.doctor_id = doctor.id
JOIN appointments a ON p.appointment_id = a.id;

-- =============================================
-- End of Schema
-- =============================================
