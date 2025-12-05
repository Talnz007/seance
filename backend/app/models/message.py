"""
Message model for Séance backend.

Represents messages sent within a session, either from users
or from the AI spirit.
"""

from datetime import datetime
from sqlalchemy import String, DateTime, Boolean, ForeignKey, Text, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Message(Base):
    """
    Message model for session communication.
    
    Stores all messages sent within a session, including both
    user questions and AI spirit responses.
    
    Attributes:
        id: Unique message identifier (UUID)
        session_id: Foreign key to Session
        user_name: Name of the user who sent the message
        text: Message content
        timestamp: When the message was sent
        is_spirit: Whether this message is from the AI spirit
        session: Relationship to Session model
    """
    
    __tablename__ = "messages"
    
    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        index=True,
        comment="Unique message identifier (UUID)"
    )
    
    # Foreign key
    session_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Session this message belongs to"
    )
    
    # Message metadata
    user_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Name of the user who sent the message"
    )
    
    text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Message content"
    )
    
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        index=True,
        comment="When the message was sent"
    )
    
    is_spirit: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="Whether this message is from the AI spirit"
    )
    
    # Relationships
    session: Mapped["Session"] = relationship(
        "Session",
        back_populates="messages"
    )
    
    # Indexes for efficient queries
    __table_args__ = (
        Index("ix_messages_session_timestamp", "session_id", "timestamp"),
    )
    
    def __repr__(self) -> str:
        """String representation of Message."""
        sender = "Spirit" if self.is_spirit else self.user_name
        return f"<Message(id={self.id}, from={sender}, session={self.session_id})>"
