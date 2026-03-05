#!/usr/bin/env python3
import sys
sys.path.append('.')
from models import User, Role
from database import engine, get_db
from sqlalchemy.orm import Session

# Check existing users and their roles
def check_user_roles():
    db = next(get_db())
    try:
        users = db.query(User).all()
        print("Existing users and their roles:")
        for user in users:
            print(f"  - {user.full_name} ({user.email}): {user.role.value}")
        
        print("\nRequired roles for medication creation:")
        print("  - SUPER_ADMIN")
        print("  - CLINICIAN_ADMIN") 
        print("  - PHARMACIST")
        
        # Check if any user has required role
        admin_users = db.query(User).filter(
            User.role.in_([Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN, Role.PHARMACIST])
        ).all()
        
        if admin_users:
            print(f"\n✓ Found {len(admin_users)} users with medication creation permissions:")
            for user in admin_users:
                print(f"  - {user.full_name}: {user.role.value}")
        else:
            print("\n✗ No users found with medication creation permissions!")
            print("You need to create a user with one of the required roles.")
            
    finally:
        db.close()

if __name__ == "__main__":
    check_user_roles()
