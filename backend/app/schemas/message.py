"""Message Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class MessageBase(BaseModel):
    """Base message schema with common fields."""

    text: str = Field(..., min_length=1, max_length=500, description="Message text")
    user_name: Optional[str] = Field(None, description="User name (null for spirit)")

    @field_validator("text")
    @classmethod
    def text_must_not_be_empty(cls, v: str) -> str:
        """Validate that text is not empty after stripping whitespace."""
        if not v.strip():
            raise ValueError("text cannot be empty")
        return v.strip()


class MessageCreate(MessageBase):
    """Schema for creating a new message."""

    session_id: str = Field(..., description="Session ID")
    is_spirit: bool = Field(default=False, description="Whether message is from spirit")


class MessageResponse(MessageBase):
    """Schema for message response."""

    id: str = Field(..., description="Message ID")
    session_id: str = Field(..., description="Session ID")
    timestamp: datetime = Field(..., description="Message timestamp")
    is_spirit: bool = Field(default=False, description="Whether message is from spirit")

    model_config = {"from_attributes": True}
