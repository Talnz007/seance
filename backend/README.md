# Séance Backend

AI-powered digital Ouija board backend with FastAPI, WebSocket support, and real-time multi-user session management.

## Features

- 🔮 Multi-user séance sessions with real-time WebSocket communication
- 🤖 AI spirit powered by Kiro with personality steering
- 🎙️ Text-to-speech with ElevenLabs for supernatural voice
- 🔊 Stereo audio positioning for immersive experience
- 📊 PostgreSQL database with SQLAlchemy ORM
- ⚡ Redis for session caching and pub/sub
- 🔐 JWT-based authentication
- 📝 Structured logging with structlog

## Tech Stack

- **Framework**: FastAPI 0.121.1
- **Database**: PostgreSQL 16 with SQLAlchemy 2.0.44 (async)
- **Cache**: Redis 5.2.1
- **Migrations**: Alembic 1.17.1
- **AI**: Google Gemini (FREE)
- **TTS**: ElevenLabs
- **Server**: Uvicorn with standard extras

## Quick Start

### Option 1: Docker Compose (Easiest)

```bash
# Clone and navigate to project
cd seance

# Start all services (backend, PostgreSQL, Redis)
docker-compose up -d

# Run migrations
docker-compose exec backend alembic upgrade head

# View logs
docker-compose logs -f backend
```

API available at http://localhost:8000/docs

### Option 2: Local Development

See detailed setup instructions below.

## Prerequisites

- Python 3.11+
- PostgreSQL 16+
- Redis 7+
- API keys for AI services (Google Gemini - FREE, ElevenLabs)

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret key for JWT tokens (min 32 characters)
- `GOOGLE_API_KEY`: Google Gemini API key (FREE - get at https://ai.google.dev)
- `GEMINI_MODEL`: Model to use (gemini-1.5-flash or gemini-1.5-pro)
- `ELEVENLABS_API_KEY`: ElevenLabs API key (optional)
- `CORS_ORIGINS`: Allowed frontend origins

### 4. Run Database Migrations

```bash
# Apply existing migrations
alembic upgrade head

# To create a new migration (if you modify models)
alembic revision --autogenerate -m "Description of changes"

# To rollback one migration
alembic downgrade -1

# To see current migration version
alembic current

# To see migration history
alembic history
```

### 5. Start Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- WebSocket: ws://localhost:8000/ws/{session_id}

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry
│   ├── config.py            # Configuration management
│   ├── api/                 # API routes
│   │   ├── deps.py          # Dependency injection
│   │   ├── sessions.py      # Session endpoints
│   │   └── websocket.py     # WebSocket handlers
│   ├── core/                # Core functionality
│   │   ├── security.py      # JWT, auth
│   │   ├── websocket_manager.py
│   │   └── redis_client.py
│   ├── models/              # SQLAlchemy models
│   │   ├── session.py
│   │   ├── message.py
│   │   └── user.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── session.py
│   │   ├── message.py
│   │   └── websocket.py
│   ├── services/            # Business logic
│   │   ├── kiro_spirit.py
│   │   ├── tts_service.py
│   │   └── session_service.py
│   ├── db/                  # Database
│   │   ├── base.py
│   │   └── session.py
│   └── utils/               # Utilities
│       ├── logger.py
│       └── validators.py
├── alembic/                 # Database migrations
├── tests/                   # Test suite
├── requirements.txt
├── .env.example
└── README.md
```

## API Endpoints

### REST API

- `POST /api/sessions` - Create new session
- `GET /api/sessions/{session_id}` - Get session details
- `GET /health` - Health check endpoint

### WebSocket

- `WS /ws/{session_id}` - WebSocket connection for session

#### Client → Server Events
- `send_message` - User asks question

#### Server → Client Events
- `user_joined` - New participant joined
- `user_left` - Participant left
- `message_received` - User message broadcast
- `spirit_thinking` - AI processing started
- `spirit_response` - AI response ready
- `error` - Error occurred

## Development

### Code Formatting

```bash
# Format code with Black
black app/ tests/

# Lint with Ruff
ruff check app/ tests/

# Type check with MyPy
mypy app/
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/unit/test_session_service.py
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Show current revision
alembic current
```

## Docker

### Using Docker Compose (Recommended for Development)

The easiest way to run the entire stack (backend, PostgreSQL, Redis):

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

Services will be available at:
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Build Image Manually

```bash
cd backend
docker build -t seance-backend .
```

### Run Container Manually

```bash
docker run -p 8000:8000 --env-file .env seance-backend
```

## Deployment

### Environment Variables (Production)

Ensure these are set in production:
- `ENVIRONMENT=production`
- `LOG_LEVEL=info`
- Strong `JWT_SECRET` (min 32 random characters)
- Proper `CORS_ORIGINS` for your frontend domain
- Production database URL with SSL
- Redis URL with authentication

### Health Check

The `/health` endpoint returns:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-11-10T12:00:00Z"
}
```

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format: `postgresql+asyncpg://user:pass@host:port/db`
- Ensure database exists: `createdb seance`

### Redis Connection Issues

- Verify Redis is running: `redis-cli ping`
- Check REDIS_URL format: `redis://localhost:6379/0`

### WebSocket Connection Issues

- Check CORS_ORIGINS includes your frontend URL
- Verify WebSocket URL uses `ws://` (or `wss://` for HTTPS)
- Check browser console for connection errors

## License

MIT License - See LICENSE file for details

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/seance/issues)
- Documentation: See `.kiro/steering/` for detailed guides
