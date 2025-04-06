# File: app/models/all_models.py
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

