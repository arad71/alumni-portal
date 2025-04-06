# File: app/api/memberships.py
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime, timedelta

from app import models, schemas
from app.database import get_db
from app.api.auth import get_current_user, get_current_admin

router = APIRouter()

@router.post("/", response_model=schemas.Membership, status_code=status.HTTP_201_CREATED)
def create_membership(
    *,
    db: Session = Depends(get_db),
    membership_in: schemas.MembershipCreate,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Create a new membership
    """
    # Check if user already has active membership
    existing_membership = db.query(models.Membership).filter(
        models.Membership.user_id == current_user.id,
        models.Membership.end_date >= func.current_date(),
        models.Membership.is_active == True
    ).first()
    
    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active membership",
        )
    
    # Set start and end dates
    start_date = date.today()
    end_date = start_date
    
    if membership_in.membership_type == "monthly":
        end_date = start_date + timedelta(days=30)
    elif membership_in.membership_type == "annual":
        end_date = date(start_date.year + 1, start_date.month, start_date.day)
    elif membership_in.membership_type == "lifetime":
        # Set a very far future date for "lifetime"
        end_date = date(start_date.year + 99, start_date.month, start_date.day)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid membership type",
        )
    
    # Create membership
    membership = models.Membership(
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
        membership_type=membership_in.membership_type,
        payment_id=membership_in.payment_id,
        amount_paid=membership_in.amount_paid,
        is_active=True
    )
    
    db.add(membership)
    db.commit()
    db.refresh(membership)
    
    return membership

@router.get("/my-membership", response_model=Dict[str, Any])
def read_user_membership(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get current user's active membership
    """
    membership = db.query(models.Membership).filter(
        models.Membership.user_id == current_user.id,
        models.Membership.end_date >= func.current_date(),
        models.Membership.is_active == True
    ).order_by(models.Membership.end_date.desc()).first()
    
    if not membership:
        return {"has_membership": False}
    
    return {
        "has_membership": True,
        "membership": membership
    }

@router.put("/{membership_id}/cancel", response_model=schemas.Membership)
def cancel_membership(
    *,
    db: Session = Depends(get_db),
    membership_id: int,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Cancel a membership
    """
    # Get membership
    membership = db.query(models.Membership).filter(
        models.Membership.id == membership_id
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membership not found",
        )
    
    # Check if membership belongs to current user
    if membership.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this membership",
        )
    
    # Cancel membership
    membership.is_active = False
    db.add(membership)
    db.commit()
    db.refresh(membership)
    
    return membership

@router.get("/", response_model=List[schemas.Membership])
def read_memberships(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_admin: models.User = Depends(get_current_admin),
) -> Any:
    """
    Get all memberships (admin only)
    """
    memberships = db.query(models.Membership).offset(skip).limit(limit).all()
    return memberships

@router.get("/stats", response_model=Dict[str, Any])
def get_membership_stats(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin),
) -> Any:
    """
    Get membership statistics (admin only)
    """
    # Active memberships by type
    type_stats = db.query(
        models.Membership.membership_type,
        func.count(models.Membership.id).label("count")
    ).filter(
        models.Membership.end_date >= func.current_date(),
        models.Membership.is_active == True
    ).group_by(models.Membership.membership_type).all()
    
    # Total active memberships
    active_count = db.query(models.Membership).filter(
        models.Membership.end_date >= func.current_date(),
        models.Membership.is_active == True
    ).count()
    
    # New memberships in last 30 days
    thirty_days_ago = datetime.now() - timedelta(days=30)
    new_count = db.query(models.Membership).filter(
        models.Membership.created_at >= thirty_days_ago
    ).count()
    
    # Expiring memberships in next 30 days
    thirty_days_from_now = date.today() + timedelta(days=30)
    expiring_count = db.query(models.Membership).filter(
        models.Membership.end_date <= thirty_days_from_now,
        models.Membership.end_date >= func.current_date(),
        models.Membership.is_active == True
    ).count()
    
    # Total revenue
    revenue_result = db.query(func.sum(models.Membership.amount_paid)).scalar()
    total_revenue = float(revenue_result) if revenue_result else 0
    
    return {
        "by_type": [{"type": t, "count": c} for t, c in type_stats],
        "active_memberships": active_count,
        "new_memberships": new_count,
        "expiring_memberships": expiring_count,
        "total_revenue": total_revenue
    }
