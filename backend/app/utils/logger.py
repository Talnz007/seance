"""Structured logging configuration using structlog."""

import logging
import sys
from typing import Any

import structlog
from structlog.types import EventDict, Processor


def add_app_context(logger: Any, method_name: str, event_dict: EventDict) -> EventDict:
    """Add application context to log entries."""
    event_dict["app"] = "seance-backend"
    return event_dict


def configure_logging(log_level: str = "INFO", environment: str = "development") -> None:
    """
    Configure structured logging for the application.
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        environment: Environment name (development, production)
    """
    # Convert log level string to logging constant
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)
    
    # Configure standard logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=numeric_level,
    )
    
    # Determine processors based on environment
    if environment == "production":
        # JSON formatting for production (machine-readable)
        processors: list[Processor] = [
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.add_log_level,
            structlog.stdlib.add_logger_name,
            structlog.processors.TimeStamper(fmt="iso"),
            add_app_context,
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer(),
        ]
    else:
        # Human-readable formatting for development
        processors = [
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.add_log_level,
            structlog.stdlib.add_logger_name,
            structlog.processors.TimeStamper(fmt="iso"),
            add_app_context,
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.dev.ConsoleRenderer(colors=True),
        ]
    
    # Configure structlog
    structlog.configure(
        processors=processors,
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str = __name__) -> structlog.stdlib.BoundLogger:
    """
    Get a configured logger instance.
    
    Args:
        name: Logger name (typically __name__ of the module)
        
    Returns:
        Configured structlog logger
    """
    return structlog.get_logger(name)


def log_websocket_connection(
    session_id: str,
    user_id: str,
    user_name: str,
    logger: structlog.stdlib.BoundLogger
) -> None:
    """
    Log WebSocket connection event with structured context.
    
    Args:
        session_id: The session ID
        user_id: The user ID
        user_name: The user name
        logger: The logger instance
    """
    logger.info(
        "websocket.connected",
        session_id=session_id,
        user_id=user_id,
        user_name=user_name,
        event_type="connection"
    )


def log_websocket_disconnection(
    session_id: str,
    user_id: str,
    user_name: str,
    logger: structlog.stdlib.BoundLogger
) -> None:
    """
    Log WebSocket disconnection event with structured context.
    
    Args:
        session_id: The session ID
        user_id: The user ID
        user_name: The user name
        logger: The logger instance
    """
    logger.info(
        "websocket.disconnected",
        session_id=session_id,
        user_id=user_id,
        user_name=user_name,
        event_type="disconnection"
    )


def log_websocket_error(
    error: Exception,
    session_id: str,
    user_id: str | None,
    logger: structlog.stdlib.BoundLogger
) -> None:
    """
    Log WebSocket error with structured context.
    
    Args:
        error: The exception that occurred
        session_id: The session ID
        user_id: The user ID (if available)
        logger: The logger instance
    """
    logger.error(
        "websocket.error",
        session_id=session_id,
        user_id=user_id,
        error=str(error),
        error_type=type(error).__name__,
        event_type="error"
    )


def log_api_error(
    error: Exception,
    endpoint: str,
    method: str,
    status_code: int,
    logger: structlog.stdlib.BoundLogger,
    **context: Any
) -> None:
    """
    Log API error with request context.
    
    Args:
        error: The exception that occurred
        endpoint: The API endpoint path
        method: The HTTP method
        status_code: The HTTP status code
        logger: The logger instance
        **context: Additional context to include in the log
    """
    logger.error(
        "api.error",
        endpoint=endpoint,
        method=method,
        status_code=status_code,
        error=str(error),
        error_type=type(error).__name__,
        event_type="api_error",
        **context
    )
