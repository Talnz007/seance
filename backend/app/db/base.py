"""
SQLAlchemy declarative base for database models.

All database models should inherit from the Base class defined here.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy models.
    
    All models in app/models/ should inherit from this class.
    This provides the declarative base functionality and metadata.
    
    Example:
        from app.db.base import Base
        from sqlalchemy import Column, String
        
        class MyModel(Base):
            __tablename__ = "my_table"
            id = Column(String, primary_key=True)
    """
    pass
