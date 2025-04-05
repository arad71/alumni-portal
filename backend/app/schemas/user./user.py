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

# File: app/schemas/token.py
from typing import Optional
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[int] = None

# For login
class Login(BaseModel):
    email: EmailStr
    password: str

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

# File: app/schemas/registration.py
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

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

# File: app/schemas/payment.py
from pydantic import BaseModel
from typing import Optional

# For creating payment intents
class PaymentIntentCreate(BaseModel):
    amount: float
    event_id: Optional[int] = None
    membership_type: Optional[str] = None

# Response with client secret
class PaymentIntentResponse(BaseModel):
    client_secret: str
