"""
Session model for Séance backend.

Represents a Séance session where multiple users can join
to communicate with the AI spirit.
"""

from datetime import datetime
from sqlalchemy import String, DateTime, Integer, Boolean, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Session(Base):
    """
    Séance session model.
    
    A session represents a shared space where multiple users can join
    to ask questions and receive responses from the AI spirit.
    
    Attributes:
        id: Unique session identifier (UUID)
        name: Human-readable session name
        created_at: Timestamp when session was created
        max_users: Maximum number of users allowed (2-12)
        is_active: Whether the session is currently active
        messages: Relationship to Message model
    """
    
    __tablename__ = "sessions"
    
    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        index=True,
        comment="Unique session identifier (UUID)"
    )
    
    # Session metadata
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Human-readable session name"
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        index=True,
        comment="Timestamp when session was created"
    )
    
    max_users: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=6,
        comment="Maximum number of users allowed in session"
    )
    
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        index=True,
        comment="Whether the session is currently active"
    )
    
    # Relationships
    messages: Mapped[list["Message"]] = relationship(
        "Message",
        back_populates="session",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    
    # Indexes
    __table_args__ = (
        Index("ix_sessions_created_at_active", "created_at", "is_active"),
    )
    
    def __repr__(self) -> str:
        """String representation of Session."""
        return f"<Session(id={self.id}, name={self.name}, active={self.is_active})>"
