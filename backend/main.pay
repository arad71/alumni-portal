from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from app.api import auth, users, events, registrations, memberships, payments
from app.core.config import settings
from app.database import engine, Base, get_db
import app.models.all_models  # Import all models to ensure they're registered with SQLAlchemy

# Create database tables (in production, use Alembic migrations instead)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Alumni Portal API",
    description="API for alumni management with events, memberships, and directory",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, tags=["authentication"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(events.router, prefix="/events", tags=["events"])
app.include_router(registrations.router, prefix="/registrations", tags=["registrations"])
app.include_router(memberships.router, prefix="/memberships", tags=["memberships"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])

@app.get("/", tags=["health"])
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Alumni Portal API is running"}
