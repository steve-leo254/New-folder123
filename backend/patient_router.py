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
    
    # Check if medication exists
    if medication_id not in MOCK_MEDICATIONS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )
    
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
    medication_info = MOCK_MEDICATIONS[medication_id]
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
