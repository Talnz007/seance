# Utilities Module

This module provides utility functions and helpers for the Séance backend application.

## Structured Logging

The logging module provides structured logging using `structlog` with support for both development and production environments.

### Features

- **Environment-aware formatting**:
  - Development: Human-readable colored output
  - Production: JSON format for log aggregation
- **Structured context**: All logs include structured key-value pairs
- **Log level configuration**: Configurable via environment variables
- **Helper functions**: Pre-built functions for common logging scenarios

### Configuration

Logging is automatically configured when the application starts (in `app/__init__.py`):

```python
from app.config import settings
from app.utils.logger import configure_logging

configure_logging(
    log_level=settings.LOG_LEVEL,
    environment=settings.ENVIRONMENT
)
```

### Environment Variables

- `LOG_LEVEL`: Set logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- `ENVIRONMENT`: Set environment (development, staging, production)

### Usage

#### Basic Logging

```python
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Log with structured context
logger.info(
    "user_action",
    user_id="123",
    action="login",
    ip_address="192.168.1.1"
)

logger.error(
    "database_error",
    error=str(e),
    query="SELECT * FROM users",
    duration_ms=150
)
```

#### WebSocket Logging

```python
from app.utils.logger import (
    get_logger,
    log_websocket_connection,
    log_websocket_disconnection,
    log_websocket_error
)

logger = get_logger(__name__)

# Log connection
log_websocket_connection(
    session_id="abc123",
    user_id="user456",
    user_name="John Doe",
    logger=logger
)

# Log disconnection
log_websocket_disconnection(
    session_id="abc123",
    user_id="user456",
    user_name="John Doe",
    logger=logger
)

# Log error
try:
    # WebSocket operation
    pass
except Exception as e:
    log_websocket_error(
        error=e,
        session_id="abc123",
        user_id="user456",
        logger=logger
    )
```

#### API Error Logging

```python
from app.utils.logger import get_logger, log_api_error

logger = get_logger(__name__)

try:
    # API operation
    pass
except Exception as e:
    log_api_error(
        error=e,
        endpoint="/api/sessions",
        method="POST",
        status_code=500,
        logger=logger,
        session_name="Test Session"  # Additional context
    )
```

### Output Examples

#### Development Mode (Human-Readable)

```
2025-11-10T13:00:12.564626Z [info     ] websocket.connected            [app.api.websocket] 
app=seance-backend event_type=connection session_id=session123 user_id=user456 user_name=TestUser
```

#### Production Mode (JSON)

```json
{
  "session_id": "session123",
  "user_id": "user456",
  "user_name": "TestUser",
  "event_type": "connection",
  "event": "websocket.connected",
  "level": "info",
  "logger": "app.api.websocket",
  "timestamp": "2025-11-10T13:01:13.038847Z",
  "app": "seance-backend"
}
```

### Best Practices

1. **Use structured context**: Always include relevant key-value pairs
   ```python
   # Good
   logger.info("session_created", session_id=session.id, user_count=3)
   
   # Avoid
   logger.info(f"Session {session.id} created with {3} users")
   ```

2. **Use appropriate log levels**:
   - `DEBUG`: Detailed debugging information
   - `INFO`: General informational messages
   - `WARNING`: Warning messages, recoverable errors
   - `ERROR`: Error messages, unhandled exceptions
   - `CRITICAL`: Critical failures

3. **Include error context**: When logging errors, include relevant context
   ```python
   logger.error(
       "database_query_failed",
       error=str(e),
       query=query,
       params=params,
       duration_ms=duration
   )
   ```

4. **Use helper functions**: For common scenarios (WebSocket, API errors), use the provided helper functions

5. **Avoid sensitive data**: Never log passwords, tokens, or other sensitive information

### Integration with Monitoring

The JSON format in production is designed to work with log aggregation services like:
- LogTail / BetterStack
- Datadog
- Elasticsearch + Kibana
- CloudWatch Logs
- Splunk

All logs include:
- `timestamp`: ISO 8601 timestamp
- `level`: Log level
- `logger`: Logger name (module)
- `event`: Event name
- `app`: Application identifier
- Custom context fields

### Testing

To test logging configuration:

```python
from app.utils.logger import configure_logging, get_logger

# Test development mode
configure_logging('INFO', 'development')
logger = get_logger('test')
logger.info('test_message', test_key='test_value')

# Test production mode
configure_logging('INFO', 'production')
logger = get_logger('test')
logger.info('test_message', test_key='test_value')
```
