from datetime import timedelta, datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status
from database import get_db
from models import User, Role, Nurse, Receptionist, LabTechnician, Pharmacist, Doctor
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic_models import (
    CreateUserRequest,
    CreateStaffRequest,
    Token,
    TokenVerifyRequest,
    LoginUserRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenVerificationResponse,
    VerifyCodeRequest,
    ResetPasswordWithCodeRequest
)
from passlib.context import CryptContext
import os
import logging
import random
import string
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-default-secure-key")
ALGORITHM = "HS256"
bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/login")

# Store verification codes in memory (for demo purposes)
verification_codes = {}

def get_password_hash(password: str) -> str:
    """Generate a hashed password."""
    return bcrypt_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return bcrypt_context.verify(plain_password, hashed_password)

def generate_verification_code(length=6):
    """Generate a random verification code."""
    return ''.join(random.choices(string.digits, k=length))

def display_verification_code(email: str, code: str, purpose: str = "verification"):
    """Display verification code in terminal."""
    print("\n" + "="*60)
    print(f" {purpose.upper()} CODE GENERATED")
    print("="*60)
    print(f" Email: {email}")
    print(f" Code: {code}")
    print(f" This code will expire in 1 hour")
    print("="*60)
    print("  Note: In production, this would be sent via email")
    print("="*60 + "\n")

@router.post("/register/customer", status_code=status.HTTP_201_CREATED)
async def register_customer(create_user_request: CreateUserRequest, db: Session = Depends(get_db)):
    logger.info(f"Customer registration payload: {create_user_request}")
    existing_user = db.query(User).filter(
        User.email == create_user_request.email
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Convert date_of_birth string to datetime if provided
    date_of_birth = None
    if create_user_request.date_of_birth:
        try:
            date_of_birth = datetime.fromisoformat(create_user_request.date_of_birth)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    create_user_model = User(
        full_name=create_user_request.full_name,
        email=create_user_request.email,
        password_hash=bcrypt_context.hash(create_user_request.password),
        phone=create_user_request.phone,
        gender=create_user_request.gender,
        date_of_birth=date_of_birth,
        role=Role.PATIENT
    )
    db.add(create_user_model)
    db.commit()
    db.refresh(create_user_model)
    logger.info(f"Customer {create_user_request.full_name} registered successfully")
    return {
        "message": "Customer created successfully",
        "user": {
            "id": create_user_model.id,
            "full_name": create_user_model.full_name,
            "email": create_user_model.email,
            "phone": create_user_model.phone,
            "role": create_user_model.role.value,
        },
    }

@router.post("/register/admin", status_code=status.HTTP_201_CREATED)
async def register_admin(create_user_request: CreateUserRequest, db: Session = Depends(get_db)):
    logger.info(f"Admin registration payload: {create_user_request}")
    existing_user = db.query(User).filter(
        User.email == create_user_request.email
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Convert date_of_birth string to datetime if provided
    date_of_birth = None
    if create_user_request.date_of_birth:
        try:
            date_of_birth = datetime.fromisoformat(create_user_request.date_of_birth)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    create_user_model = User(
        full_name=create_user_request.full_name,
        email=create_user_request.email,
        password_hash=bcrypt_context.hash(create_user_request.password),
        phone=create_user_request.phone,
        gender=create_user_request.gender,
        date_of_birth=date_of_birth,
        role=Role.CLINICIAN_ADMIN
    )
    db.add(create_user_model)
    db.commit()
    db.refresh(create_user_model)
    logger.info(f"Admin {create_user_request.full_name} registered successfully")
    return {
        "message": "Admin created successfully",
        "user": {
            "id": create_user_model.id,
            "full_name": create_user_model.full_name,
            "email": create_user_model.email,
            "phone": create_user_model.phone,
            "role": create_user_model.role.value,
        },
    }


@router.post("/register/doctor", status_code=status.HTTP_201_CREATED)
async def register_doctor(create_user_request: CreateUserRequest, db: Session = Depends(get_db)):
    logger.info(f"Doctor registration payload: {create_user_request}")
    existing_user = db.query(User).filter(
        User.email == create_user_request.email
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Convert date_of_birth string to datetime if provided
    date_of_birth = None
    if create_user_request.date_of_birth:
        try:
            date_of_birth = datetime.fromisoformat(create_user_request.date_of_birth)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    create_user_model = User(
        full_name=create_user_request.full_name,
        email=create_user_request.email,
        password_hash=bcrypt_context.hash(create_user_request.password),
        phone=create_user_request.phone,
        gender=create_user_request.gender,
        date_of_birth=date_of_birth,
        role=Role.DOCTOR
    )
    db.add(create_user_model)
    db.commit()
    db.refresh(create_user_model)
    logger.info(f"Doctor {create_user_request.full_name} registered successfully")
    return {
        "message": "Doctor created successfully",
        "user": {
            "id": create_user_model.id,
            "full_name": create_user_model.full_name,
            "email": create_user_model.email,
            "phone": create_user_model.phone,
            "role": create_user_model.role.value,
        },
    }


@router.post("/register/staff", status_code=status.HTTP_201_CREATED)
async def register_staff(create_staff_request: CreateStaffRequest, db: Session = Depends(get_db)):
    logger.info(f"Staff registration payload: {create_staff_request}")
    existing_user = db.query(User).filter(
        User.email == create_staff_request.email
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Validate role
    valid_staff_roles = ["doctor", "nurse", "receptionist", "lab_technician", "pharmacist"]
    if create_staff_request.role not in valid_staff_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Must be one of: {', '.join(valid_staff_roles)}"
        )
    
    # Convert date_of_birth string to datetime if provided
    date_of_birth = None
    if create_staff_request.date_of_birth:
        try:
            date_of_birth = datetime.fromisoformat(create_staff_request.date_of_birth)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Convert role string to Role enum
    try:
        role_mapping = {
            "doctor": Role.DOCTOR,
            "nurse": Role.NURSE,
            "receptionist": Role.RECEPTIONIST,
            "lab_technician": Role.LAB_TECHNICIAN,
            "pharmacist": Role.PHARMACIST,
        }
        role_enum = role_mapping.get(create_staff_request.role.lower())
        if not role_enum:
            raise ValueError("Invalid role")
    except (KeyError, ValueError):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role: {create_staff_request.role}"
        )
    
    create_user_model = User(
        full_name=create_staff_request.full_name,
        email=create_staff_request.email,
        password_hash=bcrypt_context.hash(create_staff_request.password),
        phone=create_staff_request.phone,
        gender=create_staff_request.gender,
        date_of_birth=date_of_birth,
        role=role_enum
    )
    db.add(create_user_model)
    db.commit()
    db.refresh(create_user_model)
    
    # Create role-specific staff record
    if create_staff_request.role == "doctor":
        staff_profile = Doctor(
            user_id=create_user_model.id,
            specialization=getattr(create_staff_request, 'specialization', None),
            bio=getattr(create_staff_request, 'bio', None),
            license_number=getattr(create_staff_request, 'license_number', None),
            is_available=getattr(create_staff_request, 'is_available', True),
            consultation_fee=getattr(create_staff_request, 'consultation_fee', None),
            rating=0.0
        )
        db.add(staff_profile)
    elif create_staff_request.role == "nurse":
        staff_profile = Nurse(
            user_id=create_user_model.id,
            specialization=getattr(create_staff_request, 'specialization', None),
            bio=getattr(create_staff_request, 'bio', None),
            license_number=getattr(create_staff_request, 'license_number', None),
            is_available=getattr(create_staff_request, 'is_available', True)
        )
        db.add(staff_profile)
    elif create_staff_request.role == "receptionist":
        staff_profile = Receptionist(
            user_id=create_user_model.id,
            bio=getattr(create_staff_request, 'bio', None),
            is_available=getattr(create_staff_request, 'is_available', True)
        )
        db.add(staff_profile)
    elif create_staff_request.role == "lab_technician":
        staff_profile = LabTechnician(
            user_id=create_user_model.id,
            specialization=getattr(create_staff_request, 'specialization', None),
            bio=getattr(create_staff_request, 'bio', None),
            license_number=getattr(create_staff_request, 'license_number', None),
            is_available=getattr(create_staff_request, 'is_available', True)
        )
        db.add(staff_profile)
    elif create_staff_request.role == "pharmacist":
        staff_profile = Pharmacist(
            user_id=create_user_model.id,
            specialization=getattr(create_staff_request, 'specialization', None),
            bio=getattr(create_staff_request, 'bio', None),
            license_number=getattr(create_staff_request, 'license_number', None),
            is_available=getattr(create_staff_request, 'is_available', True)
        )
        db.add(staff_profile)
    
    db.commit()
    logger.info(f"Staff member {create_user_model.full_name} ({create_staff_request.role}) registered successfully")
    return {
        "message": "Staff member created successfully",
        "user": {
            "id": create_user_model.id,
            "full_name": create_user_model.full_name,
            "email": create_user_model.email,
            "phone": create_user_model.phone,
            "role": create_user_model.role.value,
        },
    }


def authenticate_user(email: str, password: str, db: Session):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User does not exist")
    if not bcrypt_context.verify(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid password")
    return user

def create_access_token(full_name: str, user_id: int, role: str, expires_delta: timedelta):
    encode = {"sub": full_name, "id": user_id, "role": role}
    expires = datetime.utcnow() + expires_delta
    encode.update({"exp": expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

from activity_logger import create_activity_log

@router.post("/login", response_model=Token)
async def login(form_data: LoginUserRequest, db: Session = Depends(get_db)):
    logger.info(f"Login attempt for email: {form_data.email}")
    user = authenticate_user(form_data.email, form_data.password, db)

    # Token expiration (must match Token.expires_in)
    token_expires = timedelta(hours=1)
    token = create_access_token(user.full_name, user.id, user.role.value, token_expires)

    # Log successful login
    create_activity_log(
        user_id=user.id,
        action="Login",
        device="Web Application",  # Could be enhanced with user agent parsing
        ip_address=None,  # Could be extracted from request headers
        db=db
    )

    logger.info(f"User {user.full_name} logged in successfully")
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": int(token_expires.total_seconds()),
    }

async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)], db: Session = Depends(get_db)):
    """Get current user from token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")
        role: str = payload.get("role")
        if username is None or user_id is None or role is None:
            raise HTTPException(status_code=401, detail="Could not validate user")
        
        # Fetch actual user from database
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        logger.warning("Invalid token")
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_active_user(token: Annotated[str, Depends(oauth2_bearer)], db: Session = Depends(get_db)):
    """Get current active user from token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")
        role: str = payload.get("role")
        if username is None or user_id is None or role is None:
            raise HTTPException(status_code=401, detail="Could not validate user")
        
        # Fetch actual user from database
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        logger.warning("Invalid token")
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/verify-token", response_model=TokenVerificationResponse, status_code=status.HTTP_200_OK)
async def verify_token(request_body: TokenVerifyRequest):
    try:
        payload = jwt.decode(request_body.token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        exp_timestamp = float(payload["exp"])
        exp_datetime = datetime.fromtimestamp(exp_timestamp)
        if exp_datetime < datetime.utcnow():
            logger.warning("Token expired during verification")
            raise HTTPException(status_code=401, detail="Token expired")
        logger.info(f"Token verified for user: {username}")
        return {"username": username, "tokenverification": "success"}
    except jwt.JWTError:
        logger.warning("Invalid token during verification")
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(forgot_password_request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = forgot_password_request.email
    user = db.query(User).filter(User.email == email).first()
    if not user:
        logger.warning(f"Password reset requested for non-existent email: {email}")
        raise HTTPException(status_code=404, detail="User does not exist")
    
    # Generate verification code
    verification_code = generate_verification_code()
    
    # Store the code with timestamp (in production, use Redis or database)
    verification_codes[email] = {
        'code': verification_code,
        'timestamp': datetime.utcnow(),
        'user_id': user.id,
        'purpose': 'password_reset'
    }
    
    # Display code in terminal
    display_verification_code(email, verification_code, "Password Reset")
    
    logger.info(f"Password reset code generated for: {email}")
    return {
        "message": "Password reset code generated. Check the terminal for the verification code.",
        "email": email,
        "note": "In production, this would be sent via email"
    }
    

@router.post("/verify-reset-code", status_code=status.HTTP_200_OK)
async def verify_reset_code(verify_request: VerifyCodeRequest, db: Session = Depends(get_db)):
    """Verify the reset code sent to email."""
    email = verify_request.email
    code = verify_request.code
    
    # Check if verification code exists and is valid
    if email not in verification_codes:
        logger.warning(f"Verification code requested for email with no code: {email}")
        raise HTTPException(status_code=400, detail="No verification code found for this email")
    
    stored_data = verification_codes[email]
    
    # Check if code matches
    if stored_data['code'] != code:
        logger.warning(f"Invalid verification code provided for: {email}")
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # Check if code has expired (1 hour)
    if datetime.utcnow() - stored_data['timestamp'] > timedelta(hours=1):
        logger.warning(f"Expired verification code provided for: {email}")
        # Remove expired code
        del verification_codes[email]
        raise HTTPException(status_code=400, detail="Verification code has expired")
    
    logger.info(f"Verification code validated for: {email}")
    return {
        "message": "Verification code validated successfully",
        "email": email,
        "user_id": stored_data['user_id']
    }

@router.post("/reset-password-with-code", status_code=status.HTTP_200_OK)
async def reset_password_with_code(reset_request: ResetPasswordWithCodeRequest, db: Session = Depends(get_db)):
    """Reset password using verification code."""
    email = reset_request.email
    code = reset_request.code
    new_password = reset_request.new_password
    
    # First verify the code
    if email not in verification_codes:
        logger.warning(f"Password reset requested for email with no code: {email}")
        raise HTTPException(status_code=400, detail="No verification code found for this email")
    
    stored_data = verification_codes[email]
    
    if stored_data['code'] != code:
        logger.warning(f"Invalid verification code for password reset: {email}")
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # Check if code has expired
    if datetime.utcnow() - stored_data['timestamp'] > timedelta(hours=1):
        logger.warning(f"Expired verification code for password reset: {email}")
        del verification_codes[email]
        raise HTTPException(status_code=400, detail="Verification code has expired")
    
    # Get user and update password
    user = db.query(User).filter(User.id == stored_data['user_id']).first()
    if not user:
        logger.warning(f"User not found for password reset: {email}")
        raise HTTPException(status_code=404, detail="User not found")
    
    user.password_hash = bcrypt_context.hash(new_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Remove the used verification code
    del verification_codes[email]
    
    # Log password reset
    create_activity_log(
        user_id=user.id,
        action="Password Reset",
        device="Web Application",
        db=db
    )
    
    logger.info(f"Password reset successfully for user: {user.full_name}")
    return {"message": "Password has been reset successfully"}

@router.post("/reset-password/{token}", status_code=status.HTTP_200_OK)
async def reset_password(token: str, reset_password_request: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("id")
        if user_id is None:
            logger.warning("Invalid reset token")
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.warning(f"Password reset attempted for non-existent user ID: {user_id}")
            raise HTTPException(status_code=404, detail="User does not exist")
        
        user.password_hash = bcrypt_context.hash(reset_password_request.new_password)
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"Password reset successfully for user: {user.full_name}")
        
        # Log password reset
        create_activity_log(
            user_id=user.id,
            action="Password Reset",
            device="Web Application",
            db=db
        )
        
        return {"message": "Password has been reset successfully"}
    except jwt.ExpiredSignatureError:
        logger.warning("Expired reset token")
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        logger.warning("Invalid reset token")
        raise HTTPException(status_code=401, detail="Invalid token")