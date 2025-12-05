# Implementation Plan

- [x] 1. Set up project structure and configuration
  - Create backend directory structure following structure.md conventions
  - Set up requirements.txt with FastAPI, SQLAlchemy, Alembic, and dependencies
  - Create .env.example with required environment variables
  - Create app/__init__.py and basic package structure
  - _Requirements: 1.1, 2.1, 4.1, 6.1, 7.1, 9.1, 10.1, 12.1_

- [x] 2. Implement configuration management
  - Create app/config.py with Pydantic Settings class
  - Define all configuration variables (DATABASE_URL, JWT_SECRET, CORS_ORIGINS, etc.)
  - Implement environment variable loading with validation
  - Add configuration for logging levels and environment detection
  - _Requirements: 6.2, 7.3, 9.4, 10.4_

F- [x] 3.1 Create database configuration
  - Create app/db/__init__.py
  - Create app/db/base.py with SQLAlchemy declarative base
  - Create app/db/session.py with async engine and session factory
  - Configure connection pooling with pool_size=20, max_overflow=10
  - Implement get_db() dependency injection function
  - _Requirements: 4.4, 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 3.2 Implement database models
  - Create app/models/__init__.py
  - Create app/models/session.py with Session model (id, name, created_at, max_users, is_active)
  - Create app/models/message.py with Message model (id, session_id, user_name, text, timestamp, is_spirit)
  - Create app/models/user.py with User model (id, name, joined_at)
  - Define relationships between Session and Message models
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 4. Configure Alembic for migrations
  - Initialize Alembic in backend directory
  - Configure alembic.ini with async database URL
  - Update alembic/env.py to import models and support async migrations
  - Create initial migration for Session, Message, and User tables
  - Test migration with upgrade and downgrade commands
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 5. Implement Pydantic schemas
- [x] 5.1 Create session schemas
  - Create app/schemas/__init__.py
  - Create app/schemas/session.py with SessionBase, SessionCreate, SessionResponse
  - Add validation for name length (1-100 characters)
  - Add default value for max_users (6)
  - Configure from_attributes for ORM compatibility
  - _Requirements: 1.4, 1.5, 5.5, 11.5_

- [x] 5.2 Create message and WebSocket schemas
  - Create app/schemas/message.py with MessageBase, MessageCreate, MessageResponse
  - Create app/schemas/websocket.py with event schemas (WSEvent, UserJoinedEvent, MessageReceivedEvent)
  - Add validation for message length (max 500 characters)
  - Define event type enums for WebSocket events
  - _Requirements: 3.4, 3.5, 5.5_

- [x] 6. Implement security layer
  - Create app/core/__init__.py
  - Create app/core/security.py with JWT functions
  - Implement create_access_token() with configurable expiration
  - Implement verify_token() for JWT validation
  - Add password hashing functions (get_password_hash, verify_password) for future use
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 7. Implement WebSocket connection manager
  - Create app/core/websocket_manager.py with ConnectionManager class
  - Implement active_connections dict (session_id → List[WebSocket])
  - Implement user_registry dict (WebSocket → user_info)
  - Implement connect() method to register connections and broadcast user_joined
  - Implement disconnect() method to cleanup and broadcast user_left
  - Implement broadcast() method with dead connection handling
  - Implement send_to() method for individual messages
  - Implement get_session_users() method
  - Create global manager instance
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 8.3, 8.5_

- [x] 8. Implement session service
  - Create app/services/__init__.py
  - Create app/services/session_service.py
  - Implement create_session() function with UUID generation and timestamp
  - Implement get_session() function with database query
  - Add business logic validation (name length, max_users range)
  - Handle database errors and return appropriate exceptions
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 11.1, 11.2, 11.3_

- [x] 9. Implement session API endpoints
  - Create app/api/__init__.py
  - Create app/api/deps.py with get_db dependency
  - Create app/api/sessions.py with APIRouter
  - Implement POST /api/sessions endpoint with SessionCreate schema
  - Implement GET /api/sessions/{session_id} endpoint with SessionResponse
  - Add proper HTTP status codes (201 for create, 200 for get, 404 for not found)
  - Format responses with success/error structure and meta timestamp
  - Add OpenAPI documentation with descriptions and response models
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 5.3, 5.4, 11.1, 11.2, 11.3, 11.4_

- [x] 10. Implement WebSocket handler
- [x] 10.1 Create WebSocket endpoint
  - Create app/api/websocket.py with APIRouter
  - Implement WebSocket endpoint at /ws/{session_id}
  - Accept connection and receive initial user data
  - Register connection with WebSocket manager
  - Implement message receive loop
  - Handle WebSocketDisconnect exception
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 8.4_

- [x] 10.2 Implement message handling
  - Implement handle_user_message() function
  - Validate message content (not empty, max 500 chars)
  - Broadcast message_received event to all participants
  - Send error events for invalid messages
  - Broadcast spirit_thinking event (placeholder for AI integration)
  - _Requirements: 3.1, 3.2, 3.4, 3.5, 8.1, 8.2_

- [x] 11. Implement structured logging
  - Create app/utils/__init__.py
  - Create app/utils/logger.py with structlog configuration
  - Configure JSON formatting for production, human-readable for development
  - Log WebSocket connection/disconnection events with session_id and user_id
  - Log API errors with request context
  - Add log level configuration from environment
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 12. Create main FastAPI application
  - Create app/main.py with FastAPI app initialization
  - Configure CORS middleware with origins from config
  - Include session and WebSocket routers
  - Add exception handlers for HTTPException and general exceptions
  - Implement /health endpoint returning status and database connectivity
  - Implement root / endpoint redirecting to /docs
  - Configure OpenAPI metadata (title, description, version)
  - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 13. Create Docker configuration
  - Create backend/Dockerfile with Python 3.11-slim base
  - Copy requirements.txt and install dependencies
  - Copy application code
  - Set CMD to run uvicorn with host 0.0.0.0 and port 8000
  - Create .dockerignore for Python cache and virtual environments
  - _Requirements: 1.1_

- [x] 14. Set up development environment
  - Create backend/README.md with setup instructions
  - Document environment variable requirements
  - Add instructions for running migrations
  - Add instructions for starting development server
  - Document API endpoints and WebSocket events
  - _Requirements: 9.5_

- [ ]* 15. Write unit tests
- [ ]* 15.1 Create test infrastructure
  - Create tests/__init__.py
  - Create tests/conftest.py with pytest fixtures
  - Create mock database session fixture
  - Create test client fixture
  - Create sample data fixtures (test_session, test_user)
  - _Requirements: All_

- [ ]* 15.2 Write service layer tests
  - Create tests/unit/test_session_service.py
  - Test create_session with valid data
  - Test create_session with invalid data (name too long, invalid max_users)
  - Test get_session with existing and non-existing IDs
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 11.1, 11.2, 11.3_

- [ ]* 15.3 Write API endpoint tests
  - Create tests/integration/test_sessions.py
  - Test POST /api/sessions with valid and invalid data
  - Test GET /api/sessions/{session_id} with existing and non-existing IDs
  - Verify response format matches success/error structure
  - Verify HTTP status codes
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 5.3, 11.1, 11.2, 11.3_

- [ ]* 15.4 Write WebSocket tests
  - Create tests/integration/test_websocket.py
  - Test WebSocket connection establishment
  - Test user registration and user_joined broadcast
  - Test message sending and message_received broadcast
  - Test disconnection and user_left broadcast
  - Test error handling for invalid messages
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.4, 3.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 16. Integration and manual testing
  - Start PostgreSQL database locally
  - Run Alembic migrations to create tables
  - Start FastAPI server with uvicorn
  - Test session creation via POST /api/sessions
  - Test session retrieval via GET /api/sessions/{id}
  - Test WebSocket connection with multiple clients
  - Test message broadcasting between clients
  - Verify error handling and logging
  - _Requirements: All_
