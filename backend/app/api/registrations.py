# File: app/api/registrations.py
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models, schemas
from app.database import get_db
from app.api.auth import get_current_user, get_current_admin

router = APIRouter()

@router.post("/", response_model=schemas.Registration, status_code=status.HTTP_201_CREATED)
def create_registration(
    *,
    db: Session = Depends(get_db),
    registration_in: schemas.RegistrationCreate,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Create a new registration after payment
    """
    # Check if event exists
    event = db.query(models.Event).filter(models.Event.id == registration_in.event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    
    # Check if members-only event
    if event.is_members_only:
        # Check membership
        membership = db.query(models.Membership).filter(
            models.Membership.user_id == current_user.id,
            models.Membership.is_active == True,
            models.Membership.end_date >= func.current_date()
        ).first()
        
        if not membership and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Membership required for this event",
            )
    
    # Check if already registered
    existing_registration = db.query(models.Registration).filter(
        models.Registration.event_id == event.id,
        models.Registration.user_id == current_user.id
    ).first()
    
    if existing_registration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already registered for this event",
        )
    
    # Check event capacity
    if event.capacity:
        registration_count = db.query(models.Registration).filter(
            models.Registration.event_id == event.id
        ).count()
        
        if registration_count >= event.capacity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event is at capacity",
            )
    
    # Create registration
    registration = models.Registration(
        user_id=current_user.id,
        event_id=event.id,
        payment_status="paid",
        payment_intent_id=registration_in.payment_intent_id,
        amount_paid=event.price,
    )
    
    db.add(registration)
    db.commit()
    db.refresh(registration)
    
    return registration

@router.get("/my-events", response_model=List[schemas.Event])
def read_user_registrations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get current user's registered events
    """
    # Get user's registrations with events
    registrations = db.query(models.Registration).filter(
        models.Registration.user_id == current_user.id
    ).all()
    
    # Get events for these registrations
    event_ids = [reg.event_id for reg in registrations]
    events = db.query(models.Event).filter(models.Event.id.in_(event_ids)).all()
    
    # Add registration status to events
    for event in events:
        event.is_registered = True
    
    return events

@router.get("/event/{event_id}", response_model=List[schemas.Registration])
def read_event_registrations(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    current_admin: models.User = Depends(get_current_admin),
) -> Any:
    """
    Get all registrations for an event (admin only)
    """
    # Check if event exists
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    
    # Get registrations
    registrations = db.query(models.Registration).filter(
        models.Registration.event_id == event_id
    ).all()
    
    return registrations

@router.put("/{registration_id}/attendance", response_model=schemas.Registration)
def update_attendance(
    *,
    db: Session = Depends(get_db),
    registration_id: int,
    attended: bool,
    current_admin: models.User = Depends(get_current_admin),
) -> Any:
    """
    Update attendance status (admin only)
    """
    registration = db.query(models.Registration).filter(
        models.Registration.id == registration_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found",
        )
    
    registration.attended = attended
    db.add(registration)
    db.commit()
    db.refresh(registration)
    
    return registration

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_registration(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    current_user: models.User = Depends(get_current_user),
) -> None:
    """
    Cancel registration
    """
    # Check if event exists
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    
    # Check if event date is in the future
    if event.event_date <= func.now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel registration for past or ongoing events",
        )
    
    # Get registration
    registration = db.query(models.Registration).filter(
        models.Registration.event_id == event_id,
        models.Registration.user_id == current_user.id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found",
        )
    
    # Delete registration
    db.delete(registration)
    db.commit()
