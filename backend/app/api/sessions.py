"""
Session API endpoints for Séance backend.

This module provides REST endpoints for session management including
creation and retrieval of Séance sessions.
"""

from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from app.api.deps import get_db
from app.schemas.session import SessionCreate, SessionResponse
from app.services.session_service import (
    create_session,
    get_session,
    SessionNotFoundError,
)
from app.utils.logger import get_logger, log_api_error


router = APIRouter(prefix="/api/sessions", tags=["sessions"])
logger = get_logger(__name__)


def success_response(data: Any, status_code: int = 200) -> Dict[str, Any]:
    """
    Format successful API response.
    
    Args:
        data: Response data
        status_code: HTTP status code
        
    Returns:
        Formatted success response
    """
    return {
        "success": True,
        "data": data,
        "meta": {
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    }


def error_response(code: str, message: str, details: Dict = None) -> Dict[str, Any]:
    """
    Format error API response.
    
    Args:
        code: Error code
        message: Human-readable error message
        details: Optional additional error details
        
    Returns:
        Formatted error response
    """
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details or {}
        },
        "meta": {
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    }


@router.post(
    "",
    response_model=None,
    status_code=status.HTTP_201_CREATED,
    summary="Create new session",
    description="Create a new Séance session for multiple users to join",
    responses={
        201: {
            "description": "Session created successfully",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "data": {
                            "id": "550e8400-e29b-41d4-a716-446655440000",
                            "name": "Spooky Session",
                            "max_users": 6,
                            "created_at": "2025-11-10T12:00:00Z",
                            "is_active": True
                        },
                        "meta": {
                            "timestamp": "2025-11-10T12:00:01Z"
                        }
                    }
                }
            }
        },
        400: {
            "description": "Invalid input",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "error": {
                            "code": "VALIDATION_ERROR",
                            "message": "Invalid session data",
                            "details": {}
                        },
                        "meta": {
                            "timestamp": "2025-11-10T12:00:01Z"
                        }
                    }
                }
            }
        },
        500: {
            "description": "Internal server error"
        }
    }
)
async def create_session_endpoint(
    session_data: SessionCreate,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Create a new Séance session.
    
    Creates a new session with the provided name and maximum user count.
    Returns the created session with generated ID and timestamp.
    
    Args:
        session_data: Session creation data (name, max_users)
        db: Database session (injected)
        
    Returns:
        Success response with created session data
        
    Raises:
        HTTPException: 400 for validation errors, 500 for server errors
    """
    try:
        # Create session using service layer
        session = await create_session(session_data, db)
        
        # Log successful session creation
        logger.info(
            "session.created",
            session_id=session.id,
            session_name=session.name,
            max_users=session.max_users,
            event_type="session_created"
        )
        
        # Convert to response schema
        session_response = SessionResponse.model_validate(session)
        
        # Return formatted success response
        return success_response(
            data=session_response.model_dump(mode="json"),
            status_code=status.HTTP_201_CREATED
        )
        
    except SQLAlchemyError as e:
        # Log API error with structured logging
        log_api_error(
            error=e,
            endpoint="/api/sessions",
            method="POST",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            logger=logger,
            session_name=session_data.name
        )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_response(
                code="INTERNAL_ERROR",
                message="Failed to create session",
                details={"error": str(e)}
            )
        )
    except Exception as e:
        # Log API error with structured logging
        log_api_error(
            error=e,
            endpoint="/api/sessions",
            method="POST",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            logger=logger,
            session_name=session_data.name
        )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_response(
                code="INTERNAL_ERROR",
                message="An unexpected error occurred",
                details={"error": str(e)}
            )
        )


@router.get(
    "/{session_id}",
    response_model=None,
    status_code=status.HTTP_200_OK,
    summary="Get session details",
    description="Retrieve details of an existing Séance session by ID",
    responses={
        200: {
            "description": "Session retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "data": {
                            "id": "550e8400-e29b-41d4-a716-446655440000",
                            "name": "Spooky Session",
                            "max_users": 6,
                            "created_at": "2025-11-10T12:00:00Z",
                            "is_active": True
                        },
                        "meta": {
                            "timestamp": "2025-11-10T12:00:01Z"
                        }
                    }
                }
            }
        },
        404: {
            "description": "Session not found",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "error": {
                            "code": "SESSION_NOT_FOUND",
                            "message": "Session with id 'abc123' not found",
                            "details": {}
                        },
                        "meta": {
                            "timestamp": "2025-11-10T12:00:01Z"
                        }
                    }
                }
            }
        },
        500: {
            "description": "Internal server error"
        }
    }
)
async def get_session_endpoint(
    session_id: str,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get session by ID.
    
    Retrieves an existing session by its unique identifier.
    Returns session details including name, creation time, and status.
    
    Args:
        session_id: The session ID to retrieve
        db: Database session (injected)
        
    Returns:
        Success response with session data
        
    Raises:
        HTTPException: 404 if session not found, 500 for server errors
    """
    try:
        # Retrieve session using service layer
        session = await get_session(session_id, db)
        
        # Log successful session retrieval
        logger.info(
            "session.retrieved",
            session_id=session_id,
            session_name=session.name,
            event_type="session_retrieved"
        )
        
        # Convert to response schema
        session_response = SessionResponse.model_validate(session)
        
        # Return formatted success response
        return success_response(
            data=session_response.model_dump(mode="json"),
            status_code=status.HTTP_200_OK
        )
        
    except SessionNotFoundError as e:
        # Log not found error
        logger.warning(
            "session.not_found",
            session_id=session_id,
            event_type="session_not_found"
        )
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response(
                code="SESSION_NOT_FOUND",
                message=str(e),
                details={"session_id": session_id}
            )
        )
    except SQLAlchemyError as e:
        # Log API error with structured logging
        log_api_error(
            error=e,
            endpoint=f"/api/sessions/{session_id}",
            method="GET",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            logger=logger,
            session_id=session_id
        )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_response(
                code="INTERNAL_ERROR",
                message="Failed to retrieve session",
                details={"error": str(e)}
            )
        )
    except Exception as e:
        # Log API error with structured logging
        log_api_error(
            error=e,
            endpoint=f"/api/sessions/{session_id}",
            method="GET",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            logger=logger,
            session_id=session_id
        )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_response(
                code="INTERNAL_ERROR",
                message="An unexpected error occurred",
                details={"error": str(e)}
            )
        )
