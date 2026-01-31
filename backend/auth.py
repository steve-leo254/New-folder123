"""
Authentication module with JWT handling, password hashing, and email service.
"""
import os
import logging
from datetime import datetime, timedelta
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from dotenv import load_dotenv

from database import get_db
from models import User, Role
from pydantic_models import (
    UserCreate, UserResponse, LoginRequest, Token,
    TokenVerifyRequest, TokenVerifyResponse,
    ForgotPasswordRequest, ResetPasswordRequest, MessageResponse
)

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# Configuration
# ============================================================================

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-key-change-in-production")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8000")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Email configuration
mail_conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "steveleo254@gmail.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", ""),
    MAIL_FROM=os.getenv("MAIL_FROM", "steveleo254@gmail.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)


# ============================================================================
# Password Utilities
# ============================================================================

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ============================================================================
# JWT Utilities
# ============================================================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        logger.warning(f"Token decode error: {e}")
        return None


def create_password_reset_token(user_id: int, email: str) -> str:
    """Create a password reset token valid for 1 hour."""
    data = {"sub": str(user_id), "email": email, "type": "password_reset"}
    expire = datetime.utcnow() + timedelta(hours=1)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


def create_email_verification_token(user_id: int, email: str) -> str:
    """Create an email verification token valid for 24 hours."""
    data = {"sub": str(user_id), "email": email, "type": "email_verification"}
    expire = datetime.utcnow() + timedelta(hours=24)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


# ============================================================================
# Dependencies
# ============================================================================

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db)
) -> User:
    """Get the current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_token(token)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None or payload.get("type") != "access":
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in"
        )

    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return current_user


def require_roles(*allowed_roles: Role):
    """Dependency factory to check if user has required roles."""
    async def role_checker(
        current_user: Annotated[User, Depends(get_current_active_user)]
    ) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in allowed_roles]}"
            )
        return current_user
    return role_checker


# Convenience role dependencies
require_super_admin = require_roles(Role.SUPER_ADMIN)
require_clinician = require_roles(Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN)
require_any_admin = require_roles(Role.SUPER_ADMIN, Role.CLINICIAN_ADMIN)


# ============================================================================
# Email Service
# ============================================================================

async def send_password_reset_email(email: str, full_name: str, reset_url: str):
    """Send password reset email."""
    try:
        message = MessageSchema(
            subject="Password Reset Request - Kiangombe Health",
            recipients=[email],
            body=f"""
            <html>
            <body>
                <h2>Password Reset Request</h2>
                <p>Hi {full_name},</p>
                <p>You requested to reset your password.</p>
                <p><a href="{reset_url}" style="background-color: #4CAF50; color: white; 
                   padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
                <p>This link expires in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <br>
                <p>Best regards,<br>Kiangombe Health Team</p>
            </body>
            </html>
            """,
            subtype="html",
        )
        fm = FastMail(mail_conf)
        await fm.send_message(message)
        logger.info(f"Password reset email sent to: {email}")
    except Exception as e:
        logger.error(f"Failed to send password reset email: {e}")


async def send_welcome_email(email: str, full_name: str):
    """Send welcome email after registration."""
    try:
        message = MessageSchema(
            subject="Welcome to Kiangombe Health!",
            recipients=[email],
            body=f"""
            <html>
            <body>
                <h2>Welcome to Kiangombe Health!</h2>
                <p>Hi {full_name},</p>
                <p>Thank you for creating an account with us.</p>
                <p><a href="{FRONTEND_URL}/login" style="background-color: #4CAF50; color: white; 
                   padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a></p>
                <br>
                <p>Best regards,<br>Kiangombe Health Team</p>
            </body>
            </html>
            """,
            subtype="html",
        )
        fm = FastMail(mail_conf)
        await fm.send_message(message)
        logger.info(f"Welcome email sent to: {email}")
    except Exception as e:
        logger.error(f"Failed to send welcome email: {e}")


async def send_verification_email(email: str, full_name: str, verification_url: str):
    """Send email verification email."""
    try:
        message = MessageSchema(
            subject="Verify Your Kiangombe Health Account",
            recipients=[email],
            body=f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Kiangombe Health</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #333;">Welcome to Kiangombe Health, {full_name}!</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Thank you for registering with Kiangombe Health. To complete your registration and activate your account, 
                        please click the verification button below:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{verification_url}" 
                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                  color: white; 
                                  padding: 15px 30px; 
                                  text-decoration: none; 
                                  border-radius: 5px; 
                                  display: inline-block; 
                                  font-weight: bold;">
                            Verify My Account
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        If the button doesn't work, you can copy and paste this link into your browser:<br>
                        <a href="{verification_url}" style="color: #667eea;">{verification_url}</a>
                    </p>
                    <p style="color: #666; font-size: 14px;">
                        This verification link will expire in 24 hours. If you didn't create an account with Kiangombe Health, 
                        please ignore this email.
                    </p>
                </div>
                <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                    <p> 2024 Kiangombe Health. All rights reserved.</p>
                </div>
            </div>
            </body>
            </html>
            """,
            subtype="html",
        )
        fm = FastMail(mail_conf)
        await fm.send_message(message)
        logger.info(f"Verification email sent to: {email}")
    except Exception as e:
        logger.error(f"Failed to send verification email: {e}")


# ============================================================================
# Router
# ============================================================================

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Register a new patient account."""
    logger.info(f"Registration attempt for: {user_data.email}")

    # Check if email exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Parse date of birth
    date_of_birth = None
    if user_data.date_of_birth:
        try:
            date_of_birth = datetime.strptime(user_data.date_of_birth, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD"
            )

    # Create user
    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        phone=user_data.phone,
        gender=user_data.gender,
        date_of_birth=date_of_birth,
        role=Role.PATIENT,
        is_active=True,
        is_verified=False
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        logger.info(f"User registered: {new_user.email}")

        # Send verification email in background instead of welcome email
        verification_token = create_email_verification_token(new_user.id, new_user.email)
        verification_url = f"{FRONTEND_URL}/verify-email?token={verification_token}"
        background_tasks.add_task(send_verification_email, new_user.email, new_user.full_name, verification_url)

        return {"message": "Registration successful", "detail": "Please check your email to verify your account."}
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed. Email may already be in use."
        )


@router.post("/register/super-admin", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def register_super_admin(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Register the first super admin account (no authentication required)."""
    # Check if any super admin already exists
    existing_super_admin = db.query(User).filter(User.role == Role.SUPER_ADMIN).first()
    if existing_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin already exists. Use /register/admin for additional admins."
        )

    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    date_of_birth = None
    if user_data.date_of_birth:
        try:
            date_of_birth = datetime.strptime(user_data.date_of_birth, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD"
            )

    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        phone=user_data.phone,
        gender=user_data.gender,
        date_of_birth=date_of_birth,
        role=Role.SUPER_ADMIN,
        is_active=True,
        is_verified=True
    )

    try:
        db.add(new_user)
        db.commit()
        logger.info(f"Super admin created: {new_user.email}")
        return {"message": "Super admin account created successfully"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create super admin account"
        )


@router.post("/register/admin", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def register_admin(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register a new clinician/admin account (Super Admin only)."""
    if current_user.role != Role.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can create admin accounts"
        )

    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    date_of_birth = None
    if user_data.date_of_birth:
        try:
            date_of_birth = datetime.strptime(user_data.date_of_birth, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD"
            )

    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        phone=user_data.phone,
        gender=user_data.gender,
        date_of_birth=date_of_birth,
        role=Role.CLINICIAN_ADMIN,
        is_active=True,
        is_verified=True
    )

    try:
        db.add(new_user)
        db.commit()
        logger.info(f"Admin created: {new_user.email} by {current_user.email}")
        return {"message": "Admin account created successfully"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create admin account"
        )


@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT tokens."""
    logger.info(f"Login attempt for: {credentials.email}")

    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in"
        )

    token_data = {"sub": str(user.id), "email": user.email, "role": user.role.value}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    logger.info(f"User logged in: {user.email}")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value
        }
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(token: str, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    payload = decode_token(token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user = db.query(User).filter(User.id == int(payload.get("sub"))).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    token_data = {"sub": str(user.id), "email": user.email, "role": user.role.value}

    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value
        }
    }


@router.post("/verify-token", response_model=TokenVerifyResponse)
async def verify_token(request: TokenVerifyRequest):
    """Verify if a token is valid."""
    payload = decode_token(request.token)
    if payload is None:
        return {"valid": False}

    return {
        "valid": True,
        "user_id": int(payload.get("sub")),
        "email": payload.get("email"),
        "role": payload.get("role")
    }


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Request password reset email."""
    user = db.query(User).filter(User.email == request.email).first()

    if user:
        try:
            reset_token = create_password_reset_token(user.id, user.email)
            reset_url = f"{FRONTEND_URL}/reset-password?token={reset_token}"
            background_tasks.add_task(send_password_reset_email, user.email, user.full_name, reset_url)
            logger.info(f"Password reset email queued for: {user.email}")
        except Exception as e:
            logger.error(f"Failed to send password reset email: {e}")
            # Still return success to prevent email enumeration
            return {
                "message": "If an account exists, a password reset link has been sent.",
                "detail": "Check your email inbox and spam folder."
            }

    return {
        "message": "If an account exists, a password reset link has been sent.",
        "detail": "Check your email inbox and spam folder."
    }


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using token from email."""
    payload = decode_token(request.token)
    if payload is None or payload.get("type") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    user = db.query(User).filter(User.id == int(payload.get("sub"))).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.password_hash = hash_password(request.new_password)
    db.commit()

    logger.info(f"Password reset for: {user.email}")
    return {"message": "Password has been reset successfully"}


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(token: str, db: Session = Depends(get_db)):
    """Verify email using token from registration email."""
    payload = decode_token(token)
    if payload is None or payload.get("type") != "email_verification":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )

    user = db.query(User).filter(User.id == int(payload.get("sub"))).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.is_verified:
        return {"message": "Email already verified", "detail": "Your account is already active."}

    user.is_verified = True
    db.commit()

    logger.info(f"Email verified for: {user.email}")
    return {"message": "Email verified successfully", "detail": "Your account is now active. You can log in."}


@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Resend email verification link."""
    user = db.query(User).filter(User.email == request.email).first()

    if user and not user.is_verified:
        verification_token = create_email_verification_token(user.id, user.email)
        verification_url = f"{FRONTEND_URL}/verify-email?token={verification_token}"
        background_tasks.add_task(send_verification_email, user.email, user.full_name, verification_url)
        logger.info(f"Verification email resent to: {user.email}")

    return {
        "message": "If an unverified account exists, a verification link has been sent.",
        "detail": "Check your email inbox and spam folder."
    }


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user's profile."""
    return UserResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        gender=current_user.gender,
        date_of_birth=current_user.date_of_birth,
        profile_picture=current_user.profile_picture,
        role=current_user.role.value,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at
    )