# Séance - Technology Stack

## Tech Stack Overview

Séance uses a modern, production-ready stack optimized for real-time communication, AI integration, and immersive user experiences.

## Backend Stack

### Core Framework
- **FastAPI (latest fastapi 0.121.1)+**: Primary web framework
  - Async/await native support
  - WebSocket built-in
  - OpenAPI auto-generation
  - Type hints with Pydantic

### Real-Time Communication
- **WebSockets**: Primary protocol for real-time updates
- **Redis Pub/Sub**: Session state and message broadcasting
- **Redis**: Session caching and rate limiting

### Database
- **PostgreSQL 15+(i already have postgres 16 installed locally or we can use supabase too)**: Primary data store
  - Session history
  - User profiles (minimal)
  - Message persistence
- **SQLAlchemy 2.0(latest version is SQLAlchemy 2.0.44)**: ORM with async support
- **Alembic(latest alembic 1.17.1)**: Database migrations

### AI/ML Integration
- **Kiro API**: Primary AI provider for spirit responses
  - Steering docs for personality
  - Agent hooks for automation
  - MCP for session context
- **LangChain (latest langchain 1.0.5)**: Conversation orchestration (optional fallback)
- **OpenAI SDK**: Backup AI provider if needed or use the Gemini models with the google google-genai library, latest version being 1.49.0

### Audio Processing
- **ElevenLabs API**(or any other better api key that is also free): 
    Premium TTS service
  - "Ghost" voice preset
  - Stereo audio generation
- **Pydub**: Audio file manipulation (caching)
- **FFmpeg**: Audio format conversion

### Authentication & Security
- **JWT (PyJWT)**: Session tokens
- **Passlib + Bcrypt**: Password hashing (if accounts added later)
- **CORS middleware**: Frontend access control
- **Rate limiting**: Redis-based request throttling

### Development Tools
- **Black**: Code formatting
- **Ruff**: Fast Python linter
- **MyPy**: Static type checking
- **Pytest**: Testing framework
- **pytest-asyncio**: Async test support

### Deployment
- **Docker**: Containerization
- **Docker Compose**: Local development
- **Railway / Render**: Production hosting
- **GitHub Actions**: CI/CD pipeline

## Frontend Stack

### Core Framework
- **Next.js 15+**: React framework with App Router
- **React 18+**: UI library
- **TypeScript 5+**: Type safety

### Styling & Animation
- **Tailwind CSS 3.4+**: Utility-first styling
- **Framer Motion 11+**: Animation library
  - Planchette movement
  - Letter reveals
  - Particle effects
- **Lucide React**: Icon system

### Real-Time Communication
- **Socket.IO Client**: WebSocket client
  - Auto-reconnection
  - Room management
  - Event handling

### Audio System
- **Web Audio API**: Native browser audio
  - Stereo panning
  - Spatial positioning
  - Audio graph management
- **Howler.js**: Sound effects library
  - Sprite sheets
  - Spatial audio
  - Cross-browser compatibility

### State Management
- **Zustand**: Lightweight state management
  - Session state
  - User presence
  - Audio state
- **React Context**: Component-level state

### UI Components
- **Radix UI**: Accessible component primitives
  - Dialogs
  - Tooltips
  - Dropdown menus
- **Custom components**: Ouija board elements

### Development Tools
- **ESLint**: JavaScript linter
- **Prettier**: Code formatting
- **TypeScript**: Static typing
- **Jest + React Testing Library**: Testing

### Deployment
- **Vercel**: Frontend hosting
  - Edge functions
  - Analytics
  - Preview deployments

## Infrastructure

### Cloud Services
- **Supabase**: PostgreSQL hosting
  - Connection pooling
  - Realtime subscriptions (backup)
- **Upstash Redis**: Managed Redis
  - Pub/Sub
  - Session cache
  - Rate limiting
- **Railway / Render**: Backend hosting
  - Docker deployment
  - Auto-scaling
  - Managed SSL

### CDN & Assets
- **Vercel Edge Network**: Static assets
- **Cloudflare**: DNS and DDoS protection

### Monitoring & Logging
- **Sentry**: Error tracking
  - Backend exceptions
  - Frontend errors
  - Performance monitoring
- **LogTail / BetterStack**: Structured logging
- **Prometheus + Grafana**: (Optional) Metrics

### Analytics
- **Plausible**: Privacy-friendly analytics
- **PostHog**: (Optional) Product analytics

## Development Environment

### Required Tools
- **Python 3.11+**: Backend runtime
- **Node.js 20+**: Frontend tooling
- **Docker Desktop**: Containerization
- **PostgreSQL**: Local database
- **Redis**: Local cache
- **VS Code / Cursor**: IDE with Kiro extension

### Recommended Extensions
- Kiro AI IDE extension
- Python (Microsoft)
- Pylance
- ESLint
- Prettier
- Tailwind CSS IntelliSense

### Environment Variables
```bash
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/seance
REDIS_URL=redis://localhost:6379
KIRO_API_KEY=your_kiro_key
ELEVENLABS_API_KEY=your_elevenlabs_key
JWT_SECRET=your_secret_key
CORS_ORIGINS=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## API Design Standards

### RESTful Endpoints
```
POST   /api/sessions           # Create new session
GET    /api/sessions/:id       # Get session details
POST   /api/sessions/:id/join  # Join existing session
DELETE /api/sessions/:id       # End session (creator only)
GET    /api/sessions/:id/history  # Get message history
```

### WebSocket Events
```
# Client → Server
join_session      # Join a session room
send_message      # User asks question
leave_session     # Leave session

# Server → Client
user_joined       # New user joined
user_left         # User left
spirit_thinking   # AI is generating response
spirit_response   # AI response ready
error            # Error occurred
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2025-11-09T12:00:00Z"
}
```

## Performance Requirements

### Backend
- API response time: < 100ms (p95)
- WebSocket latency: < 50ms
- Spirit response generation: < 3s
- Database queries: < 50ms
- Concurrent sessions: 100+ (with scaling)

### Frontend
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Animation frame rate: 60 FPS
- Audio latency: < 500ms
- Bundle size: < 500KB (initial)

### Infrastructure
- Uptime: 99.5%+
- SSL/TLS: Required
- HTTPS only: Enforced
- Backup frequency: Daily

## Security Standards

### Backend Security
- Input validation: Pydantic models
- SQL injection: Parameterized queries (SQLAlchemy)
- XSS prevention: Response sanitization
- CSRF: Token-based (if needed)
- Rate limiting: 100 requests/minute per IP

### Frontend Security
- Content Security Policy: Strict
- HTTPS only: Enforced
- No inline scripts: Required
- Dependency scanning: Automated

### Data Privacy
- Minimal data collection: Only session essentials
- No tracking cookies: Privacy-first
- Session data retention: 7 days
- User data: Optional (guest mode default)

## Testing Strategy

### Backend Testing
```python
# Unit tests
pytest tests/unit/ --cov

# Integration tests
pytest tests/integration/

# E2E tests
pytest tests/e2e/
```

### Frontend Testing
```bash
# Unit tests
npm run test

# Component tests
npm run test:components

# E2E tests (Playwright)
npm run test:e2e
```

### Load Testing
- Apache Bench: Basic load testing
- K6: Advanced scenarios
- Target: 100 concurrent sessions

## Coding Conventions

### Python (Backend)
- Style: Black (default config)
- Imports: isort with Black profile
- Type hints: Required for all functions
- Docstrings: Google style
- Max line length: 88 characters

```python
# Good
async def create_session(
    user_id: str,
    session_name: str,
    db: AsyncSession
) -> SessionModel:
    """Create a new Séance session.
    
    Args:
        user_id: The creator's user ID
        session_name: Name for the session
        db: Database session
        
    Returns:
        Created session model
    """
    ...
```

### TypeScript (Frontend)
- Style: Prettier (default config)
- Naming: camelCase for variables, PascalCase for components
- Exports: Named exports preferred
- File naming: kebab-case.tsx

```typescript
// Good
export const OuijaBoard: React.FC<OuijaBoardProps> = ({
  sessionId,
  onMessageSent,
}) => {
  ...
}
```

### Git Conventions
- Branch naming: `feature/description`, `fix/description`
- Commits: Conventional Commits format
  - `feat: add stereo audio support`
  - `fix: resolve WebSocket reconnection issue`
  - `docs: update API documentation`

## Dependencies Management

### Backend (requirements.txt / pyproject.toml)
```toml
[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.104.0"
uvicorn = {extras = ["standard"], version = "^0.24.0"}
sqlalchemy = "^2.0.0"
alembic = "^1.12.0"
redis = "^5.0.0"
pydantic = "^2.4.0"
python-jose = "^3.3.0"
elevenlabs = "^0.2.0"
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "socket.io-client": "^4.6.0",
    "framer-motion": "^11.0.0",
    "zustand": "^4.4.0",
    "howler": "^2.2.3"
  }
}
```

## AI Integration (Kiro)

### Steering Documents
- Location: `.kiro/steering/`
- Format: Markdown with YAML frontmatter
- Inclusion: Configure per file
- Update frequency: As needed

### Agent Hooks
- Location: `.kiro/hooks/`
- Format: JSON configuration
- Triggers: File events, commands
- Actions: Automated workflows

### MCP Servers
- Session Memory: Track conversation context
- User Tracking: Remember participants
- Analytics: Log response quality

## Browser Support

### Minimum Requirements
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Progressive Enhancement
- WebRTC: Optional for future features
- Service Workers: PWA support
- Local Storage: Session persistence
- IndexedDB: Offline message queue

## Accessibility Standards

- WCAG 2.1 Level AA compliance
- Keyboard navigation: Full support
- Screen readers: Semantic HTML
- Color contrast: 4.5:1 minimum
- Focus indicators: Visible
- ARIA labels: Comprehensive

## Platform Constraints

### Browser Limitations
- Web Audio API: Requires user interaction to start
- WebSocket: Max connections per domain varies
- Local Storage: 5-10MB limit
- IndexedDB: 50MB+ available

### Mobile Considerations
- Touch targets: 44x44px minimum
- Viewport: Responsive breakpoints
- Performance: Reduced animations on low-end devices
- Battery: Optimize for mobile efficiency
