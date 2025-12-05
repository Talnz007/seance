"""
Session service for business logic.

This module handles session creation, retrieval, and management
with business rule validation and error handling.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from app.models.session import Session
from app.schemas.session import SessionCreate, SessionResponse


class SessionNotFoundError(Exception):
    """Raised when a session is not found."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        super().__init__(f"Session with id '{session_id}' not found")


class SessionValidationError(Exception):
    """Raised when session data validation fails."""

    pass


async def create_session(
    data: SessionCreate,
    db: AsyncSession
) -> Session:
    """
    Create a new Séance session.
    
    Generates a UUID for the session ID, sets the creation timestamp,
    and persists to the database. Input validation is handled by Pydantic schema.
    
    Args:
        data: Session creation data (name, max_users)
        db: Database session
        
    Returns:
        Created session model
        
    Raises:
        SQLAlchemyError: If database operation fails
        
    Business Rules:
        - Session name must be 1-100 characters (validated by schema)
        - max_users must be between 2-12 (validated by schema)
        - Default max_users is 6
        - Session ID is auto-generated UUID
        - created_at is set to current UTC time
        - is_active defaults to True
    """
    try:
        # Generate UUID for session ID
        session_id = str(uuid.uuid4())
        
        # Create session model with UTC timestamp
        session = Session(
            id=session_id,
            name=data.name,
            created_at=datetime.now(timezone.utc),
            max_users=data.max_users,
            is_active=True
        )
        
        # Add to database
        db.add(session)
        await db.flush()
        await db.refresh(session)
        
        return session
        
    except SQLAlchemyError as e:
        raise SQLAlchemyError(f"Database error creating session: {str(e)}")


async def get_session(
    session_id: str,
    db: AsyncSession
) -> Session:
    """
    Retrieve a session by ID.
    
    Args:
        session_id: The session ID to retrieve
        db: Database session
        
    Returns:
        Session model if found
        
    Raises:
        SessionNotFoundError: If session doesn't exist
        SQLAlchemyError: If database operation fails
    """
    try:
        # Query session by ID
        result = await db.execute(
            select(Session).where(Session.id == session_id)
        )
        session = result.scalar_one_or_none()
        
        if session is None:
            raise SessionNotFoundError(session_id)
        
        return session
        
    except SessionNotFoundError:
        raise
    except SQLAlchemyError as e:
        raise SQLAlchemyError(f"Database error retrieving session: {str(e)}")
