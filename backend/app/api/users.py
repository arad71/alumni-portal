from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.api.auth import get_current_user, get_current_admin, check_membership
from app.core.security import get_password_hash

router = APIRouter()

@router.get("/", response_model=List[schemas.User])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_admin: models.User = Depends(get_current_admin),
) -> Any:
    """
    Get all users (admin only)
    """
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.get("/me", response_model=schemas.User)
def read_user_me(
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get current user
    """
    return current_user

@router.put("/me", response_model=schemas.User)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Update own user details
    """
    user_data = user_in.dict(exclude_unset=True)
    
    # If password is being updated, hash it
    if "password" in user_data:
        user_data["hashed_password"] = get_password_hash(user_data.pop("password"))
    
    # Update attributes
    for key, value in user_data.items():
        setattr(current_user, key, value)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/search", response_model=List[schemas.User])
def search_users(
    *,
    db: Session = Depends(get_db),
    name: str = None,
    graduation_year: int = None,
    major: str = None,
    company: str = None,
    location: str = None,
    skip: int = 0,
    limit: int = 20,
    current_user: models.User = Depends(check_membership),
) -> Any:
    """
    Search alumni directory (requires membership)
    """
    query = db.query(models.User)
    
    # Apply filters if provided
    if name:
        query = query.filter(
            (models.User.first_name.ilike(f"%{name}%")) | 
            (models.User.last_name.ilike(f"%{name}%"))
        )
    if graduation_year:
        query = query.filter(models.User.graduation_year == graduation_year)
    if major:
        query = query.filter(models.User.major.ilike(f"%{major}%"))
    if company:
        query = query.filter(models.User.company.ilike(f"%{company}%"))
    if location:
        query = query.filter(models.User.location.ilike(f"%{location}%"))
    
    # Apply pagination
    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=schemas.User)
def read_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    current_user: models.User = Depends(check_membership),
) -> Any:
    """
    Get a specific user (requires membership)
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user
