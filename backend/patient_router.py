"""
Patient API endpoints
Handles patient-specific operations including:
- Wishlist management
- Patient profile
- Patient appointments
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import logging
from datetime import datetime

from database import get_db
from models import User, Insurance, EmergencyContact, MedicalHistory, MedicalInfo, Wishlist, Medication
from auth_router import get_current_active_user
from pydantic_models import InsuranceRequest, EmergencyContactRequest
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/patient", tags=["patient"])

logger.info("Patient router initialized with wishlist endpoints")

# Pydantic Models
class WishlistItemCreate(BaseModel):
    medication_id: str | int
    medication: Optional[Dict[str, Any]] = None  # Add medication data from frontend

class WishlistItemResponse(BaseModel):
    id: int
    patient_id: int
    medication_id: str | int
    medication_name: str
    dosage: str
    price: float
    category: str
    image_url: str
    in_stock: bool
    requires_prescription: bool
    rating: float
    reviews: int
    added_date: str
    availability: str
    stock_count: int

# Medical Info Models
class MedicalInfoRequest(BaseModel):
    blood_type: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    allergies: Optional[List[str]] = []
    conditions: Optional[List[str]] = []
    medications: Optional[List[str]] = []

class MedicalInfoResponse(BaseModel):
    id: int
    patient_id: int
    blood_type: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    allergies: List[str] = []
    conditions: List[str] = []
    medications: List[str] = []
    created_at: str
    updated_at: str

# Notification Settings endpoints
class NotificationSettingsRequest(BaseModel):
    email_notifications: Optional[bool] = True
    sms_notifications: Optional[bool] = True
    appointment_reminders: Optional[bool] = True
    lab_results_notifications: Optional[bool] = True

class NotificationSettingsResponse(BaseModel):
    id: int
    patient_id: int
    email_notifications: bool
    sms_notifications: bool
    appointment_reminders: bool
    lab_results_notifications: bool
    created_at: str
    updated_at: str

# Security Models
class SecuritySettingsRequest(BaseModel):
    two_factor_enabled: Optional[bool] = False
    login_alerts: Optional[bool] = True
    session_timeout: Optional[int] = 3600

class SecuritySettingsResponse(BaseModel):
    id: int
    patient_id: int
    two_factor_enabled: bool
    login_alerts: bool
    session_timeout: int
    created_at: str
    updated_at: str

# Activity Log Models
class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    device: Optional[str] = None
    location: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: str

# In-memory storage for wishlist items (for demo purposes)
# In production, this would be stored in the database
wishlist_storage: Dict[int, List[Dict]] = {}

# Mock medication data
MOCK_MEDICATIONS = {
    1: {
        "name": "Amoxicillin",
        "dosage": "500mg",
        "price": 15.99,
        "category": "antibiotics",
        "image_url": "/api/placeholder/100/100",
        "in_stock": True,
        "requires_prescription": True,
        "rating": 4.5,
        "reviews": 128,
        "availability": "in-stock",
        "stock_count": 50
    },
    2: {
        "name": "Ibuprofen",
        "dosage": "200mg",
        "price": 8.99,
        "category": "pain-relief",
        "image_url": "/api/placeholder/100/100",
        "in_stock": True,
        "requires_prescription": False,
        "rating": 4.3,
        "reviews": 256,
        "availability": "in-stock",
        "stock_count": 100
    },
    3: {
        "name": "Lisinopril",
        "dosage": "10mg",
        "price": 25.99,
        "category": "blood-pressure",
        "image_url": "/api/placeholder/100/100",
        "in_stock": False,
        "requires_prescription": True,
        "rating": 4.7,
        "reviews": 89,
        "availability": "out-of-stock",
        "stock_count": 0
    }
}

@router.get("/wishlist")
async def get_wishlist(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get patient's wishlist items"""
    try:
        # Query wishlist items for this patient from database
        wishlist_items = db.query(Wishlist).filter(
            Wishlist.user_id == current_user.id
        ).all()
        
        # Transform to response format
        wishlist_response = []
        for item in wishlist_items:
            if item.medication:
                wishlist_response.append({
                    "id": item.id,
                    "patient_id": current_user.id,
                    "medication_id": item.medication_id,
                    "medication_name": item.medication.name,
                    "dosage": item.medication.dosage or "As directed",
                    "price": float(item.medication.price),
                    "category": item.medication.category,
                    "image_url": item.medication.image_url or "",
                    "in_stock": item.medication.in_stock,
                    "requires_prescription": item.medication.prescription_required,
                    "rating": 4.5,  # Default rating - can be added to medication model
                    "reviews": 100,  # Default reviews - can be added to medication model
                    "added_date": item.created_at.isoformat(),
                    "availability": "in-stock" if item.medication.in_stock else "out-of-stock",
                    "stock_count": item.medication.stock
                })
        
        return wishlist_response
        
    except Exception as e:
        logger.error(f"Error fetching wishlist: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch wishlist"
        )

@router.post("/wishlist")
async def add_to_wishlist(
    request: WishlistItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add item to patient's wishlist"""
    try:
        logger.info(f"POST /api/patient/wishlist called by user {current_user.id}")
        logger.info(f"Request payload: {request}")
        
        medication_id = int(request.medication_id)
        
        # Check if medication exists
        medication = db.query(Medication).filter(
            Medication.id == medication_id
        ).first()
        
        if not medication:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medication not found"
            )
        
        # Check if item already exists in wishlist
        existing_item = db.query(Wishlist).filter(
            Wishlist.user_id == current_user.id,
            Wishlist.medication_id == medication_id
        ).first()
        
        if existing_item:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Item already in wishlist"
            )
        
        # Create new wishlist item
        wishlist_item = Wishlist(
            user_id=current_user.id,
            medication_id=medication_id
        )
        
        db.add(wishlist_item)
        db.commit()
        db.refresh(wishlist_item)
        
        # Return response
        return {
            "id": wishlist_item.id,
            "patient_id": current_user.id,
            "medication_id": medication_id,
            "medication_name": medication.name,
            "dosage": medication.dosage or "As directed",
            "price": float(medication.price),
            "category": medication.category,
            "image_url": medication.image_url or "",
            "in_stock": medication.in_stock,
            "requires_prescription": medication.prescription_required,
            "rating": 4.5,  # Default rating
            "reviews": 100,  # Default reviews
            "added_date": wishlist_item.created_at.isoformat(),
            "availability": "in-stock" if medication.in_stock else "out-of-stock",
            "stock_count": medication.stock
        }
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Error adding to wishlist: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add item to wishlist"
        )
        if item["medication_id"] == medication_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Item already in wishlist"
            )
    
    # Add to wishlist
    from datetime import datetime
    new_item = {
        "id": len(wishlist_storage[patient_id]) + 1,
        "medication_id": medication_id,
        "added_date": datetime.now().isoformat()
    }
    wishlist_storage[patient_id].append(new_item)
    
    # Return the created item
    return {
        "id": new_item["id"],
        "patient_id": patient_id,
        "medication_id": medication_id,
        "medication_name": medication_info["name"],
        "dosage": medication_info["dosage"],
        "price": medication_info["price"],
        "category": medication_info["category"],
        "image_url": medication_info["image_url"],
        "in_stock": medication_info["in_stock"],
        "requires_prescription": medication_info["requires_prescription"],
        "rating": medication_info["rating"],
        "reviews": medication_info["reviews"],
        "added_date": new_item["added_date"],
        "availability": medication_info["availability"],
        "stock_count": medication_info["stock_count"]
    }

@router.delete("/wishlist/{wishlist_item_id}")
async def remove_from_wishlist(
    wishlist_item_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Remove item from patient's wishlist"""
    try:
        # Find the wishlist item
        wishlist_item = db.query(Wishlist).filter(
            Wishlist.id == wishlist_item_id,
            Wishlist.user_id == current_user.id
        ).first()
        
        if not wishlist_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wishlist item not found"
            )
        
        # Delete the item
        db.delete(wishlist_item)
        db.commit()
        
        return {"message": "Item removed from wishlist successfully"}
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Error removing from wishlist: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove item from wishlist"
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist item not found"
        )
    
    return {"message": "Item removed from wishlist"}

@router.delete("/wishlist")
async def clear_wishlist(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Clear patient's entire wishlist"""
    try:
        # Delete all wishlist items for this user
        db.query(Wishlist).filter(
            Wishlist.user_id == current_user.id
        ).delete()
        
        db.commit()
        
        return {"message": "Wishlist cleared successfully"}
        
    except Exception as e:
        logger.error(f"Error clearing wishlist: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear wishlist"
        )

# In-memory storage for patient data (for demo purposes)
# In production, this would be stored in the database
medical_info_storage: Dict[int, Dict] = {}
emergency_contact_storage: Dict[int, Dict] = {}
insurance_storage: Dict[int, Dict] = {}
notification_settings_storage: Dict[int, Dict] = {}
security_settings_storage: Dict[int, Dict] = {}
activity_logs_storage: Dict[int, List[Dict]] = {}

# Medical Info endpoints
@router.get("/medical-info")
async def get_medical_info(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get patient's medical information"""
    patient_id = current_user.id
    
    # Get medical info for this patient
    medical_info = medical_info_storage.get(patient_id, {
        "id": patient_id,
        "patient_id": patient_id,
        "blood_type": None,
        "height": None,
        "weight": None,
        "allergies": [],
        "conditions": [],
        "medications": [],
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    })
    
    return medical_info

@router.put("/medical-info")
async def update_medical_info(
    request: MedicalInfoRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update patient's medical information"""
    patient_id = current_user.id
    
    from datetime import datetime
    medical_info = {
        "id": patient_id,
        "patient_id": patient_id,
        "blood_type": request.blood_type,
        "height": request.height,
        "weight": request.weight,
        "allergies": request.allergies or [],
        "conditions": request.conditions or [],
        "medications": request.medications or [],
        "created_at": "2024-01-01T00:00:00",
        "updated_at": datetime.now().isoformat()
    }
    
    medical_info_storage[patient_id] = medical_info
    
    return medical_info

# Emergency Contact endpoints
@router.get("/emergency-contact")
async def get_emergency_contact(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get patient's emergency contact"""
    patient_id = current_user.id
    
    # Get emergency contact from database
    emergency_contact = db.query(EmergencyContact).filter(EmergencyContact.patient_id == patient_id).first()
    
    if not emergency_contact:
        # Return empty emergency contact if none exists
        return {
            "id": 0,
            "patient_id": patient_id,
            "name": "",
            "phone": "",
            "relation": "",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    
    return emergency_contact

@router.put("/emergency-contact")
async def update_emergency_contact(
    request: EmergencyContactRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update patient's emergency contact"""
    patient_id = current_user.id
    
    # Get existing emergency contact or create new
    emergency_contact = db.query(EmergencyContact).filter(EmergencyContact.patient_id == patient_id).first()
    
    if not emergency_contact:
        # Create new emergency contact record
        emergency_contact = EmergencyContact(
            patient_id=patient_id,
            name=request.name,
            phone=request.phone,
            relation=request.relation
        )
        db.add(emergency_contact)
    else:
        # Update existing emergency contact
        emergency_contact.name = request.name
        emergency_contact.phone = request.phone
        emergency_contact.relation = request.relation
        emergency_contact.updated_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(emergency_contact)
        return emergency_contact
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

# Insurance endpoints
@router.get("/insurance")
async def get_insurance(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get patient's insurance information"""
    patient_id = current_user.id
    
    # Get insurance from database
    insurance = db.query(Insurance).filter(Insurance.patient_id == patient_id).first()
    
    if not insurance:
        # Return empty insurance if none exists
        return {
            "id": 0,
            "patient_id": patient_id,
            "provider": "",
            "policy_number": "",
            "group_number": None,
            "holder_name": "",
            "insurance_type": "standard",
            "quarterly_limit": None,
            "quarterly_used": None,
            "coverage_start_date": None,
            "coverage_end_date": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    
    return insurance

@router.put("/insurance")
async def update_insurance(
    request: InsuranceRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update patient's insurance information"""
    patient_id = current_user.id
    
    # Validate insurance type
    valid_types = ['standard', 'sha', 'SHA', 'Standard', 'STANDARD']
    if request.insurance_type and request.insurance_type not in valid_types:
        raise HTTPException(status_code=400, detail="Invalid insurance type. Must be 'standard' or 'sha'")
    
    # Normalize insurance type
    normalized_type = 'sha' if request.insurance_type and request.insurance_type.lower() == 'sha' else 'standard'
    
    # Get existing insurance or create new
    insurance = db.query(Insurance).filter(Insurance.patient_id == patient_id).first()
    
    if not insurance:
        # Only create if we have the minimum required fields
        if not request.provider or not request.policy_number or not request.holder_name:
            raise HTTPException(status_code=400, detail="Provider, policy number, and holder name are required for new insurance")
            
        # Create new insurance record
        insurance = Insurance(
            patient_id=patient_id,
            provider=request.provider,
            policy_number=request.policy_number,
            group_number=request.group_number,
            holder_name=request.holder_name,
            insurance_type=normalized_type,
            quarterly_limit=request.quarterly_limit,
            quarterly_used=request.quarterly_used,
            coverage_start_date=request.coverage_start_date,
            coverage_end_date=request.coverage_end_date
        )
        db.add(insurance)
    else:
        # Update only provided fields
        if request.provider is not None:
            insurance.provider = request.provider
        if request.policy_number is not None:
            insurance.policy_number = request.policy_number
        if request.group_number is not None:
            insurance.group_number = request.group_number
        if request.holder_name is not None:
            insurance.holder_name = request.holder_name
        if request.insurance_type is not None:
            insurance.insurance_type = normalized_type
        if request.quarterly_limit is not None:
            insurance.quarterly_limit = request.quarterly_limit
        if request.quarterly_used is not None:
            insurance.quarterly_used = request.quarterly_used
        if request.coverage_start_date is not None:
            insurance.coverage_start_date = request.coverage_start_date
        if request.coverage_end_date is not None:
            insurance.coverage_end_date = request.coverage_end_date
        insurance.updated_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(insurance)
        return insurance
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# Notification Settings endpoints
@router.get("/notifications")
async def get_notifications(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get patient's notification settings"""
    patient_id = current_user.id
    
    # Get notification settings for this patient
    notifications = notification_settings_storage.get(patient_id, {
        "id": patient_id,
        "patient_id": patient_id,
        "email_notifications": True,
        "sms_notifications": True,
        "appointment_reminders": True,
        "lab_results_notifications": True,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    })
    
    return notifications

@router.put("/notifications")
async def update_notifications(
    request: NotificationSettingsRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update patient's notification settings"""
    patient_id = current_user.id
    
    from datetime import datetime
    notifications = {
        "id": patient_id,
        "patient_id": patient_id,
        "email_notifications": request.email_notifications,
        "sms_notifications": request.sms_notifications,
        "appointment_reminders": request.appointment_reminders,
        "lab_results_notifications": request.lab_results_notifications,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": datetime.now().isoformat()
    }
    
    notification_settings_storage[patient_id] = notifications
    
    return notifications

# Security Settings endpoints
@router.get("/security")
async def get_security_settings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get patient's security settings"""
    patient_id = current_user.id
    
    # Get security settings for this patient
    security = security_settings_storage.get(patient_id, {
        "id": patient_id,
        "patient_id": patient_id,
        "two_factor_enabled": False,
        "login_alerts": True,
        "session_timeout": 3600,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    })
    
    return security

@router.put("/security")
async def update_security_settings(
    request: SecuritySettingsRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update patient's security settings"""
    patient_id = current_user.id
    
    from datetime import datetime
    security = {
        "id": patient_id,
        "patient_id": patient_id,
        "two_factor_enabled": request.two_factor_enabled,
        "login_alerts": request.login_alerts,
        "session_timeout": request.session_timeout,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": datetime.now().isoformat()
    }
    
    security_settings_storage[patient_id] = security
    
    return security

# Activity Logs endpoints
@router.get("/activity-logs")
async def get_activity_logs(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get patient's activity logs"""
    patient_id = current_user.id
    
    # Get activity logs for this patient
    logs = activity_logs_storage.get(patient_id, [
        {
            "id": 1,
            "user_id": patient_id,
            "action": "Login",
            "device": "Web Application",
            "location": None,
            "ip_address": None,
            "timestamp": "2024-01-01T10:00:00"
        }
    ])
    
    return logs


@router.get("/medical-records/download")
async def download_medical_records(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Download patient's medical records as PDF"""
    patient_id = current_user.id
    
    # Get patient's medical history
    medical_history = db.query(MedicalHistory).filter(MedicalHistory.patient_id == patient_id).all()
    
    # Get patient's basic info
    user = db.query(User).filter(User.id == patient_id).first()
    
    # Get patient's medical info
    medical_info = db.query(MedicalInfo).filter(MedicalInfo.patient_id == patient_id).first()
    
    # Get emergency contact
    emergency_contact = db.query(EmergencyContact).filter(EmergencyContact.patient_id == patient_id).first()
    
    # Get insurance info
    insurance = db.query(Insurance).filter(Insurance.patient_id == patient_id).first()
    
    # Create PDF
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Add styles
    styles = getSampleStyleSheet()
    
    # Title
    p.setFont("Helvetica-Bold", 16)
    p.drawString(100, height - 50, "Medical Records Report")
    
    # Patient Information
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, height - 100, "Patient Information:")
    p.setFont("Helvetica", 10)
    
    y_position = height - 120
    if user:
        p.drawString(50, y_position, f"Name: {user.full_name or 'N/A'}")
        y_position -= 20
        p.drawString(50, y_position, f"Email: {user.email or 'N/A'}")
        y_position -= 20
        p.drawString(50, y_position, f"Phone: {user.phone or 'N/A'}")
        y_position -= 20
        p.drawString(50, y_position, f"Date of Birth: {user.date_of_birth.strftime('%Y-%m-%d') if user.date_of_birth else 'N/A'}")
        y_position -= 20
        p.drawString(50, y_position, f"Blood Type: {medical_info.blood_type if medical_info and medical_info.blood_type else 'N/A'}")
        if medical_info:
            y_position -= 20
            p.drawString(50, y_position, f"Height: {medical_info.height or 'N/A'}")
            y_position -= 20
            p.drawString(50, y_position, f"Weight: {medical_info.weight or 'N/A'}")
    
    # Emergency Contact
    y_position -= 40
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y_position, "Emergency Contact:")
    p.setFont("Helvetica", 10)
    
    if emergency_contact:
        y_position -= 20
        p.drawString(50, y_position, f"Name: {emergency_contact.name}")
        y_position -= 20
        p.drawString(50, y_position, f"Phone: {emergency_contact.phone}")
        y_position -= 20
        p.drawString(50, y_position, f"Relationship: {emergency_contact.relation}")
    
    # Insurance Information
    y_position -= 40
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y_position, "Insurance Information:")
    p.setFont("Helvetica", 10)
    
    if insurance:
        y_position -= 20
        p.drawString(50, y_position, f"Provider: {insurance.provider}")
        y_position -= 20
        p.drawString(50, y_position, f"Policy Number: {insurance.policy_number}")
        y_position -= 20
        p.drawString(50, y_position, f"Group Number: {insurance.group_number or 'N/A'}")
        y_position -= 20
        p.drawString(50, y_position, f"Holder Name: {insurance.holder_name}")
        y_position -= 20
        p.drawString(50, y_position, f"Type: {insurance.insurance_type or 'standard'}")
    
    # Medical History
    y_position -= 40
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y_position, "Medical History:")
    
    if medical_history:
        for i, record in enumerate(medical_history):
            y_position -= 30
            p.setFont("Helvetica-Bold", 10)
            p.drawString(50, y_position, f"Record {i+1}:")
            y_position -= 20
            p.setFont("Helvetica", 9)
            
            if record.diagnosis:
                p.drawString(70, y_position, f"Diagnosis: {record.diagnosis}")
                y_position -= 15
            if record.symptoms:
                p.drawString(70, y_position, f"Symptoms: {record.symptoms}")
                y_position -= 15
            if record.treatment_plan:
                p.drawString(70, y_position, f"Treatment: {record.treatment_plan}")
                y_position -= 15
            if record.notes:
                p.drawString(70, y_position, f"Notes: {record.notes}")
                y_position -= 15
            if record.created_at:
                p.drawString(70, y_position, f"Date: {record.created_at.strftime('%Y-%m-%d')}")
                y_position -= 20
    else:
        y_position -= 20
        p.setFont("Helvetica", 10)
        p.drawString(50, y_position, "No medical records found")
    
    # Footer
    p.setFont("Helvetica", 8)
    p.drawString(50, 50, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    p.drawString(50, 40, f"Generated by: Kiangombe Patient Center")
    
    p.save()
    
    buffer.seek(0)
    
    from starlette.responses import StreamingResponse
    
    return StreamingResponse(
        BytesIO(buffer.read()),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=medical_records_{current_user.id}_{datetime.now().strftime('%Y%m%d')}.pdf"
        }
    )
