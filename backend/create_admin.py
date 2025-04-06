# File: create_admin.py
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

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
    print("Please make sure your .env file contains DATABASE_URL")
    exit(1)

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
            text("UPDATE users SET password_hash = :hashed_password WHERE email = 'admin@alumni.org'"),
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
                (email, password_hash, first_name, last_name, is_admin) 
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
