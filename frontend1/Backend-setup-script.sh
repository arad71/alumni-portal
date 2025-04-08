#!/bin/bash

echo "=== Setting up Alumni Portal Backend ==="

# Create directory structure
mkdir -p alumni-portal/backend/app/{api,core,models,schemas,services}
mkdir -p alumni-portal/backend/alembic/versions

# Go to backend directory
cd alumni-portal/backend

# Create virtual environment
echo "Creating virtual environment..."
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows, use: venv\Scripts\activate

# Create requirements.txt
echo "Creating requirements.txt..."
cat > requirements.txt << 'EOF'
fastapi==0.103.1
uvicorn==0.23.2
sqlalchemy==2.0.21
psycopg2-binary==2.9.7
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
python-dotenv==1.0.0
alembic==1.12.0
stripe==6.5.0
pydantic==2.4.2
pydantic-settings==2.0.3
email-validator==2.0.0
EOF

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create .env file
echo "Creating .env file..."
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:postgres@localhost/alumni_portal
SECRET_KEY=43f9b9f9583def9c96430ad3e4507c8482e767cacce8042e638f1d5d447e83e4
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
STRIPE_SECRET_KEY=sk_test_example
STRIPE_WEBHOOK_SECRET=whsec_example
FRONTEND_URL=http://localhost:3000
EOF

# Create config.py
echo "Creating config.py..."
mkdir -p app/core
cat > app/core/config.py << 'EOF'
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    PROJECT_NAME: str = "Alumni Portal"
    API_V1_STR: str = "/api"
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
EOF

# Create security.py
echo "Creating security.py..."
cat > app/core/security.py << 'EOF'
from datetime import datetime, timedelta
from typing import Any, Union, Optional

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT token with the given subject and expiration
    
    Args:
        subject: The subject of the token (typically user ID)
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT token as string
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against
        
    Returns:
        True if the password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Hash a password
    
    Args:
        password: Plain text password to hash
        
    Returns:
        Hashed password
    """
    return pwd_context.hash(password)
EOF

# Create database.py
echo "Creating database.py..."
cat > app/database.py << 'EOF'
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Create SQLAlchemy engine
engine = create_engine(settings.DATABASE_URL)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# DB Session Dependency
def get_db():
    """
    Dependency for getting DB session.
    Yields a SQLAlchemy session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
EOF

# Create models
echo "Creating models..."
cat > app/models/all_models.py << 'EOF'
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Text, DateTime, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    graduation_year = Column(Integer)
    major = Column(String)
    profile_image_url = Column(String)
    bio = Column(Text)
    job_title = Column(String)
    company = Column(String)
    location = Column(String)
    is_admin = Column(Boolean, default=False)
    reset_token = Column(String)
    reset_token_expiry = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    registrations = relationship("Registration", back_populates="user")
    memberships = relationship("Membership", back_populates="user")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    event_date = Column(DateTime, nullable=False)
    location = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    capacity = Column(Integer)
    image_url = Column(String)
    is_members_only = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    registrations = relationship("Registration", back_populates="event")


class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"))
    payment_status = Column(String, nullable=False)
    payment_intent_id = Column(String)
    amount_paid = Column(Float, nullable=False)
    registered_at = Column(DateTime(timezone=True), server_default=func.now())
    attended = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="registrations")
    event = relationship("Event", back_populates="registrations")


class Membership(Base):
    __tablename__ = "memberships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    membership_type = Column(String, nullable=False)
    payment_id = Column(String)
    amount_paid = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="memberships")
EOF

# Create __init__.py files
echo "Creating __init__.py files..."
touch app/__init__.py
touch app/api/__init__.py
touch app/core/__init__.py
touch app/models/__init__.py
touch app/schemas/__init__.py
touch app/services/__init__.py

# Create main.py
echo "Creating main.py..."
cat > app/main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from app.api import auth
from app.core.config import settings
from app.database import engine, Base

# Create database tables (in production, use Alembic migrations instead)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Alumni Portal API",
    description="API for alumni management with events, memberships, and directory",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])

@app.get("/", tags=["health"])
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Alumni Portal API is running"}
EOF

# Create auth.py
echo "Creating auth.py..."
cat > app/api/auth.py << 'EOF'
from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.core.config import settings
from app.core.security import create_access_token, verify_password, get_password_hash
from app.models.all_models import User, Membership

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Dependency to get current user from token
async def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """
    Dependency that returns the current authenticated user
    
    Args:
        db: Database session
        token: JWT token from the Authorization header
        
    Returns:
        The current authenticated user
        
    Raises:
        HTTPException: If authentication fails
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

# Dependency to verify user has admin role
def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency that ensures the current user is an admin
    
    Args:
        current_user: The current authenticated user
        
    Returns:
        The current authenticated admin user
        
    Raises:
        HTTPException: If the user is not an admin
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user

# Dependency to check if user has membership
async def check_membership(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency that ensures the current user has an active membership
    
    Args:
        db: Database session
        current_user: The current authenticated user
        
    Returns:
        The current authenticated user with membership
        
    Raises:
        HTTPException: If the user doesn't have an active membership
    """
    # Admins bypass membership check
    if current_user.is_admin:
        return current_user
        
    # Check for active membership
    membership = (
        db.query(Membership)
        .filter(
            Membership.user_id == current_user.id,
            Membership.is_active == True,
            Membership.end_date >= func.current_date()
        )
        .first()
    )
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Active membership required for this resource",
        )
        
    return current_user

@router.post("/login", status_code=status.HTTP_200_OK)
async def login(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> dict:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.get("/me", status_code=status.HTTP_200_OK)
async def read_users_me(current_user: User = Depends(get_current_user)) -> dict:
    """
    Get current user
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "firstName": current_user.first_name,
        "lastName": current_user.last_name,
        "graduationYear": current_user.graduation_year,
        "major": current_user.major,
        "profileImageUrl": current_user.profile_image_url,
        "jobTitle": current_user.job_title,
        "company": current_user.company,
        "location": current_user.location,
        "isAdmin": current_user.is_admin
    }

@router.post("/test-token", status_code=status.HTTP_200_OK)
async def test_token(current_user: User = Depends(get_current_user)) -> dict:
    """
    Test access token
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "firstName": current_user.first_name,
        "lastName": current_user.last_name,
        "isAdmin": current_user.is_admin
    }
EOF

# Create alembic.ini and env.py
echo "Creating Alembic configuration..."
alembic init alembic

# Update alembic.ini
sed -i 's|sqlalchemy.url = driver://user:pass@localhost/dbname|sqlalchemy.url = postgresql://postgres:postgres@localhost/alumni_portal|' alembic.ini || \
    sed -i "" 's|sqlalchemy.url = driver://user:pass@localhost/dbname|sqlalchemy.url = postgresql://postgres:postgres@localhost/alumni_portal|' alembic.ini

# Update alembic/env.py
cat > alembic/env.py << 'EOF'
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

from app.models.all_models import Base
from app.core.config import settings

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.

# Override sqlalchemy.url with value from settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
EOF

# Create admin user script
echo "Creating admin user script..."
cat > create_admin.py << 'EOF'
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL environment variable not set")
    sys.exit(1)

print(f"Connecting to database: {DATABASE_URL}")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # Check if admin user already exists
    result = db.execute(text("SELECT * FROM users WHERE email = 'admin@alumni.org'")).fetchall()
    
    if result:
        print("Admin user already exists")
        
        # Update admin password
        password = "admin123"
        hashed_password = get_password_hash(password)
        
        db.execute(
            text("UPDATE users SET hashed_password = :hashed_password WHERE email = 'admin@alumni.org'"),
            {"hashed_password": hashed_password}
        )
        db.commit()
        print(f"Admin password updated to: {password}")
    else:
        # Create admin user
        password = "admin123"
        hashed_password = get_password_hash(password)
        
        db.execute(
            text("""
                INSERT INTO users 
                (email, hashed_password, first_name, last_name, is_admin) 
                VALUES 
                (:email, :password_hash, :first_name, :last_name, :is_admin)
            """),
            {
                "email": "admin@alumni.org",
                "password_hash": hashed_password,
                "first_name": "Admin",
                "last_name": "User",
                "is_admin": True
            }
        )
        db.commit()
        print(f"Admin user created with email: admin@alumni.org and password: {password}")
    
    # Verify admin exists
    result = db.execute(text("SELECT id, email, first_name, last_name, is_admin FROM users WHERE email = 'admin@alumni.org'")).fetchone()
    if result:
        print("Admin user verification:")
        print(f"ID: {result.id}")
        print(f"Email: {result.email}")
        print(f"Name: {result.first_name} {result.last_name}")
        print(f"Is Admin: {result.is_admin}")
    
except Exception as e:
    print(f"Error: {e}")
    db.rollback()

finally:
    db.close()
    print("Database connection closed")
EOF

echo "=== Backend setup complete! ==="
echo "To start the backend server:"
echo "1. Create the database: createdb alumni_portal"
echo "2. Apply migrations: alembic upgrade head"
echo "3. Create admin user: python create_admin.py"
echo "4. Start the server: uvicorn app.main:app --reload"
