# File: app/schemas/registration.py
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from app.schemas.event import Event
# Shared properties
class RegistrationBase(BaseModel):
    event_id: int
    payment_status: str
    amount_paid: float
    attended: bool = False

# Properties to receive via API on creation
class RegistrationCreate(BaseModel):
    event_id: int
    payment_intent_id: str

# Properties to receive via API on update
class RegistrationUpdate(BaseModel):
    attended: Optional[bool] = None

# Properties shared by models returned from API
class RegistrationInDBBase(RegistrationBase):
    id: int
    user_id: int
    payment_intent_id: Optional[str] = None
    registered_at: datetime
    
    class Config:
        orm_mode = True

# Additional properties to return via API
class Registration(RegistrationInDBBase):
    pass

# With event details
class RegistrationWithEvent(Registration):
    event: Event