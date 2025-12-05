# Design Document

## Overview

The Séance backend is a FastAPI-based application that provides REST API endpoints and WebSocket connections for multi-user séance sessions. The architecture follows a layered approach with clear separation between API routes, business logic services, data models, and infrastructure concerns.

The system enables real-time communication between multiple participants in a session, manages session lifecycle, persists conversation history, and integrates with AI services for generating spirit responses. The design prioritizes scalability, maintainability, and real-time performance.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
└─────────────────┬───────────────────────┬───────────────────┘
                  │                       │
                  │ HTTP/REST             │ WebSocket
                  │                       │
┌─────────────────▼───────────────────────▼───────────────────┐
│                     FastAPI Application                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              API Layer (Routes)                        │ │
│  │  - Session Endpoints    - WebSocket Handler            │ │
│  └────────────┬───────────────────────┬───────────────────┘ │
│               │                       │                      │
│  ┌────────────▼───────────────────────▼───────────────────┐ │
│  │              Core Layer                                 │ │
│  │  - WebSocket Manager    - Security (JWT)               │ │
│  └────────────┬───────────────────────┬───────────────────┘ │
│               │                       │                      │
│  ┌────────────▼───────────────────────▼───────────────────┐ │
│  │              Service Layer                              │ │
│  │  - Session Service      - Spirit Service (Future)       │ │
│  └────────────┬───────────────────────┬───────────────────┘ │
│               │                       │                      │
│  ┌────────────▼───────────────────────▼───────────────────┐ │
│  │              Data Layer                                 │ │
│  │  - SQLAlchemy Models    - Database Session             │ │
│  └────────────┬───────────────────────────────────────────┘ │
└───────────────┼─────────────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: FastAPI 0.121.1+ (async/await, WebSocket support, OpenAPI)
- **Database**: PostgreSQL 16 with SQLAlchemy 2.0.44 (async ORM)
- **Migrations**: Alembic 1.17.1
- **Authentication**: JWT with PyJWT
- **Validation**: Pydantic 2.4+
- **Server**: Uvicorn with standard extras
- **Logging**: Structlog for structured logging

## Components and Interfaces

### 1. API Layer (`app/api/`)

#### Session Routes (`app/api/sessions.py`)

Handles REST endpoints for session management.

**Endpoints:**
- `POST /api/sessions` - Create new session
- `GET /api/sessions/{session_id}` - Retrieve session details
- `DELETE /api/sessions/{session_id}` - End session (future)
- `GET /api/sessions/{session_id}/history` - Get message history (future)

**Dependencies:**
- Database session (via `get_db`)
- Session service for business logic

**Response Format:**
```python
{
    "success": true,
    "data": {
        "id": "uuid",
        "name": "Session Name",
        "created_at": "2025-11-10T...",
        "max_users": 6,
        "is_active": true
    },
    "meta": {
        "timestamp": "2025-11-10T..."
    }
}
```

#### WebSocket Handler (`app/api/websocket.py`)

Manages real-time WebSocket connections for session participants.

**Endpoint:**
- `WS /ws/{session_id}` - WebSocket connection for session

**Event Flow:**
1. Client connects → Server accepts connection
2. Client sends user info → Server registers user
3. Server broadcasts `user_joined` to others
4. Client sends `send_message` → Server validates and broadcasts
5. Server sends `spirit_thinking` → Processes with AI (future)
6. Server sends `spirit_response` → Delivers AI response (future)
7. Client disconnects → Server broadcasts `user_left`

**Events (Client → Server):**
- `send_message`: User asks question
- `typing`: User is typing (future)

**Events (Server → Client):**
- `user_joined`: New participant joined
- `user_left`: Participant left
- `message_received`: User message broadcast
- `spirit_thinking`: AI processing started
- `spirit_response`: AI response ready
- `error`: Error occurred

#### Dependency Injection (`app/api/deps.py`)

Provides reusable dependencies for routes.

**Functions:**
- `get_db()`: Yields async database session
- `get_current_user()`: Validates JWT and returns user (future)

### 2. Core Layer (`app/core/`)

#### WebSocket Manager (`app/core/websocket_manager.py`)

Manages WebSocket connections and message broadcasting.

**Class: ConnectionManager**

**State:**
```python
active_connections: Dict[str, List[WebSocket]]  # session_id → websockets
user_registry: Dict[WebSocket, dict]            # websocket → user_info
```

**Methods:**
- `connect(websocket, session_id, user_info)`: Register new connection
- `disconnect(websocket, session_id)`: Remove connection
- `broadcast(session_id, message, exclude=None)`: Send to all in session
- `send_to(websocket, message)`: Send to specific connection
- `get_session_users(session_id)`: Get all users in session

**Connection Lifecycle:**
1. Accept WebSocket connection
2. Receive initial user data
3. Register in active_connections and user_registry
4. Broadcast user_joined to others
5. Handle incoming messages
6. On disconnect: cleanup and broadcast user_left

**Error Handling:**
- Catch send failures and mark connections as dead
- Clean up dead connections automatically
- Log all connection errors with context

#### Security (`app/core/security.py`)

Handles JWT token creation and validation.

**Functions:**
- `create_access_token(data: dict, expires_delta: timedelta)`: Generate JWT
- `verify_token(token: str)`: Decode and validate JWT
- `get_password_hash(password: str)`: Hash password (future)
- `verify_password(plain, hashed)`: Verify password (future)

**Configuration:**
- JWT_SECRET: From environment variable
- JWT_ALGORITHM: HS256 (configurable)
- ACCESS_TOKEN_EXPIRE_MINUTES: 30 (configurable)

### 3. Service Layer (`app/services/`)

#### Session Service (`app/services/session_service.py`)

Business logic for session management.

**Functions:**
- `create_session(data: SessionCreate, db)`: Create new session
- `get_session(session_id: str, db)`: Retrieve session
- `end_session(session_id: str, db)`: Mark session inactive (future)
- `get_session_history(session_id: str, db)`: Get messages (future)

**Business Rules:**
- Session names must be 1-100 characters
- Default max_users is 6
- Generate UUID for session ID
- Set created_at to current UTC time
- Set is_active to true by default

#### Spirit Service (`app/services/kiro_spirit.py`) - Future

Placeholder for AI integration.

**Functions:**
- `generate_response(session_id, question, history)`: Get AI response
- `format_response(text)`: Format for Ouija board display

### 4. Data Layer (`app/models/` and `app/db/`)

#### Models (`app/models/`)

**Session Model (`app/models/session.py`):**
```python
class Session(Base):
    __tablename__ = "sessions"
    
    id: str (PK, UUID)
    name: str (not null, max 100)
    created_at: datetime (not null)
    max_users: int (default 6)
    is_active: bool (default true)
    
    # Relationships
    messages: List[Message]
```

**Message Model (`app/models/message.py`):**
```python
class Message(Base):
    __tablename__ = "messages"
    
    id: str (PK, UUID)
    session_id: str (FK → sessions.id)
    user_name: str (nullable for spirit)
    text: str (not null, max 500)
    timestamp: datetime (not null)
    is_spirit: bool (default false)
    
    # Relationships
    session: Session
```

**User Model (`app/models/user.py`):**
```python
class User(Base):
    __tablename__ = "users"
    
    id: str (PK, UUID)
    name: str (not null)
    joined_at: datetime (not null)
```

#### Database Configuration (`app/db/`)

**Base (`app/db/base.py`):**
- SQLAlchemy declarative base
- Import all models for Alembic

**Session Factory (`app/db/session.py`):**
- Async engine creation
- Connection pooling configuration
- Session factory with async support
- Dependency injection helper

**Configuration:**
```python
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    echo=False  # True for debugging
)
```

### 5. Schemas (`app/schemas/`)

Pydantic models for request/response validation.

**Session Schemas (`app/schemas/session.py`):**
- `SessionBase`: Common fields (name, max_users)
- `SessionCreate`: For POST requests
- `SessionResponse`: For API responses (includes id, created_at)
- `SessionUpdate`: For PATCH requests (future)

**Message Schemas (`app/schemas/message.py`):**
- `MessageBase`: Common fields (text, user_name)
- `MessageCreate`: For creating messages
- `MessageResponse`: For API responses

**WebSocket Schemas (`app/schemas/websocket.py`):**
- `WSEvent`: Base event structure
- `UserJoinedEvent`: user_joined event data
- `MessageReceivedEvent`: message_received event data
- `SpiritResponseEvent`: spirit_response event data

### 6. Configuration (`app/config.py`)

Centralized configuration management using Pydantic Settings.

**Settings Class:**
```python
class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Security
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: List[str]
    
    # Environment
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "info"
    
    class Config:
        env_file = ".env"
```

### 7. Main Application (`app/main.py`)

FastAPI application setup and configuration.

**Initialization:**
- Create FastAPI app with metadata
- Configure CORS middleware
- Include API routers
- Setup exception handlers
- Configure logging
- Add health check endpoint

**Endpoints:**
- `GET /health`: Health check
- `GET /`: Root redirect to docs

## Data Models

### Entity Relationship Diagram

```
┌─────────────────────┐
│      Session        │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ created_at          │
│ max_users           │
│ is_active           │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│      Message        │
├─────────────────────┤
│ id (PK)             │
│ session_id (FK)     │
│ user_name           │
│ text                │
│ timestamp           │
│ is_spirit           │
└─────────────────────┘

┌─────────────────────┐
│       User          │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ joined_at           │
└─────────────────────┘
```

### Database Indexes

**Sessions Table:**
- Primary key on `id`
- Index on `created_at` for sorting
- Index on `is_active` for filtering

**Messages Table:**
- Primary key on `id`
- Foreign key index on `session_id`
- Composite index on `(session_id, timestamp)` for history queries

**Users Table:**
- Primary key on `id`
- Index on `name` for lookups

## Error Handling

### HTTP Error Responses

**Standard Error Format:**
```python
{
    "success": false,
    "error": {
        "code": "ERROR_CODE",
        "message": "Human-readable message",
        "details": {}  # Optional additional context
    },
    "meta": {
        "timestamp": "2025-11-10T..."
    }
}
```

**Error Codes:**
- `SESSION_NOT_FOUND`: Session ID doesn't exist (404)
- `VALIDATION_ERROR`: Invalid request data (400)
- `INTERNAL_ERROR`: Server error (500)
- `UNAUTHORIZED`: Invalid/missing token (401)
- `FORBIDDEN`: Insufficient permissions (403)

### WebSocket Error Handling

**Error Events:**
```python
{
    "event": "error",
    "data": {
        "code": "ERROR_CODE",
        "message": "Error description"
    },
    "timestamp": "2025-11-10T..."
}
```

**Error Scenarios:**
- Invalid message format → Send error event
- Message too long → Send error event
- Connection failure → Log and cleanup
- Broadcast failure → Remove dead connections

### Exception Handling Strategy

1. **Validation Errors**: Caught by Pydantic, return 422
2. **Not Found**: Raise HTTPException with 404
3. **Database Errors**: Log and return 500
4. **WebSocket Errors**: Log, send error event, cleanup
5. **Unexpected Errors**: Log with full context, return 500

## Testing Strategy

### Unit Tests (`tests/unit/`)

**Test Coverage:**
- Pydantic schema validation
- Service layer business logic
- Utility functions
- Security functions (JWT)

**Example:**
```python
@pytest.mark.asyncio
async def test_create_session():
    data = SessionCreate(name="Test", max_users=6)
    session = await session_service.create_session(data, mock_db)
    assert session.name == "Test"
    assert session.max_users == 6
```

### Integration Tests (`tests/integration/`)

**Test Coverage:**
- API endpoint flows
- Database operations
- WebSocket connections
- Error handling

**Example:**
```python
@pytest.mark.asyncio
async def test_create_session_endpoint(client):
    response = await client.post(
        "/api/sessions",
        json={"name": "Test Session", "max_users": 6}
    )
    assert response.status_code == 201
    assert response.json()["success"] is True
```

### WebSocket Tests

**Test Coverage:**
- Connection establishment
- User registration
- Message broadcasting
- Disconnection handling

**Example:**
```python
@pytest.mark.asyncio
async def test_websocket_broadcast(client):
    async with client.websocket_connect("/ws/test-session") as ws:
        await ws.send_json({"user_id": "1", "name": "User1"})
        data = await ws.receive_json()
        assert data["event"] == "user_joined"
```

### Test Fixtures (`tests/conftest.py`)

**Fixtures:**
- `client`: AsyncClient for HTTP tests
- `db`: Test database session
- `mock_db`: Mock database for unit tests
- `test_session`: Sample session data
- `test_user`: Sample user data

## Deployment Considerations

### Environment Variables

Required variables:
```bash
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/seance
JWT_SECRET=your-secret-key-min-32-chars
CORS_ORIGINS=["http://localhost:3000"]
ENVIRONMENT=development
LOG_LEVEL=info
```

### Database Migrations

**Initial Migration:**
```bash
# Create migration
alembic revision --autogenerate -m "Initial schema"

# Apply migration
alembic upgrade head
```

**Migration Strategy:**
- Version control all migrations
- Test migrations on staging first
- Support rollback for all migrations
- Document breaking changes

### Docker Configuration

**Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Health Checks

**Endpoint: GET /health**
```python
{
    "status": "healthy",
    "database": "connected",
    "timestamp": "2025-11-10T..."
}
```

### Logging Configuration

**Structured Logging:**
- JSON format in production
- Human-readable in development
- Include request IDs for tracing
- Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL

**Key Events to Log:**
- API requests (with timing)
- WebSocket connections/disconnections
- Database queries (in debug mode)
- Errors with full context
- Security events (auth failures)

## Security Considerations

### Input Validation

- All inputs validated with Pydantic
- String length limits enforced
- SQL injection prevented by SQLAlchemy
- XSS prevention through response sanitization

### Authentication

- JWT tokens for API authentication
- Token expiration enforced
- Secure token storage (httpOnly cookies future)
- Password hashing with bcrypt (future)

### CORS Configuration

- Whitelist specific origins
- Allow credentials
- Restrict methods to necessary ones
- Configure in environment variables

### Rate Limiting

Future implementation:
- Redis-based rate limiting
- Per-IP and per-user limits
- Configurable thresholds
- Graceful degradation

## Performance Optimization

### Database

- Connection pooling (20 connections, 10 overflow)
- Async queries throughout
- Proper indexing on frequently queried fields
- Query optimization with SQLAlchemy select()

### WebSocket

- Efficient broadcast algorithm
- Dead connection cleanup
- Message batching for high volume (future)
- Redis pub/sub for horizontal scaling (future)

### Caching

Future implementation:
- Redis for session data
- Cache frequently accessed sessions
- TTL-based invalidation
- Cache warming strategies

## Future Enhancements

### Phase 2 Features

1. **Spirit Service Integration**
   - Kiro API integration
   - Response caching
   - Personality steering

2. **Redis Integration**
   - Session caching
   - Pub/sub for scaling
   - Rate limiting

3. **Enhanced Authentication**
   - User accounts
   - OAuth providers
   - Session permissions

4. **Analytics**
   - Session metrics
   - User engagement tracking
   - Performance monitoring

### Scalability Considerations

- Horizontal scaling with Redis pub/sub
- Database read replicas
- CDN for static assets
- Load balancing
- Containerization with Kubernetes

## Conclusion

This design provides a solid foundation for the Séance backend, following FastAPI best practices and the project's architectural standards. The layered architecture ensures maintainability, the async implementation provides performance, and the comprehensive error handling ensures reliability. The design is extensible for future features while delivering core functionality for the MVP.
