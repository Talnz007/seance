"""
Unit tests for session service.

Tests session creation, retrieval, and business logic.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime, timezone

from app.services.session_service import (
    create_session,
    get_session,
    SessionNotFoundError,
)
from app.schemas.session import SessionCreate
from app.models.session import Session


@pytest.mark.asyncio
async def test_create_session_success():
    """Test successful session creation."""
    # Arrange
    session_data = SessionCreate(name="Test Session", max_users=6)
    mock_db = AsyncMock()
    
    # Act
    session = await create_session(session_data, mock_db)
    
    # Assert
    assert session.name == "Test Session"
    assert session.max_users == 6
    assert session.is_active is True
    assert session.id is not None
    assert isinstance(session.created_at, datetime)
    mock_db.add.assert_called_once()
    assert mock_db.flush.await_count == 1
    assert mock_db.refresh.await_count == 1


@pytest.mark.asyncio
async def test_create_session_with_custom_max_users():
    """Test session creation with custom max_users."""
    # Arrange
    session_data = SessionCreate(name="Custom Session", max_users=10)
    mock_db = AsyncMock()
    
    # Act
    session = await create_session(session_data, mock_db)
    
    # Assert
    assert session.max_users == 10


@pytest.mark.asyncio
async def test_create_session_generates_unique_id():
    """Test that each session gets a unique UUID."""
    # Arrange
    session_data = SessionCreate(name="Test Session", max_users=6)
    mock_db = AsyncMock()
    
    # Act
    session1 = await create_session(session_data, mock_db)
    session2 = await create_session(session_data, mock_db)
    
    # Assert
    assert session1.id != session2.id


@pytest.mark.asyncio
async def test_get_session_success():
    """Test successful session retrieval."""
    # Arrange
    session_id = "test-session-id"
    mock_session = Session(
        id=session_id,
        name="Test Session",
        created_at=datetime.now(timezone.utc),
        max_users=6,
        is_active=True
    )
    
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_session
    
    mock_db = AsyncMock()
    mock_db.execute.return_value = mock_result
    
    # Act
    session = await get_session(session_id, mock_db)
    
    # Assert
    assert session.id == session_id
    assert session.name == "Test Session"
    assert mock_db.execute.await_count == 1


@pytest.mark.asyncio
async def test_get_session_not_found():
    """Test session retrieval when session doesn't exist."""
    # Arrange
    session_id = "nonexistent-id"
    
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    
    mock_db = AsyncMock()
    mock_db.execute.return_value = mock_result
    
    # Act & Assert
    with pytest.raises(SessionNotFoundError) as exc_info:
        await get_session(session_id, mock_db)
    
    assert session_id in str(exc_info.value)
