"""
Séance Backend - Main FastAPI Application

AI-powered digital Ouija board backend with real-time WebSocket support
for multi-user séance sessions.

This module initializes the FastAPI application, configures middleware,
includes routers, and sets up exception handlers.
"""

from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy import text

from app.config import settings
from app.api import sessions, websocket
from app.api.endpoints import tts
from app.db.session import engine
from app.utils.logger import get_logger, log_api_error


# Initialize logger
logger = get_logger(__name__)

# Create FastAPI application with metadata
app = FastAPI(
    title="Séance API",
    description=(
        "AI-powered digital Ouija board backend with real-time WebSocket support. "
        "Create multi-user séance sessions and communicate with an AI spirit through "
        "a beautifully animated Ouija board interface."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    contact={
        "name": "Séance Team",
        "url": "https://github.com/yourusername/seance",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)


# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Include routers
app.include_router(sessions.router)
app.include_router(websocket.router)
app.include_router(tts.router, prefix="/api/tts", tags=["tts"])


# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handle HTTPException with consistent error response format.
    
    Args:
        request: The incoming request
        exc: The HTTPException that was raised
        
    Returns:
        JSONResponse with formatted error
    """
    # Log the HTTP exception
    log_api_error(
        error=exc,
        endpoint=str(request.url.path),
        method=request.method,
        status_code=exc.status_code,
        logger=logger
    )
    
    # If detail is already formatted (dict), use it directly
    if isinstance(exc.detail, dict):
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.detail
        )
    
    # Otherwise, format the error response
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": "HTTP_ERROR",
                "message": str(exc.detail),
                "details": {}
            },
            "meta": {
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle all unhandled exceptions with consistent error response format.
    
    Args:
        request: The incoming request
        exc: The exception that was raised
        
    Returns:
        JSONResponse with formatted error
    """
    # Log the unexpected exception
    log_api_error(
        error=exc,
        endpoint=str(request.url.path),
        method=request.method,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        logger=logger
    )
    
    # Return formatted error response
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "details": {
                    "error": str(exc) if settings.is_development else "Internal server error"
                }
            },
            "meta": {
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        }
    )


# Root endpoint - redirect to docs
@app.get(
    "/",
    include_in_schema=False,
    summary="Root endpoint",
    description="Redirects to API documentation"
)
async def root() -> RedirectResponse:
    """
    Root endpoint that redirects to API documentation.
    
    Returns:
        RedirectResponse to /docs
    """
    return RedirectResponse(url="/docs")


# Health check endpoint
@app.get(
    "/health",
    tags=["health"],
    summary="Health check",
    description="Check API and database connectivity status",
    responses={
        200: {
            "description": "Service is healthy",
            "content": {
                "application/json": {
                    "example": {
                        "status": "healthy",
                        "database": "connected",
                        "environment": "development",
                        "timestamp": "2025-11-10T12:00:00Z"
                    }
                }
            }
        },
        503: {
            "description": "Service is unhealthy",
            "content": {
                "application/json": {
                    "example": {
                        "status": "unhealthy",
                        "database": "disconnected",
                        "environment": "development",
                        "timestamp": "2025-11-10T12:00:00Z",
                        "error": "Database connection failed"
                    }
                }
            }
        }
    }
)
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint.
    
    Checks the status of the API and database connectivity.
    Returns 200 if healthy, 503 if unhealthy.
    
    Returns:
        Health status information including database connectivity
        
    Raises:
        HTTPException: 503 if database is not accessible
    """
    health_status = {
        "status": "healthy",
        "database": "unknown",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    # Check database connectivity
    try:
        async with engine.connect() as conn:
            # Execute a simple query to verify connection
            await conn.execute(text("SELECT 1"))
            health_status["database"] = "connected"
            
        logger.info(
            "health_check.success",
            database_status="connected",
            event_type="health_check"
        )
        
        return health_status
        
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["database"] = "disconnected"
        health_status["error"] = str(e)
        
        logger.error(
            "health_check.failed",
            database_status="disconnected",
            error=str(e),
            event_type="health_check"
        )
        
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=health_status
        )


# Startup event
@app.on_event("startup")
async def startup_event():
    """
    Application startup event handler.
    
    Logs application startup and configuration information.
    """
    logger.info(
        "application.startup",
        environment=settings.ENVIRONMENT,
        cors_origins=settings.CORS_ORIGINS,
        database_url=settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else "configured",
        event_type="startup"
    )


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """
    Application shutdown event handler.
    
    Logs application shutdown and performs cleanup.
    """
    logger.info(
        "application.shutdown",
        event_type="shutdown"
    )
    
    # Dispose of database engine
    await engine.dispose()
