from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from models import User, MedicalHistory
from pydantic_models import (
    MedicalHistoryCreateRequest,
    MedicalHistoryResponse,
    MedicalHistoryUpdateRequest
)
from auth_router import get_current_active_user

router = APIRouter(prefix="/api/patients", tags=["medical-history"])

# Helper function to check if user can access patient records
def can_access_patient_records(current_user: User, patient_id: int) -> bool:
    """Check if current user can access patient medical records."""
    # Patients can access their own records
    if current_user.role.value == 'PATIENT' and current_user.id == patient_id:
        return True
    
    # Doctors, nurses, and other staff can access patient records
    if current_user.role.value in ['DOCTOR', 'NURSE', 'RECEPTIONIST', 'CLINICIAN_ADMIN', 'SUPER_ADMIN']:
        return True
    
    return False

@router.get("/{patient_id}/medical-history", response_model=List[MedicalHistoryResponse])
async def get_medical_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get patient medical history."""
    # Check permissions
    if not can_access_patient_records(current_user, patient_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access these medical records"
        )
    
    # Get medical history records
    records = db.query(MedicalHistory).filter(
        MedicalHistory.patient_id == patient_id
    ).order_by(MedicalHistory.date.desc()).all()
    
    return records

@router.post("/{patient_id}/medical-history", response_model=MedicalHistoryResponse)
async def create_medical_record(
    patient_id: int,
    record_data: MedicalHistoryCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new medical record."""
    # Check permissions
    if not can_access_patient_records(current_user, patient_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create medical records for this patient"
        )
    
    # Verify patient exists
    patient = db.query(User).filter(User.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Create medical record
    medical_record = MedicalHistory(
        patient_id=patient_id,
        type=record_data.type,
        title=record_data.title,
        description=record_data.description,
        doctor_id=current_user.id,
        doctor_name=current_user.full_name,
        notes=record_data.notes,
        attachments=record_data.attachments or [],
        date=datetime.utcnow()
    )
    
    db.add(medical_record)
    db.commit()
    db.refresh(medical_record)
    
    return medical_record

@router.put("/{patient_id}/medical-history/{record_id}", response_model=MedicalHistoryResponse)
async def update_medical_record(
    patient_id: int,
    record_id: int,
    record_data: MedicalHistoryUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a medical record."""
    # Check permissions
    if not can_access_patient_records(current_user, patient_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update medical records for this patient"
        )
    
    # Get existing record
    record = db.query(MedicalHistory).filter(
        MedicalHistory.id == record_id,
        MedicalHistory.patient_id == patient_id
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    
    # Update record
    for field, value in record_data.dict(exclude_unset=True).items():
        setattr(record, field, value)
    
    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    
    return record

@router.delete("/{patient_id}/medical-history/{record_id}")
async def delete_medical_record(
    patient_id: int,
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a medical record."""
    # Check permissions (only doctors and admins can delete)
    if current_user.role.value not in ['DOCTOR', 'CLINICIAN_ADMIN', 'SUPER_ADMIN']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete medical records"
        )
    
    # Get existing record
    record = db.query(MedicalHistory).filter(
        MedicalHistory.id == record_id,
        MedicalHistory.patient_id == patient_id
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found"
        )
    
    db.delete(record)
    db.commit()
    
    return {"message": "Medical record deleted successfully"}
