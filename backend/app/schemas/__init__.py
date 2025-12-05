"""Pydantic schemas for request/response validation."""

from app.schemas.session import SessionBase, SessionCreate, SessionResponse
from app.schemas.message import MessageBase, MessageCreate, MessageResponse
from app.schemas.websocket import (
    EventType,
    WSEvent,
    UserInfo,
    UserJoinedEvent,
    UserLeftEvent,
    MessageReceivedEvent,
    SpiritThinkingEvent,
    SpiritResponseEvent,
    ErrorEvent,
)

__all__ = [
    # Session schemas
    "SessionBase",
    "SessionCreate",
    "SessionResponse",
    # Message schemas
    "MessageBase",
    "MessageCreate",
    "MessageResponse",
    # WebSocket schemas
    "EventType",
    "WSEvent",
    "UserInfo",
    "UserJoinedEvent",
    "UserLeftEvent",
    "MessageReceivedEvent",
    "SpiritThinkingEvent",
    "SpiritResponseEvent",
    "ErrorEvent",
]
