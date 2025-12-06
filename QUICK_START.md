# Quick Start Guide - Kiangombe Health Center

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- MySQL 5.7+
- Git

### Installation

#### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

#### 2. Environment Configuration
Create `.env` file in backend directory:
```env
DATABASE_URL=mysql+pymysql://root:root@localhost:3306/patient_center
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### 3. Initialize Database
```bash
# Reset database schema
python init_db.py

# Populate with seed data
python seed_data.py
```

#### 4. Start Backend Server
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`

---

### Frontend Setup

#### 1. Install Dependencies
```bash
cd health-center-app
npm install
```

#### 2. Environment Configuration
Create `.env` file in frontend directory:
```env
VITE_API_URL=http://localhost:8000
```

#### 3. Start Development Server
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## 📋 Key Features

### ✅ Implemented
- User authentication (Login/Register)
- Doctor management
- Appointment scheduling
- Prescription management
- Medication inventory
- Video consultation (ready for Agora SDK)
- Payment processing
- Cart and checkout
- Dashboard with statistics

### 🔄 In Progress
- Real video streaming (Agora SDK integration)
- Prescription PDF export
- Video recording

---

## 🔐 Test Credentials

### Admin Account
- **Email**: admin@kiangombe.com
- **Password**: Admin@123456

### Doctor Account
- **Email**: sarah@kiangombe.com
- **Password**: Doctor@123456

### Pharmacist Account
- **Email**: pharmacist@kiangombe.com
- **Password**: Pharma@123456

### Patient Account
- **Email**: patient@kiangombe.com
- **Password**: Patient@123456

---

## 📚 API Documentation

### Interactive Docs
Visit: `http://localhost:8000/docs`

### Key Endpoints

**Medications**
```
GET    /medications              - List all medications
POST   /medications              - Create medication (admin only)
GET    /medications/{id}         - Get single medication
PUT    /medications/{id}         - Update medication (admin only)
DELETE /medications/{id}         - Delete medication (admin only)
```

**Prescriptions**
```
GET    /prescriptions            - List prescriptions
POST   /prescriptions            - Create prescription (doctor only)
GET    /prescriptions/{id}       - Get single prescription
PATCH  /prescriptions/{id}       - Update prescription status
```

**Video Consultations**
```
POST   /video-consultations           - Initialize session
GET    /video-consultations/{id}      - Get session details
GET    /video-consultations/{id}/token - Get Agora token
PATCH  /video-consultations/{id}      - Update session
```

**Appointments**
```
GET    /appointments             - List appointments
POST   /appointments             - Create appointment (admin only)
GET    /appointments/{id}        - Get single appointment
```

**Doctors**
```
GET    /doctors                  - List all doctors
POST   /doctors                  - Create doctor (admin only)
GET    /doctors/{id}             - Get single doctor
```

---

## 💾 Database Schema

### Key Tables
- `users` - User accounts
- `doctors` - Doctor profiles
- `appointments` - Appointment records
- `prescriptions` - Prescription records
- `medications` - Medication inventory
- `video_consultations` - Video call sessions
- `payments` - Payment records

---

## 🎯 Common Tasks

### Add New Medication
```bash
# Via API
curl -X POST http://localhost:8000/medications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aspirin",
    "category": "Pain Relief",
    "dosage": "500mg",
    "price": 100.00,
    "stock": 200,
    "prescription_required": false
  }'
```

### Create Prescription
```bash
curl -X POST http://localhost:8000/prescriptions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": 1,
    "medications_json": "[...]",
    "status": "pending"
  }'
```

### Schedule Appointment
```bash
curl -X POST http://localhost:8000/appointments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 1,
    "clinician_id": 2,
    "scheduled_at": "2024-12-10T14:00:00",
    "cost": 2500.00
  }'
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd health-center-app
npm run test
```

---

## 📁 Project Structure

```
kiangombe/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Database models
│   ├── database.py          # Database configuration
│   ├── auth_router.py       # Authentication routes
│   ├── pydantic_models.py   # Request/response schemas
│   ├── init_db.py           # Database initialization
│   ├── seed_data.py         # Seed data script
│   └── requirements.txt     # Python dependencies
│
├── health-center-app/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom hooks
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx          # Main app component
│   ├── package.json         # Node dependencies
│   └── vite.config.ts       # Vite configuration
│
└── docs/
    ├── IMPLEMENTATION_GUIDE.md
    ├── BACKEND_ENDPOINTS_VERIFICATION.md
    └── MEDICATION_PRICING_FIX.md
```

---

## 🐛 Troubleshooting

### Backend won't start
1. Check MySQL is running
2. Verify `.env` file exists
3. Check port 8000 is not in use
4. Run `python init_db.py` to reset database

### Frontend won't load
1. Check backend is running
2. Verify `VITE_API_URL` in `.env`
3. Clear browser cache
4. Check console for errors

### Medications not showing prices
1. Run `python seed_data.py`
2. Restart backend server
3. Clear browser cache
4. Check `/medications` API endpoint

---

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review API docs at `/docs`
3. Check browser console for errors
4. Check backend logs for API errors

---

## 📝 Notes

- All prices are in KSH (Kenyan Shilling)
- Timestamps are in UTC
- Authentication uses JWT tokens
- CORS is enabled for all origins (update in production)

---

**Last Updated**: December 6, 2024
**Version**: 1.0.0
