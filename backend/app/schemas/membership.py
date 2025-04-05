# File: app/schemas/membership.py
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, date

# Shared properties
class MembershipBase(BaseModel):
    membership_type: str
    start_date: date
    end_date: date
    amount_paid: float
    is_active: bool = True

# Properties to receive via API on creation
class MembershipCreate(BaseModel):
    membership_type: str
    payment_id: str
    amount_paid: float

# Properties to receive via API on update
class MembershipUpdate(BaseModel):
    is_active: Optional[bool] = None

# Properties shared by models returned from API
class MembershipInDBBase(MembershipBase):
    id: int
    user_id: int
    payment_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        orm_mode = True

# Additional properties to return via API
class Membership(MembershipInDBBase):
    pass
