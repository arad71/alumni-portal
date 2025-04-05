# File: app/schemas/event.py
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

# Shared properties
class EventBase(BaseModel):
    title: str
    description: str
    event_date: datetime
    location: str
    price: float
    capacity: Optional[int] = None
    image_url: Optional[str] = None
    is_members_only: bool = False

# Properties to receive via API on creation
class EventCreate(EventBase):
    pass

# Properties to receive via API on update
class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[datetime] = None
    location: Optional[str] = None
    price: Optional[float] = None
    capacity: Optional[int] = None
    image_url: Optional[str] = None
    is_members_only: Optional[bool] = None

# Properties shared by models returned from API
class EventInDBBase(EventBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

# Additional properties to return via API
class Event(EventInDBBase):
    registered_count: Optional[int] = None
    is_registered: Optional[bool] = None