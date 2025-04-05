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
