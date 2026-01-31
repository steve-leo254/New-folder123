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

from database import get_db
from models import User
from auth_router import get_current_active_user

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

# Emergency Contact Models
class EmergencyContactRequest(BaseModel):
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None

class EmergencyContactResponse(BaseModel):
    id: int
    patient_id: int
    name: str
    phone: str
    relation: str
    created_at: str
    updated_at: str

# Insurance Models
class InsuranceRequest(BaseModel):
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    insurance_group_number: Optional[str] = None
    insurance_holder_name: Optional[str] = None
    insurance_type: Optional[str] = None
    quarterly_limit: Optional[int] = None
    quarterly_used: Optional[int] = None
    coverage_start_date: Optional[str] = None
    coverage_end_date: Optional[str] = None

class InsuranceResponse(BaseModel):
    id: int
    patient_id: int
    provider: str
    policy_number: str
    group_number: Optional[str] = None
    holder_name: str
    type: str
    quarterly_limit: Optional[int] = None
    quarterly_used: Optional[int] = None
    coverage_start_date: Optional[str] = None
    coverage_end_date: Optional[str] = None
    created_at: str
    updated_at: str

# Notification Models
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
    patient_id = current_user.id
    
    # Get wishlist items for this patient
    patient_wishlist = wishlist_storage.get(patient_id, [])
    
    # Transform to response format
    wishlist_items = []
    for item in patient_wishlist:
        medication_info = MOCK_MEDICATIONS.get(item["medication_id"])
        if medication_info:
            wishlist_item = {
                "id": item["id"],
                "patient_id": patient_id,
                "medication_id": item["medication_id"],
                "medication_name": medication_info["name"],
                "dosage": medication_info["dosage"],
                "price": medication_info["price"],
                "category": medication_info["category"],
                "image_url": medication_info["image_url"],
                "in_stock": medication_info["in_stock"],
                "requires_prescription": medication_info["requires_prescription"],
                "rating": medication_info["rating"],
                "reviews": medication_info["reviews"],
                "added_date": item["added_date"],
                "availability": medication_info["availability"],
                "stock_count": medication_info["stock_count"]
            }
            wishlist_items.append(wishlist_item)
    
    return wishlist_items

@router.post("/wishlist")
async def add_to_wishlist(
    request: WishlistItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add item to patient's wishlist"""
    logger.info(f"POST /api/patient/wishlist called by user {current_user.id}")
    logger.info(f"Request payload: {request}")
    
    patient_id = current_user.id
    medication_id = request.medication_id
    
    # Use medication data from frontend if provided, otherwise use mock data
    medication_info = None
    
    if request.medication:
        # Use frontend medication data
        med = request.medication
        medication_info = {
            "name": med.get("name", f"Medication {medication_id}"),
            "dosage": med.get("dosage", "Standard Dosage"),
            "price": float(med.get("price", 15.99)),
            "category": med.get("category", "general"),
            "image_url": med.get("image", "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop"),
            "in_stock": med.get("inStock", True),
            "requires_prescription": med.get("prescriptionRequired", False),
            "rating": float(med.get("rating", 4.5)),
            "reviews": int(med.get("reviews", 100)),
            "availability": "in-stock" if med.get("inStock", True) else "out-of-stock",
            "stock_count": int(med.get("stock", 50))
        }
    else:
        # Use mock medication data
        medication_info = MOCK_MEDICATIONS.get(medication_id)
        if not medication_info:
            # Create default medication info if not found in mock data
            medication_info = {
                "name": f"Medication {medication_id}",
                "dosage": "Standard Dosage",
                "price": 15.99,
                "category": "general",
                "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop",
                "in_stock": True,
                "requires_prescription": False,
                "rating": 4.5,
                "reviews": 100,
                "availability": "in-stock",
                "stock_count": 50
            }
    
    # Initialize patient wishlist if not exists
    if patient_id not in wishlist_storage:
        wishlist_storage[patient_id] = []
    
    # Check if item already in wishlist
    for item in wishlist_storage[patient_id]:
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
    patient_id = current_user.id
    
    if patient_id not in wishlist_storage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found"
        )
    
    # Find and remove the item
    item_found = False
    for i, item in enumerate(wishlist_storage[patient_id]):
        if item["id"] == wishlist_item_id:
            del wishlist_storage[patient_id][i]
            item_found = True
            break
    
    if not item_found:
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
    patient_id = current_user.id
    
    wishlist_storage[patient_id] = []
    
    return {"message": "Wishlist cleared"}

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
    
    # Get emergency contact for this patient
    emergency_contact = emergency_contact_storage.get(patient_id, {
        "id": patient_id,
        "patient_id": patient_id,
        "name": "",
        "phone": "",
        "relation": "",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    })
    
    return emergency_contact

@router.put("/emergency-contact")
async def update_emergency_contact(
    request: EmergencyContactRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update patient's emergency contact"""
    patient_id = current_user.id
    
    from datetime import datetime
    emergency_contact = {
        "id": patient_id,
        "patient_id": patient_id,
        "name": request.emergency_contact_name or "",
        "phone": request.emergency_contact_phone or "",
        "relation": request.emergency_contact_relation or "",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": datetime.now().isoformat()
    }
    
    emergency_contact_storage[patient_id] = emergency_contact
    
    return emergency_contact

# Insurance endpoints
@router.get("/insurance")
async def get_insurance(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get patient's insurance information"""
    patient_id = current_user.id
    
    # Get insurance for this patient
    insurance = insurance_storage.get(patient_id, {
        "id": patient_id,
        "patient_id": patient_id,
        "provider": "",
        "policy_number": "",
        "group_number": None,
        "holder_name": "",
        "type": "",
        "quarterly_limit": None,
        "quarterly_used": None,
        "coverage_start_date": None,
        "coverage_end_date": None,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    })
    
    return insurance

@router.put("/insurance")
async def update_insurance(
    request: InsuranceRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update patient's insurance information"""
    patient_id = current_user.id
    
    from datetime import datetime
    insurance = {
        "id": patient_id,
        "patient_id": patient_id,
        "provider": request.insurance_provider or "",
        "policy_number": request.insurance_policy_number or "",
        "group_number": request.insurance_group_number,
        "holder_name": request.insurance_holder_name or "",
        "type": request.insurance_type or "",
        "quarterly_limit": request.quarterly_limit,
        "quarterly_used": request.quarterly_used,
        "coverage_start_date": request.coverage_start_date,
        "coverage_end_date": request.coverage_end_date,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": datetime.now().isoformat()
    }
    
    insurance_storage[patient_id] = insurance
    
    return insurance

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
