"""
Initialize default staff roles for Kiangombe Health Center.
Run this script after creating the database to populate default roles.
"""

import sys
import os
from sqlalchemy.orm import Session

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, get_db
from models import StaffRole, Base
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DEFAULT_ROLES = [
    {
        "id": "role_doctor_default",
        "name": "Doctor",
        "description": "Medical doctor who can diagnose, treat patients, and prescribe medication",
        "permissions": [
            "view_patients",
            "create_appointments", 
            "prescribe_medication",
            "view_medical_records",
            "manage_schedule",
            "update_vitals",
            "assist_procedures"
        ],
        "requires_specialization": True,
        "requires_license": True,
        "default_consultation_fee": 50.00
    },
    {
        "id": "role_nurse_default",
        "name": "Nurse",
        "description": "Nursing staff who assists doctors and provides patient care",
        "permissions": [
            "view_patients",
            "update_vitals",
            "assist_procedures",
            "view_medical_records",
            "manage_schedule"
        ],
        "requires_specialization": False,
        "requires_license": True,
        "default_consultation_fee": 25.00
    },
    {
        "id": "role_receptionist_default",
        "name": "Receptionist",
        "description": "Front desk staff who handles appointments and patient registration",
        "permissions": [
            "create_appointments",
            "manage_schedule",
            "patient_registration",
            "view_patients"
        ],
        "requires_specialization": False,
        "requires_license": False,
        "default_consultation_fee": None
    },
    {
        "id": "role_lab_technician_default",
        "name": "Lab Technician",
        "description": "Laboratory staff who conducts medical tests and analyses",
        "permissions": [
            "view_test_requests",
            "conduct_tests",
            "update_results",
            "view_patients"
        ],
        "requires_specialization": False,
        "requires_license": True,
        "default_consultation_fee": None
    },
    {
        "id": "role_pharmacist_default",
        "name": "Pharmacist",
        "description": "Pharmacy staff who dispenses medication and provides drug information",
        "permissions": [
            "view_prescriptions",
            "dispense_medication",
            "manage_inventory",
            "view_patients"
        ],
        "requires_specialization": False,
        "requires_license": True,
        "default_consultation_fee": None
    }
]

def init_staff_roles():
    """Initialize default staff roles in the database."""
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")
    
    # Get database session
    db: Session = next(get_db())
    
    try:
        # Check if roles already exist
        existing_roles = db.query(StaffRole).count()
        if existing_roles > 0:
            logger.info(f"Found {existing_roles} existing roles. Skipping initialization.")
            return
        
        # Create default roles
        created_count = 0
        for role_data in DEFAULT_ROLES:
            # Check if role already exists
            existing = db.query(StaffRole).filter(StaffRole.id == role_data["id"]).first()
            if existing:
                logger.info(f"Role {role_data['name']} already exists, skipping...")
                continue
            
            # Create new role
            role = StaffRole(**role_data)
            db.add(role)
            created_count += 1
            logger.info(f"Created role: {role_data['name']}")
        
        # Commit all changes
        db.commit()
        logger.info(f"Successfully initialized {created_count} default staff roles")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error initializing staff roles: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Starting staff role initialization...")
    init_staff_roles()
    logger.info("Staff role initialization completed!")
