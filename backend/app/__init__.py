"""
Séance Backend Application

AI-powered digital Ouija board backend with FastAPI, WebSocket support,
and real-time multi-user session management.
"""

from app.config import settings
from app.utils.logger import configure_logging

__version__ = "0.1.0"

# Configure structured logging on application import
# This ensures logging is set up before any other modules use it
configure_logging(
    log_level=settings.LOG_LEVEL,
    environment=settings.ENVIRONMENT
)
