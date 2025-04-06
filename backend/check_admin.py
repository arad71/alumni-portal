# Create a test script to check if admin exists
# Save as check_admin.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from passlib.context import CryptContext

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Query to find admin user
result = db.execute("SELECT * FROM users WHERE email = 'admin@alumni.org'").fetchall()

if result:
    print("Admin user found:")
    for row in result:
        print(row)
        
    # Verify password hash (optional)
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    stored_hash = result[0].password_hash  # Adjust column name if different
    test_password = "admin123"
    is_match = pwd_context.verify(test_password, stored_hash)
    print(f"Password match: {is_match}")
else:
    print("Admin user not found!")
