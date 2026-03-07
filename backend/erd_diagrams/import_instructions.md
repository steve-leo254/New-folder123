# ERD Diagrams - Import Instructions for Microsoft Access

## 📁 Files Created

I've created comprehensive ERD diagrams for your Kiangombe Health Center database in multiple formats:

1. **`health_center_erd.md`** - Markdown with Mermaid diagrams (view in GitHub/VSCode)
2. **`access_sql_schema.sql`** - Microsoft Access compatible SQL schema
3. **`plantuml_erd.puml`** - PlantUML diagram (import into PlantUML tools)
4. **`import_instructions.md`** - This file with import instructions

---

## 🚀 Quick Import to Microsoft Access

### Method 1: Direct SQL Import (Recommended)

1. **Open Microsoft Access**
2. **Create new blank database** or open existing one
3. **Go to External Data > New Data Source > From Database > SQL Server**
4. **Choose "Import tables, queries, etc."**
5. **Select the SQL file**: Browse to `access_sql_schema.sql`
6. **Execute the script** - All tables will be created automatically

### Method 2: Manual SQL Execution

1. **Open Access Database**
2. **Create > Query Design** (close the Show Table dialog)
3. **Right-click > SQL View**
4. **Copy-paste the SQL content** from `access_sql_schema.sql`
5. **Run (F5)** to execute and create all tables

### Method 3: Step-by-Step Table Creation

If the above methods don't work, create tables manually in this order:

#### Core Tables (Create in this order):
1. `users` - Central user table
2. `doctors`, `nurses`, `receptionists`, `lab_technicians`, `pharmacists` - Staff profiles
3. `medications` - Pharmacy inventory
4. `appointments` - Patient appointments
5. `prescriptions` - Medical prescriptions
6. `payments` - Payment records
7. `medical_history` - Patient medical records

#### Support Tables:
8. `medical_info`, `emergency_contacts`, `insurance` - Patient profiles
9. `doctor_availability`, `doctor_settings` - Doctor management
10. `activity_logs`, `wishlists` - System support

---

## 🎯 Key Features of This Schema

### **Central User Management**
- **Users table** handles all user types (patients, doctors, staff)
- **Role-based access** with enum values
- **Profile tables** linked one-to-one to users

### **Appointment System**
- **Appointments** link patients to clinicians
- **Payment integration** with status tracking
- **Medical history generation** from appointments

### **Pharmacy Management**
- **Medications** table with inventory tracking
- **Prescriptions** with JSON medication details
- **Wishlist** for patient favorites

### **Payment & Billing**
- **Integrated payments** with M-Pesa support
- **Transaction tracking** with unique IDs
- **Multiple payment methods** support

### **Medical Records**
- **Comprehensive medical history**
- **Attachment support** via JSON
- **Doctor-patient relationships** tracked

---

## 🔧 Data Type Mapping (SQLAlchemy → Access)

| SQLAlchemy | Access | Notes |
|------------|--------|-------|
| Integer | Number (Long Integer) | Primary keys |
| String(n) | Text(n) | Fixed length text |
| Text | Memo | Long text fields |
| DateTime | Date/Time | Timestamps |
| Decimal(p,s) | Number (Double) | Financial values |
| Boolean | Yes/No | True/False flags |
| Enum | Text | With validation rules |
| JSON | Memo | Complex data |

---

## 📊 Relationship Setup in Access

After creating tables, set up relationships:

1. **Database Tools > Relationships**
2. **Add all tables** to the relationship window
3. **Create relationships** by dragging foreign keys to primary keys
4. **Enforce referential integrity** for key relationships
5. **Choose cascade options** where appropriate

### Critical Relationships:
- `users.id` → All profile tables (one-to-one)
- `appointments.patient_id` → `users.id` (many-to-one)
- `appointments.clinician_id` → `users.id` (many-to-one)
- `payments.appointment_id` → `appointments.id` (many-to-one)

---

## 🎨 Visual ERD Creation Tools

### Option 1: Use the PlantUML File
1. **Install PlantUML** or use online tool (plantuml.com/plantuml)
2. **Open `plantuml_erd.puml`**
3. **Generate PNG/SVG diagram**

### Option 2: Use Mermaid (GitHub/VSCode)
1. **Open `health_center_erd.md`** in GitHub or VSCode with Mermaid extension
2. **Diagrams render automatically**

### Option 3: Microsoft Access Relationships View
1. **Database Tools > Relationships**
2. **Arrange tables visually**
3. **Print or screenshot** the diagram

---

## 🚨 Important Notes

### **JSON Fields**
Access doesn't have native JSON support. These are stored as Memo fields:
- `medications_json` in prescriptions
- `allergies`, `conditions`, `medications` in medical_info
- `attachments` in medical_history

**Alternative**: Create separate related tables for JSON data if needed.

### **Enum Fields**
These are stored as Text with validation rules:
- `users.role`: Check constraint for valid roles
- `appointments.status`: scheduled, in_progress, completed, cancelled
- `prescriptions.status`: pending, approved, fulfilled

### **Auto-increment Primary Keys**
Access uses `COUNTER` instead of auto-increment integers.

### **Date/Time Defaults**
Access uses `NOW()` instead of `func.now()`.

---

## 📝 Sample Data for Testing

The SQL file includes sample data for:
- 3 users (doctor, patient, admin)
- 3 medications
- Basic relationships

**To add more test data:**
1. **Create INSERT statements** following the pattern
2. **Execute in Access SQL view**
3. **Test relationships** with sample appointments

---

## 🔍 Verification Checklist

After importing, verify:

- [ ] All tables created successfully
- [ ] Primary keys defined correctly
- [ ] Foreign key relationships established
- [ ] Indexes created on frequently queried fields
- [ ] Validation rules working for enum fields
- [ ] Sample data populates correctly
- [ ] Relationships view shows proper connections

---

## 🆘 Troubleshooting

### **Common Issues:**

1. **SQL Syntax Errors**
   - Access uses different SQL syntax
   - Replace `func.now()` with `NOW()`
   - Use `COUNTER` for auto-increment

2. **Relationship Errors**
   - Create tables before relationships
   - Check foreign key data types match
   - Ensure primary keys exist first

3. **Data Type Issues**
   - `Decimal` might need to be `Double`
   - `JSON` fields become `Memo`
   - `Enum` becomes `Text` with validation

4. **Reserved Words**
   - Some field names might be reserved (e.g., `date`)
   - Enclose in brackets: `[date]`

### **Solutions:**
- **Run SQL in small chunks** to isolate errors
- **Check Access documentation** for specific syntax
- **Use Access Query Designer** for complex queries
- **Verify table creation order** for dependencies

---

## 📞 Next Steps

1. **Import the schema** using your preferred method
2. **Set up relationships** in Access Relationships view
3. **Test with sample data**
4. **Create custom queries** for your specific needs
5. **Build forms and reports** based on the tables

The schema is designed to be comprehensive yet flexible, allowing for easy expansion and customization based on your specific health center requirements.

---

**🎉 Your Kiangombe Health Center database is ready to use!**
