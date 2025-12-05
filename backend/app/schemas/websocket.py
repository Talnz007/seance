"""WebSocket event schemas for real-time communication."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class EventType(str, Enum):
    """WebSocket event types."""

    # Client → Server
    SEND_MESSAGE = "send_message"
    TYPING = "typing"

    # Server → Client
    USER_JOINED = "user_joined"
    USER_LEFT = "user_left"
    MESSAGE_RECEIVED = "message_received"
    SPIRIT_THINKING = "spirit_thinking"
    SPIRIT_RESPONSE = "spirit_response"
    ERROR = "error"


class WSEvent(BaseModel):
    """Base WebSocket event structure."""

    event: EventType = Field(..., description="Event type")
    data: Dict[str, Any] = Field(default_factory=dict, description="Event data")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Event timestamp")


class UserInfo(BaseModel):
    """User information for WebSocket events."""

    id: str = Field(..., description="User ID")
    name: str = Field(..., description="User name")
    joined_at: datetime = Field(default_factory=datetime.utcnow, description="Join timestamp")


class UserJoinedEvent(BaseModel):
    """Event data for user_joined event."""

    event: str = Field(default="user_joined", description="Event type")
    data: UserInfo = Field(..., description="User information")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Event timestamp")


class UserLeftEvent(BaseModel):
    """Event data for user_left event."""

    event: str = Field(default="user_left", description="Event type")
    data: UserInfo = Field(..., description="User information")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Event timestamp")


class MessageReceivedEvent(BaseModel):
    """Event data for message_received event."""

    event: str = Field(default="message_received", description="Event type")
    data: Dict[str, Any] = Field(..., description="Message data")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Event timestamp")


class SpiritThinkingEvent(BaseModel):
    """Event data for spirit_thinking event."""

    event: str = Field(default="spirit_thinking", description="Event type")
    data: Dict[str, Any] = Field(default_factory=dict, description="Event data")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Event timestamp")


class SpiritResponseEvent(BaseModel):
    """Event data for spirit_response event."""

    event: str = Field(default="spirit_response", description="Event type")
    data: Dict[str, Any] = Field(..., description="Spirit response data")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Event timestamp")


class ErrorEvent(BaseModel):
    """Event data for error event."""

    event: str = Field(default="error", description="Event type")
    data: Dict[str, str] = Field(..., description="Error information")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Event timestamp")
