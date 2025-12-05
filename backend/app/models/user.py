"""
User model for Séance backend.

Represents users who participate in sessions. This is a minimal
model for MVP - full authentication will be added later.
"""

from datetime import datetime
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class User(Base):
    """
    User model for session participants.
    
    Minimal user model for MVP. Stores basic information about
    users who join sessions. Full authentication and profiles
    will be added in future iterations.
    
    Attributes:
        id: Unique user identifier (UUID)
        name: User's display name
        joined_at: When the user first joined
    """
    
    __tablename__ = "users"
    
    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        index=True,
        comment="Unique user identifier (UUID)"
    )
    
    # User metadata
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        comment="User's display name"
    )
    
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        comment="When the user first joined"
    )
    
    def __repr__(self) -> str:
        """String representation of User."""
        return f"<User(id={self.id}, name={self.name})>"
