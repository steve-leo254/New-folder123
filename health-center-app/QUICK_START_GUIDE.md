# Kiangombe Health Center - Quick Start Guide

## Project Overview
This is a comprehensive health center management system with role-based access for Super Admin, Admin, Doctor, Nurse, Pharmacist, and Patient roles.

## Getting Started

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## Key Features Implemented

### 1. SuperAdminDashboard
**Location**: `src/pages/SuperAdminDashboard.tsx`

**Tabs Available**:
- **Overview**: KPI cards, revenue charts, department distribution, user activity
- **Users**: Staff member management, role-based user display
- **Appointments**: Appointment booking and management
- **Medications**: Medication inventory tracking
- **Billing**: Revenue and payment tracking
- **System**: System health and administration

### 2. Staff Members Management
**Display**: Table view with columns:
- Name (with avatar)
- Role
- Specialization
- Status (Active/On Leave/Inactive)
- Rating (star display)
- Patients (count)

**Features**:
- Search functionality
- Filter by role and status
- View detailed profiles

### 3. Appointment Booking
**How to Use**:
1. Click "Book Appointment" button in Appointments tab
2. Select a doctor (defaults to first available)
3. Choose appointment date (today or future)
4. Select time
5. Choose appointment type (Video/In-Person)
6. Add optional notes
7. Click "Book Appointment"

**Data Sent to Backend**:
```json
{
  "patient_id": "1",
  "doctor_id": "doctor_id",
  "date": "2024-01-20",
  "time": "14:30",
  "type": "video",
  "notes": "Optional notes"
}
```

### 4. Medication Management
**Features**:
- View total medications
- Track low stock items
- Monitor expiring medications
- View sales and revenue metrics
- Table with medication details

### 5. Billing & Revenue
**Features**:
- Total revenue display
- Pending payments tracking
- Overdue payments alerts
- Recent transactions table
- Payment status tracking

## API Endpoints Required

### Appointments
```
GET    /appointments              - List all appointments
POST   /appointments              - Create appointment
PUT    /appointments/:id          - Update appointment
PUT    /appointments/:id/cancel   - Cancel appointment
```

### Medications
```
GET    /medications               - List medications
POST   /medications               - Add medication
PUT    /medications/:id           - Update medication
```

### Billing
```
GET    /billing                   - List billing records
```

### Doctors (Existing)
```
GET    /doctors                   - List all doctors
GET    /doctors/:id               - Get doctor details
POST   /doctors                   - Create doctor
PUT    /doctors/:id               - Update doctor
DELETE /doctors/:id               - Delete doctor
```

## Environment Variables

Create a `.env` file:
```
VITE_API_URL=http://localhost:8000
```

## Component Structure

### Modals
- `AddUserModal` - Create patient users
- `AddStaffModal` - Create staff members
- `BookAppointmentModal` - Book appointments

### Features
- `StaffMembers` - Display staff in table/card view

### UI Components
- `Card` - Container component
- `Button` - Action button
- `Badge` - Status/label badge
- `LoadingSpinner` - Loading indicator
- `Alert` - Toast notifications

## State Management

### Custom Hooks
```typescript
// Appointments
const { appointments, isLoading, fetchAppointments, createAppointment } = useAppointments();

// Medications
const { medications, isLoading, fetchMedications } = useMedications();

// Billing
const { billings, stats, fetchBillings, calculateStats } = useBilling();

// Doctors
const { doctors, isLoading, fetchDoctors } = useDoctors();

// Dashboard Summary
const { summary, loading, refreshSummary } = useDashboardSummary();
```

## Error Handling

All API errors are caught and displayed as toast notifications:
```typescript
setToast({ 
  type: 'error', 
  message: error.response?.data?.detail || 'Operation failed' 
});
```

## Data Flow

1. Component mounts → `useEffect` triggers data fetch
2. Custom hook calls API service
3. API service makes HTTP request with auth token
4. Response is normalized and stored in state
5. Component re-renders with new data
6. User interactions trigger mutations
7. Success/error toast displayed
8. Data refreshed automatically

## Authentication

- Auth token stored in `localStorage` as `authToken` or `token`
- Automatically included in all API requests via axios interceptor
- 401 responses redirect to login page

## Styling

- **Framework**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Charts**: Recharts

## Common Tasks

### Add New Appointment
```typescript
const { createAppointment } = useAppointments();

await createAppointment({
  patient_id: 1,
  doctor_id: 5,
  date: '2024-01-20',
  time: '14:30',
  type: 'video'
});
```

### Fetch Medications
```typescript
const { medications, fetchMedications } = useMedications();

useEffect(() => {
  fetchMedications();
}, []);
```

### Display Billing Stats
```typescript
const { billings, calculateStats } = useBilling();

const stats = calculateStats(billings);
// stats.totalRevenue, stats.totalPaid, etc.
```

## Troubleshooting

### Appointments not loading
- Check API endpoint `/appointments` is implemented
- Verify auth token is valid
- Check browser console for errors

### Modal not opening
- Ensure state variables `isBookAppointmentOpen` and `setIsBookAppointmentOpen` are properly initialized
- Check modal component props are passed correctly

### Data not persisting
- Verify backend is saving to database
- Check API response includes all required fields
- Ensure data normalization functions handle response format

## Performance Tips

1. Use `useMemo` for expensive computations
2. Limit table displays to 10 recent records
3. Implement pagination for large datasets
4. Debounce search/filter operations
5. Cache API responses where appropriate

## Next Steps

1. Implement backend endpoints
2. Add payment gateway integration
3. Set up email notifications
4. Add role-based access control
5. Implement audit logging
6. Add data export functionality
7. Set up automated backups

## Support

For issues or questions:
1. Check browser console for errors
2. Verify API endpoints are implemented
3. Check network tab for failed requests
4. Review component props and state
5. Test with sample data first
