
# File: app/schemas/token.py
from typing import Optional
from pydantic import BaseModel
from pydantic.networks import  EmailStr
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[int] = None

# For login
class Login(BaseModel):
    email: EmailStr
    password: str