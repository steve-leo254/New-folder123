#!/usr/bin/env python3
import sys
sys.path.append('.')
from models import User, Insurance
from database import engine, get_db
from sqlalchemy.orm import Session

# Check if Super Admin has insurance records
def check_super_admin_insurance():
    db = next(get_db())
    try:
        # Find Super Admin users
        super_admins = db.query(User).filter(User.role == 'super_admin').all()
        
        print("Super Admin users and their insurance:")
        for admin in super_admins:
            print(f"\n{admin.full_name} (ID: {admin.id})")
            print(f"  Email: {admin.email}")
            
            # Check for insurance records
            insurance = db.query(Insurance).filter(Insurance.patient_id == admin.id).first()
            if insurance:
                print(f"  Insurance: ✅ Found")
                print(f"    Provider: {insurance.provider}")
                print(f"    Policy Number: {insurance.policy_number}")
                print(f"    Type: {insurance.insurance_type}")
                print(f"    Quarterly Limit: {insurance.quarterly_limit}")
                print(f"    Quarterly Used: {insurance.quarterly_used}")
            else:
                print(f"  Insurance: ❌ No records found")
                
    finally:
        db.close()

if __name__ == "__main__":
    check_super_admin_insurance()
