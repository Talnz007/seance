# Séance - Project Structure

## Repository Organization

```
seance/
├── .github/
│   └── workflows/
│       ├── backend-ci.yml       # Backend CI/CD
│       ├── frontend-ci.yml      # Frontend CI/CD
│       └── deploy.yml           # Deployment workflow
│
├── .kiro/                       # Kiro configuration (DO NOT GITIGNORE)
│   ├── steering/                # Steering documents
│   │   ├── product.md
│   │   ├── tech.md
│   │   ├── structure.md
│   │   ├── spirit-personality.md
│   │   ├── api-standards.md
│   │   ├── ui-components.md
│   │   ├── audio-implementation.md
│   │   ├── websocket-patterns.md
│   │   └── hackathon-context.md
│   └── hooks/                   # Agent hooks
│       ├── pre-commit.json
│       ├── on-file-save.json
│       └── test-runner.json
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application entry
│   │   ├── config.py            # Configuration management
│   │   │
│   │   ├── api/                 # API routes
│   │   │   ├── __init__.py
│   │   │   ├── deps.py          # Dependency injection
│   │   │   ├── sessions.py      # Session endpoints
│   │   │   └── websocket.py     # WebSocket handlers
│   │   │
│   │   ├── core/                # Core functionality
│   │   │   ├── __init__.py
│   │   │   ├── security.py      # JWT, auth
│   │   │   ├── websocket_manager.py  # WS connection manager
│   │   │   └── redis_client.py  # Redis pub/sub
│   │   │
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── session.py
│   │   │   ├── message.py
│   │   │   └── user.py
│   │   │
│   │   ├── schemas/             # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── session.py
│   │   │   ├── message.py
│   │   │   └── websocket.py
│   │   │
│   │   ├── services/            # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── kiro_spirit.py   # Kiro AI integration
│   │   │   ├── tts_service.py   # TTS generation
│   │   │   ├── session_service.py
│   │   │   └── audio_cache.py   # Audio caching
│   │   │
│   │   ├── db/                  # Database
│   │   │   ├── __init__.py
│   │   │   ├── base.py          # SQLAlchemy base
│   │   │   └── session.py       # DB session factory
│   │   │
│   │   └── utils/               # Utilities
│   │       ├── __init__.py
│   │       ├── logger.py
│   │       └── validators.py
│   │
│   ├── alembic/                 # Database migrations
│   │   ├── versions/
│   │   └── env.py
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py          # Pytest fixtures
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── Dockerfile
│   ├── requirements.txt         # Python dependencies
│   ├── pyproject.toml          # Poetry configuration
│   └── .env.example
│
├── frontend/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Landing page
│   │   ├── session/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Session room
│   │   └── api/                 # API routes (optional)
│   │
│   ├── components/
│   │   ├── ui/                  # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── input.tsx
│   │   │
│   │   ├── ouija/               # Ouija board components
│   │   │   ├── ouija-board.tsx
│   │   │   ├── planchette.tsx
│   │   │   ├── letter-grid.tsx
│   │   │   └── candle-flames.tsx
│   │   │
│   │   ├── session/             # Session-related components
│   │   │   ├── session-create.tsx
│   │   │   ├── session-join.tsx
│   │   │   ├── user-list.tsx
│   │   │   └── message-feed.tsx
│   │   │
│   │   └── audio/               # Audio components
│   │       ├── audio-player.tsx
│   │       ├── stereo-visualizer.tsx
│   │       └── sound-toggle.tsx
│   │
│   ├── lib/                     # Utilities and helpers
│   │   ├── websocket.ts         # WebSocket client
│   │   ├── audio-engine.ts      # Web Audio API wrapper
│   │   ├── utils.ts             # General utilities
│   │   └── constants.ts         # App constants
│   │
│   ├── hooks/                   # React hooks
│   │   ├── use-websocket.ts
│   │   ├── use-audio.ts
│   │   ├── use-session.ts
│   │   └── use-planchette.ts
│   │
│   ├── stores/                  # Zustand stores
│   │   ├── session-store.ts
│   │   ├── audio-store.ts
│   │   └── user-store.ts
│   │
│   ├── types/                   # TypeScript types
│   │   ├── session.ts
│   │   ├── message.ts
│   │   ├── websocket.ts
│   │   └── audio.ts
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── public/
│   │   ├── sounds/              # Sound effects
│   │   │   ├── whisper.mp3
│   │   │   ├── candle.mp3
│   │   │   └── ambient.mp3
│   │   └── images/
│   │
│   ├── __tests__/
│   │   ├── components/
│   │   └── integration/
│   │
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── .env.local.example
│
├── docker-compose.yml           # Local development
├── .gitignore
├── README.md
└── LICENSE
```

## File Naming Conventions

### Backend (Python)
- **Files**: `snake_case.py`
- **Classes**: `PascalCase`
- **Functions**: `snake_case`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private**: `_leading_underscore`

```python
# Good examples
app/services/kiro_spirit.py      # File
class SpiritService:              # Class
async def generate_response():   # Function
MAX_SESSION_USERS = 6            # Constant
_internal_cache = {}             # Private
```

### Frontend (TypeScript)
- **Files**: `kebab-case.tsx` or `kebab-case.ts`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types**: `PascalCase`

```typescript
// Good examples
components/ouija/ouija-board.tsx  // File
export const OuijaBoard: React.FC // Component
const handleMessage = () => {}    // Function
const MAX_MESSAGE_LENGTH = 500    // Constant
type SessionData = {...}          // Type
```

## Import Organization

### Backend Import Order
1. Standard library imports
2. Third-party imports
3. Local application imports

```python
# Standard library
import asyncio
from typing import List, Optional

# Third-party
from fastapi import FastAPI, WebSocket
from sqlalchemy import select

# Local
from app.core.config import settings
from app.models.session import Session
from app.services.kiro_spirit import SpiritService
```

### Frontend Import Order
1. React and Next.js
2. Third-party libraries
3. Components
4. Utilities and types
5. Styles

```typescript
// React/Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Third-party
import { motion } from 'framer-motion';
import { useWebSocket } from 'socket.io-client';

// Components
import { OuijaBoard } from '@/components/ouija/ouija-board';
import { Button } from '@/components/ui/button';

// Utilities and types
import { cn } from '@/lib/utils';
import type { Session } from '@/types/session';

// Styles
import '@/styles/ouija.css';
```

## Component Architecture

### Backend Service Pattern
```python
# app/services/kiro_spirit.py

class SpiritService:
    """Service for interacting with Kiro AI spirit."""
    
    def __init__(self, kiro_client: KiroClient):
        self.kiro = kiro_client
    
    async def generate_response(
        self,
        session_history: List[Message],
        question: str
    ) -> SpiritResponse:
        """Generate spirit response using Kiro."""
        ...
```

### Frontend Component Pattern
```typescript
// components/ouija/ouija-board.tsx

interface OuijaBoardProps {
  sessionId: string;
  onMessageSent: (message: string) => void;
}

export const OuijaBoard: React.FC<OuijaBoardProps> = ({
  sessionId,
  onMessageSent,
}) => {
  // State
  const [isRevealing, setIsRevealing] = useState(false);
  
  // Hooks
  const { sendMessage } = useWebSocket(sessionId);
  
  // Effects
  useEffect(() => {
    // Setup
  }, []);
  
  // Handlers
  const handleSubmit = async (question: string) => {
    // Logic
  };
  
  // Render
  return (
    <div className="ouija-board">
      {/* JSX */}
    </div>
  );
};
```

## Configuration Management

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/seance
POSTGRES_USER=seance
POSTGRES_PASSWORD=secret
POSTGRES_DB=seance

# Redis
REDIS_URL=redis://localhost:6379/0

# API Keys
KIRO_API_KEY=your_kiro_key
ELEVENLABS_API_KEY=your_elevenlabs_key

# Security
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=["http://localhost:3000"]

# Environment
ENVIRONMENT=development
LOG_LEVEL=info
```

### Frontend (.env.local)
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Feature Flags
NEXT_PUBLIC_ENABLE_VOICE_INPUT=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
```

## Database Schema Patterns

### Model Definition
```python
# app/models/session.py

from sqlalchemy import Column, String, DateTime, Integer
from app.db.base import Base

class Session(Base):
    """Séance session model."""
    
    __tablename__ = "sessions"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)
    max_users = Column(Integer, default=6)
    
    # Relationships
    messages = relationship("Message", back_populates="session")
```

### Schema Definition (Pydantic)
```python
# app/schemas/session.py

from pydantic import BaseModel
from datetime import datetime

class SessionBase(BaseModel):
    """Base session schema."""
    name: str
    max_users: int = 6

class SessionCreate(SessionBase):
    """Schema for creating session."""
    pass

class SessionResponse(SessionBase):
    """Schema for session response."""
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True
```

## API Route Patterns

### RESTful Endpoints
```python
# app/api/sessions.py

from fastapi import APIRouter, Depends
from app.schemas.session import SessionCreate, SessionResponse

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.post("/", response_model=SessionResponse)
async def create_session(
    session_data: SessionCreate,
    db: AsyncSession = Depends(get_db)
) -> SessionResponse:
    """Create a new Séance session."""
    ...

@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    db: AsyncSession = Depends(get_db)
) -> SessionResponse:
    """Get session by ID."""
    ...
```

### WebSocket Patterns
```python
# app/api/websocket.py

from fastapi import WebSocket, WebSocketDisconnect
from app.core.websocket_manager import manager

@router.websocket("/ws/{session_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: str
):
    """WebSocket connection for real-time updates."""
    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast(session_id, data)
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
```

## Testing Organization

### Backend Tests
```python
# tests/unit/test_kiro_spirit.py

import pytest
from app.services.kiro_spirit import SpiritService

@pytest.mark.asyncio
async def test_generate_response(mock_kiro_client):
    """Test spirit response generation."""
    service = SpiritService(mock_kiro_client)
    response = await service.generate_response([], "test question")
    assert response.text is not None
    assert len(response.text) <= 30  # Max 30 words
```

### Frontend Tests
```typescript
// __tests__/components/ouija-board.test.tsx

import { render, screen } from '@testing-library/react';
import { OuijaBoard } from '@/components/ouija/ouija-board';

describe('OuijaBoard', () => {
  it('renders letter grid', () => {
    render(<OuijaBoard sessionId="test" onMessageSent={jest.fn()} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
```

## Docker Configuration

### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

## Error Handling Patterns

### Backend
```python
# Consistent error responses
from fastapi import HTTPException

def raise_not_found(resource: str, id: str):
    raise HTTPException(
        status_code=404,
        detail=f"{resource} with id {id} not found"
    )
```

### Frontend
```typescript
// Consistent error handling
try {
  await sendMessage(text);
} catch (error) {
  console.error('Failed to send message:', error);
  toast.error('Failed to send message. Please try again.');
}
```

## Git Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `fix/*`: Bug fixes
- `docs/*`: Documentation updates

### Commit Convention
```bash
# Format: <type>(<scope>): <subject>

feat(websocket): add session room management
fix(audio): resolve stereo panning issue
docs(readme): update setup instructions
style(frontend): format with prettier
refactor(backend): simplify kiro integration
test(unit): add spirit service tests
chore(deps): update dependencies
```
