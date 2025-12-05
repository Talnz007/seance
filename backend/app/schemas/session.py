"""Session Pydantic schemas for request/response validation."""

from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class SessionBase(BaseModel):
    """Base session schema with common fields."""

    name: str = Field(..., min_length=1, max_length=100, description="Session name")
    max_users: int = Field(default=6, ge=2, le=12, description="Maximum number of users")

    @field_validator("name")
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        """Validate that name is not empty after stripping whitespace."""
        if not v.strip():
            raise ValueError("name cannot be empty")
        return v.strip()


class SessionCreate(SessionBase):
    """Schema for creating a new session."""

    pass


class SessionResponse(SessionBase):
    """Schema for session response."""

    id: str = Field(..., description="Session ID")
    created_at: datetime = Field(..., description="Session creation timestamp")
    is_active: bool = Field(default=True, description="Whether session is active")

    model_config = {"from_attributes": True}
