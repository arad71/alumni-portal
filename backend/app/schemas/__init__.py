# Import schemas to make them available when importing from app.schemas
from app.schemas.user import User, UserCreate, UserUpdate, UserInDB
from app.schemas.token import Token, TokenPayload, Login
from app.schemas.event import Event, EventCreate, EventUpdate
from app.schemas.registration import Registration, RegistrationCreate, RegistrationUpdate
from app.schemas.membership import Membership, MembershipCreate, MembershipUpdate

# This makes "from app.schemas import Token" work
__all__ = [
    "User", "UserCreate", "UserUpdate", "UserInDB",
    "Token", "TokenPayload", "Login",
    "Event", "EventCreate", "EventUpdate",
    "Registration", "RegistrationCreate", "RegistrationUpdate",
    "Membership", "MembershipCreate", "MembershipUpdate"
]
