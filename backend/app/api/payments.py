# File: app/api/payments.py
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
import stripe
from datetime import date, datetime, timedelta

from app import models, schemas
from app.database import get_db
from app.api.auth import get_current_user
from app.core.config import settings

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter()

@router.post("/create-intent", response_model=schemas.PaymentIntentResponse)
async def create_payment_intent(
    *,
    db: Session = Depends(get_db),
    payment_data: schemas.PaymentIntentCreate,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Create a payment intent for event registration or membership
    """
    try:
        metadata = {
            "user_id": str(current_user.id),
        }
        
        # For event registration
        if payment_data.event_id:
            # Check if event exists
            event = db.query(models.Event).filter(models.Event.id == payment_data.event_id).first()
            if not event:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Event not found",
                )
            
            # Check if event is members only
            if event.is_members_only:
                # Check membership
                membership = db.query(models.Membership).filter(
                    models.Membership.user_id == current_user.id,
                    models.Membership.end_date >= func.current_date(),
                    models.Membership.is_active == True
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
            
            # Add event metadata
            metadata["event_id"] = str(payment_data.event_id)
            metadata["type"] = "event"
        
        # For membership
        elif payment_data.membership_type:
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
            
            # Add membership metadata
            metadata["membership_type"] = payment_data.membership_type
            metadata["type"] = "membership"
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either event_id or membership_type must be provided",
            )
        
        # Create payment intent
        intent = stripe.PaymentIntent.create(
            amount=int(payment_data.amount * 100),  # convert to cents
            currency="usd",
            metadata=metadata,
        )
        
        return {"client_secret": intent.client_secret}
    
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}",
        )

@router.post("/webhook", status_code=status.HTTP_200_OK)
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Handle Stripe webhook events
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        
        # Process the payment
        handle_successful_payment(db, payment_intent)
    
    return {"status": "success"}

def handle_successful_payment(db: Session, payment_intent):
    """
    Process successful payments - create registration or membership
    """
    metadata = payment_intent.metadata
    user_id = int(metadata.get("user_id"))
    payment_type = metadata.get("type")
    
    if payment_type == "event":
        event_id = int(metadata.get("event_id"))
        
        # Get event price
        event = db.query(models.Event).filter(models.Event.id == event_id).first()
        if not event:
            return
        
        # Create registration
        registration = models.Registration(
            user_id=user_id,
            event_id=event_id,
            payment_status="paid",
            payment_intent_id=payment_intent.id,
            amount_paid=event.price,
        )
        
        db.add(registration)
        db.commit()
    
    elif payment_type == "membership":
        membership_type = metadata.get("membership_type")
        
        # Set dates based on membership type
        start_date = date.today()
        end_date = start_date
        
        if membership_type == "monthly":
            end_date = start_date + timedelta(days=30)
        elif membership_type == "annual":
            end_date = date(start_date.year + 1, start_date.month, start_date.day)
        elif membership_type == "lifetime":
            end_date = date(start_date.year + 99, start_date.month, start_date.day)
        
        # Create membership
        membership = models.Membership(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            membership_type=membership_type,
            payment_id=payment_intent.id,
            amount_paid=payment_intent.amount / 100,  # convert from cents
            is_active=True,
        )
        
        db.add(membership)
        db.commit()

@router.get("/config", response_model=Dict[str, str])
async def get_stripe_config() -> Dict[str, str]:
    """
    Return the Stripe publishable key
    """
    return {"publishableKey": settings.STRIPE_PUBLISHABLE_KEY}
