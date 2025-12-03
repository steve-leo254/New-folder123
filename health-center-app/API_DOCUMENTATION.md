# Kiangombe Health API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except login/register) require Bearer token authentication:
```
Authorization: Bearer <token>
```

## Endpoints

### Doctors

#### GET /doctors
Get all doctors
```javascript
Response: {
  "id": "string",
  "firstName": "string",
  "lastName": "string", 
  "specialization": "string",
  "experience": "number",
  "rating": "number",
  "avatar": "string",
  "bio": "string",
  "availability": [],
  "consultationFee": "number"
}
```

#### GET /doctors/:id
Get doctor by ID

#### GET /doctors?specialization=:specialization
Get doctors by specialization

#### GET /doctors/search?q=:query
Search doctors by name or specialization

#### POST /doctors
Create new doctor (admin only)

#### PUT /doctors/:id
Update doctor information

#### DELETE /doctors/:id
Delete doctor (admin only)

### Appointments

#### GET /appointments
Get current user's appointments

#### GET /appointments/upcoming
Get upcoming appointments for current user

#### GET /appointments/past
Get past appointments for current user

#### GET /appointments/doctor/:doctorId
Get appointments for specific doctor

#### POST /appointments
Create new appointment
```javascript
Request: {
  "patientId": "string",
  "doctorId": "string",
  "date": "string",
  "time": "string",
  "type": "in-person|video",
  "notes": "string (optional)"
}
```

#### PUT /appointments/:id
Update appointment

#### PUT /appointments/:id/cancel
Cancel appointment

#### PUT /appointments/:id/complete
Mark appointment as completed

### Auth (already exists)
#### POST /auth/login
#### POST /auth/register
#### GET /auth/profile

## Database Schema Example

### Doctors Collection
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  specialization: String,
  experience: Number,
  rating: Number,
  avatar: String,
  bio: String,
  availability: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  consultationFee: Number,
  userId: ObjectId (reference to Users collection),
  createdAt: Date,
  updatedAt: Date
}
```

### Appointments Collection
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (reference to Users),
  doctorId: ObjectId (reference to Doctors/Users),
  date: Date,
  time: String,
  status: 'scheduled|completed|cancelled',
  type: 'in-person|video',
  notes: String,
  paymentStatus: 'pending|paid|refunded',
  createdAt: Date,
  updatedAt: Date
}
```

## Error Responses
```javascript
{
  "error": "Error message",
  "status": "error_code"
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error
