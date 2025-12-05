# ==================================================
# .kiro/steering/api-standards.md
# ==================================================

---
inclusion: fileMatch
fileMatchPattern: "backend/**/*.py"
---

# API Standards for Séance Backend

## RESTful Endpoint Conventions

### URL Structure
- Use plural nouns: `/api/sessions`, `/api/messages`
- Use hyphens for multi-word: `/api/session-invites`
- Version prefix: `/api/v1/...` (future-proofing)
- Resource nesting (max 2 levels): `/api/sessions/{id}/messages`

### HTTP Methods
- `GET`: Retrieve resource(s)
- `POST`: Create new resource
- `PUT`: Full update (replace)
- `PATCH`: Partial update
- `DELETE`: Remove resource

### Status Codes
- `200`: Success with body
- `201`: Created (include Location header)
- `204`: Success no body
- `400`: Bad request (validation error)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `409`: Conflict (duplicate)
- `422`: Unprocessable entity
- `500`: Internal server error

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "session_abc123",
    "name": "Spooky Session",
    "created_at": "2025-11-09T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-09T12:00:01Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Session with id 'abc123' not found",
    "details": {}
  },
  "meta": {
    "timestamp": "2025-11-09T12:00:01Z"
  }
}
```

### List Response (Pagination)
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 45,
    "timestamp": "2025-11-09T12:00:01Z"
  }
}
```

## WebSocket Event Standards

### Event Naming
- Use present tense: `message_sent`, not `message_send`
- Namespace with resource: `session:user_joined`
- Client → Server: commands (e.g., `send_message`)
- Server → Client: events (e.g., `message_received`)

### Event Payload
```json
{
  "event": "spirit_response",
  "data": {
    "session_id": "abc123",
    "message": "I sense disturbance...",
    "letter_timing": [200, 200, 150, ...]
  },
  "timestamp": "2025-11-09T12:00:00Z"
}
```

### Client Events
- `join_session`: Join session room
- `leave_session`: Leave session
- `send_message`: User asks question
- `typing`: User is typing

### Server Events
- `user_joined`: New participant
- `user_left`: Participant left
- `message_received`: User message broadcast
- `spirit_thinking`: AI generating response
- `spirit_response`: AI response ready
- `error`: Error occurred

## FastAPI Implementation Patterns

### Dependency Injection
```python
from fastapi import Depends
from app.db.session import get_db

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    # Decode JWT, fetch user
    return user

@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Implementation
    pass
```

### Error Handling
```python
from fastapi import HTTPException

def raise_not_found(resource: str, id: str):
    raise HTTPException(
        status_code=404,
        detail={
            "code": f"{resource.upper()}_NOT_FOUND",
            "message": f"{resource} with id '{id}' not found"
        }
    )
```

### Input Validation (Pydantic)
```python
from pydantic import BaseModel, Field, validator

class SessionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    max_users: int = Field(default=6, ge=2, le=12)
    
    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('name cannot be empty')
        return v.strip()
```

### Async Patterns
```python
# Good: Use async for I/O operations
async def create_session(data: SessionCreate, db: AsyncSession):
    session = Session(**data.dict())
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

# Good: Concurrent operations
async def get_session_with_messages(session_id: str, db: AsyncSession):
    session, messages = await asyncio.gather(
        db.get(Session, session_id),
        db.execute(select(Message).where(Message.session_id == session_id))
    )
    return session, messages.scalars().all()
```

## Security Standards

### JWT Authentication
```python
from jose import jwt
from datetime import datetime, timedelta

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=30))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

### Rate Limiting
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/sessions")
@limiter.limit("10/minute")
async def create_session(...):
    pass
```

### Input Sanitization
- Always use Pydantic for validation
- Sanitize string inputs (strip, lowercase where appropriate)
- Validate UUIDs/IDs format
- Reject suspicious patterns (SQL injection attempts)

## Database Query Patterns

### SQLAlchemy Best Practices
```python
# Good: Use select() for queries
from sqlalchemy import select

async def get_sessions(db: AsyncSession, limit: int = 20):
    result = await db.execute(
        select(Session)
        .where(Session.is_active == True)
        .order_by(Session.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()

# Good: Use relationship loading
async def get_session_with_messages(db: AsyncSession, session_id: str):
    result = await db.execute(
        select(Session)
        .options(selectinload(Session.messages))
        .where(Session.id == session_id)
    )
    return result.scalar_one_or_none()
```

### Transaction Management
```python
async def create_session_with_initial_message(
    session_data: SessionCreate,
    db: AsyncSession
):
    async with db.begin():
        session = Session(**session_data.dict())
        db.add(session)
        await db.flush()  # Get session.id
        
        initial_msg = Message(
            session_id=session.id,
            text="Session created",
            is_system=True
        )
        db.add(initial_msg)
    
    return session
```

## Logging Standards

### Structured Logging
```python
import structlog

logger = structlog.get_logger()

@router.post("/sessions")
async def create_session(data: SessionCreate):
    logger.info(
        "session.create.attempt",
        session_name=data.name,
        max_users=data.max_users
    )
    
    try:
        session = await session_service.create(data)
        logger.info(
            "session.create.success",
            session_id=session.id
        )
        return session
    except Exception as e:
        logger.error(
            "session.create.failed",
            error=str(e),
            session_name=data.name
        )
        raise
```

### Log Levels
- `DEBUG`: Detailed debugging info (not in production)
- `INFO`: General informational messages
- `WARNING`: Warning messages, recoverable errors
- `ERROR`: Error messages, unhandled exceptions
- `CRITICAL`: Critical failures

## Performance Optimization

### Database Connection Pooling
```python
from sqlalchemy.ext.asyncio import create_async_engine

engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    echo=False  # Set True for SQL debugging
)
```

### Caching with Redis
```python
import aioredis

async def get_session_cached(session_id: str, redis: Redis):
    # Check cache first
    cached = await redis.get(f"session:{session_id}")
    if cached:
        return json.loads(cached)
    
    # Fetch from DB
    session = await db.get(Session, session_id)
    
    # Cache for 5 minutes
    await redis.setex(
        f"session:{session_id}",
        300,
        json.dumps(session.dict())
    )
    
    return session
```

### Background Tasks
```python
from fastapi import BackgroundTasks

@router.post("/sessions/{session_id}/end")
async def end_session(
    session_id: str,
    background_tasks: BackgroundTasks
):
    # Immediate response
    session.is_active = False
    await db.commit()
    
    # Cleanup in background
    background_tasks.add_task(cleanup_session_data, session_id)
    
    return {"message": "Session ended"}
```

## Testing Standards

### Unit Tests
```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_session(client: AsyncClient):
    response = await client.post(
        "/api/sessions",
        json={"name": "Test Session", "max_users": 6}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert "id" in data["data"]
```

### WebSocket Tests
```python
@pytest.mark.asyncio
async def test_websocket_connection(client: AsyncClient):
    async with client.websocket_connect("/ws/test-session") as ws:
        await ws.send_json({"event": "join_session"})
        data = await ws.receive_json()
        assert data["event"] == "user_joined"
```

## Documentation Standards

### OpenAPI/Swagger
- Use response_model for automatic docs
- Add descriptions to endpoints
- Include example values in schemas
- Document error responses

```python
@router.post(
    "/sessions",
    response_model=SessionResponse,
    status_code=201,
    summary="Create new session",
    description="Create a new Séance session for multiple users to join",
    responses={
        201: {"description": "Session created successfully"},
        400: {"description": "Invalid input"},
        429: {"description": "Rate limit exceeded"}
    }
)
async def create_session(data: SessionCreate):
    pass
```

## Deployment Checklist

Before deploying:
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Rate limiting configured
- [ ] CORS origins set correctly
- [ ] Logging configured
- [ ] Error tracking (Sentry) enabled
- [ ] Health check endpoint works
- [ ] WebSocket connection tested
