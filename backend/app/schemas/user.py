# File: app/schemas/user.py
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    graduation_year: Optional[int] = None
    major: Optional[str] = None
    profile_image_url: Optional[str] = None
    bio: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to receive via API on update
class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    graduation_year: Optional[int] = None
    major: Optional[str] = None
    profile_image_url: Optional[str] = None
    bio: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    password: Optional[str] = None

# Properties shared by models returned from API
class UserInDBBase(UserBase):
    id: int
    is_admin: bool = False
    created_at: datetime
    
    class Config:
        orm_mode = True

# Additional properties to return via API
class User(UserInDBBase):
    pass

# Properties stored in DB but not returned
class UserInDB(UserInDBBase):
    hashed_password: str
