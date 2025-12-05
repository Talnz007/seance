"""
Dependency injection functions for FastAPI routes.

This module provides reusable dependencies for API endpoints,
including database session management and authentication.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db as _get_db


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Get database session dependency.
    
    Provides an async database session for FastAPI routes with
    automatic transaction management and cleanup.
    
    Yields:
        AsyncSession: Database session for the request
        
    Example:
        from fastapi import Depends
        from app.api.deps import get_db
        
        @router.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            # Use db session
            pass
    """
    async for session in _get_db():
        yield session
