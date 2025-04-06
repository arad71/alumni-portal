# File: app/api/events.py
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models, schemas
from app.database import get_db
from app.api.auth import get_current_user, get_current_admin, check_membership

router = APIRouter()

@router.get("/", response_model=List[schemas.Event])
def read_events(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Optional[models.User] = Depends(get_current_user),
) -> Any:
    """
    Retrieve events.
    """
    # Base query for all events
    query = db.query(models.Event)
    
    # For unauthenticated users, show only public events
    if current_user is None:
        query = query.filter(models.Event.is_members_only == False)
    # For regular users without membership, also show only public events
    elif not current_user.is_admin:
        # Check if user has active membership
        membership = db.query(models.Membership).filter(
            models.Membership.user_id == current_user.id,
            models.Membership.is_active == True,
            models.Membership.end_date >= func.current_date()
        ).first()
        
        if not membership:
            query = query.filter(models.Event.is_members_only == False)
    
    # Apply pagination
    events = query.offset(skip).limit(limit).all()
    
    # Add additional information for authenticated users
    if current_user:
        for event in events:
            # Get registration count
            event.registered_count = db.query(models.Registration).filter(
                models.Registration.event_id == event.id
            ).count()
            
            # Check if current user is registered
            registration = db.query(models.Registration).filter(
                models.Registration.event_id == event.id,
                models.Registration.user_id == current_user.id
            ).first()
            
            event.is_registered = registration is not None
    
    return events

@router.post("/", response_model=schemas.Event, status_code=status.HTTP_201_CREATED)
def create_event(
    *,
    db: Session = Depends(get_db),
    event_in: schemas.EventCreate,
    current_admin: models.User = Depends(get_current_admin),
) -> Any:
    """
    Create new event (admin only).
    """
    event = models.Event(
        title=event_in.title,
        description=event_in.description,
        event_date=event_in.event_date,
        location=event_in.location,
        price=event_in.price,
        capacity=event_in.capacity,
        image_url=event_in.image_url,
        is_members_only=event_in.is_members_only,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.get("/{event_id}", response_model=schemas.Event)
def read_event(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    current_user: Optional[models.User] = Depends(get_current_user),
) -> Any:
    """
    Get event by ID.
    """
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    
    # Check access for members-only events
    if event.is_members_only:
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required for this event",
            )
        
        # If not admin, check membership
        if not current_user.is_admin:
            membership = db.query(models.Membership).filter(
                models.Membership.user_id == current_user.id,
                models.Membership.is_active == True,
                models.Membership.end_date >= func.current_date()
            ).first()
            
            if not membership:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Membership required for this event",
                )
    
    # Add additional information for authenticated users
    if current_user:
        # Get registration count
        event.registered_count = db.query(models.Registration).filter(
            models.Registration.event_id == event.id
        ).count()
        
        # Check if current user is registered
        registration = db.query(models.Registration).filter(
            models.Registration.event_id == event.id,
            models.Registration.user_id == current_user.id
        ).first()
        
        event.is_registered = registration is not None
    
    return event

@router.put("/{event_id}", response_model=schemas.Event)
def update_event(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    event_in: schemas.EventUpdate,
    current_admin: models.User = Depends(get_current_admin),
) -> Any:
    """
    Update an event (admin only).
    """
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    
    # Update event attributes
    event_data = event_in.dict(exclude_unset=True)
    for key, value in event_data.items():
        setattr(event, key, value)
    
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    *,
    db: Session = Depends(get_db),
    event_id: int,
    current_admin: models.User = Depends(get_current_admin),
) -> None:
    """
    Delete an event (admin only).
    """
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    
    db.delete(event)
    db.commit()
