# Requirements Document

## Introduction

This document defines the requirements for the Séance backend core system. The backend provides a FastAPI-based REST API and WebSocket server that enables multi-user séance sessions with AI-powered spirit responses. The system must support real-time communication, session management, user authentication, and integration with AI services for generating supernatural responses.

## Glossary

- **Backend System**: The FastAPI server application that handles HTTP requests, WebSocket connections, and business logic
- **Session**: A multi-user séance room where participants communicate with the AI spirit
- **WebSocket Manager**: Component that manages real-time WebSocket connections for session participants
- **Spirit Service**: Service that integrates with AI providers to generate spirit responses
- **Database Layer**: PostgreSQL database with SQLAlchemy ORM for data persistence
- **Authentication System**: JWT-based authentication for securing API endpoints and WebSocket connections
- **Pydantic Schema**: Data validation and serialization models for API requests and responses

## Requirements

### Requirement 1

**User Story:** As a session creator, I want to create a new séance session through an API endpoint, so that I can invite others to join

#### Acceptance Criteria

1. WHEN a POST request is sent to `/api/sessions` with valid session data, THE Backend System SHALL create a new session record in the database
2. WHEN a session is created successfully, THE Backend System SHALL return a 201 status code with the session ID and details
3. WHEN invalid session data is provided, THE Backend System SHALL return a 400 status code with validation error details
4. THE Backend System SHALL validate that session names are between 1 and 100 characters
5. THE Backend System SHALL set the default maximum users to 6 if not specified

### Requirement 2

**User Story:** As a participant, I want to join an existing session via WebSocket, so that I can communicate in real-time with other participants and the spirit

#### Acceptance Criteria

1. WHEN a WebSocket connection is initiated to `/ws/{session_id}`, THE Backend System SHALL accept the connection
2. WHEN a user joins a session, THE WebSocket Manager SHALL register the connection with user information
3. WHEN a user joins successfully, THE WebSocket Manager SHALL broadcast a `user_joined` event to all other participants in the session
4. WHEN a user disconnects, THE WebSocket Manager SHALL remove the connection and broadcast a `user_left` event
5. THE WebSocket Manager SHALL maintain a registry mapping WebSocket connections to user information

### Requirement 3

**User Story:** As a participant, I want to send messages to the spirit through WebSocket, so that I can ask questions during the séance

#### Acceptance Criteria

1. WHEN a `send_message` event is received via WebSocket, THE Backend System SHALL validate the message content
2. WHEN a valid message is received, THE Backend System SHALL broadcast a `message_received` event to all session participants
3. WHEN processing a user message, THE Backend System SHALL emit a `spirit_thinking` event to indicate AI processing
4. THE Backend System SHALL reject messages longer than 500 characters with an error event
5. THE Backend System SHALL reject empty messages with an error event

### Requirement 4

**User Story:** As the system, I want to persist session and message data in a database, so that session history can be retrieved and analyzed

#### Acceptance Criteria

1. THE Database Layer SHALL define a Session model with id, name, created_at, max_users, and is_active fields
2. THE Database Layer SHALL define a Message model with id, session_id, user_name, text, timestamp, and is_spirit fields
3. THE Database Layer SHALL define a User model with id, name, and joined_at fields for session participants
4. THE Database Layer SHALL use SQLAlchemy async support for all database operations
5. THE Database Layer SHALL establish relationships between Session and Message models

### Requirement 5

**User Story:** As an API consumer, I want all responses to follow a consistent format, so that I can reliably parse and handle responses

#### Acceptance Criteria

1. THE Backend System SHALL return success responses with `success: true`, `data` object, and `meta` object containing timestamp
2. THE Backend System SHALL return error responses with `success: false`, `error` object containing code and message, and `meta` object
3. THE Backend System SHALL use appropriate HTTP status codes for all REST endpoints
4. THE Backend System SHALL include OpenAPI documentation for all endpoints
5. THE Backend System SHALL validate all request payloads using Pydantic schemas

### Requirement 6

**User Story:** As a system administrator, I want the backend to support CORS, so that the frontend application can make cross-origin requests

#### Acceptance Criteria

1. THE Backend System SHALL configure CORS middleware to allow requests from configured origins
2. THE Backend System SHALL read allowed origins from environment variables
3. THE Backend System SHALL allow credentials in CORS requests
4. THE Backend System SHALL support preflight OPTIONS requests
5. THE Backend System SHALL allow standard HTTP methods (GET, POST, PUT, DELETE, PATCH)

### Requirement 7

**User Story:** As a developer, I want JWT-based authentication infrastructure, so that future endpoints can be secured

#### Acceptance Criteria

1. THE Authentication System SHALL provide functions to create JWT access tokens
2. THE Authentication System SHALL provide functions to verify and decode JWT tokens
3. THE Authentication System SHALL read JWT secret and algorithm from environment variables
4. THE Authentication System SHALL set token expiration based on configured duration
5. THE Authentication System SHALL provide dependency injection functions for protected endpoints

### Requirement 8

**User Story:** As a participant, I want the WebSocket connection to handle errors gracefully, so that I receive clear error messages when issues occur

#### Acceptance Criteria

1. WHEN a WebSocket error occurs, THE Backend System SHALL log the error with structured logging
2. WHEN a recoverable error occurs, THE Backend System SHALL send an error event to the affected client
3. WHEN a WebSocket disconnects unexpectedly, THE WebSocket Manager SHALL clean up the connection
4. THE Backend System SHALL handle WebSocketDisconnect exceptions without crashing
5. THE Backend System SHALL remove dead connections from the active connections registry

### Requirement 9

**User Story:** As a developer, I want database migrations managed with Alembic, so that schema changes can be version controlled and deployed safely

#### Acceptance Criteria

1. THE Backend System SHALL configure Alembic for database migrations
2. THE Backend System SHALL provide initial migration scripts for Session, Message, and User models
3. THE Backend System SHALL support async database operations in migrations
4. THE Backend System SHALL read database URL from environment variables
5. THE Backend System SHALL provide migration commands in the development workflow

### Requirement 10

**User Story:** As a system operator, I want structured logging throughout the application, so that I can monitor and debug issues effectively

#### Acceptance Criteria

1. THE Backend System SHALL use structured logging for all significant events
2. THE Backend System SHALL log WebSocket connection and disconnection events with session and user context
3. THE Backend System SHALL log API request errors with relevant context
4. THE Backend System SHALL support configurable log levels via environment variables
5. THE Backend System SHALL format logs in JSON for production environments

### Requirement 11

**User Story:** As an API consumer, I want to retrieve session details, so that I can display session information to users

#### Acceptance Criteria

1. WHEN a GET request is sent to `/api/sessions/{session_id}`, THE Backend System SHALL retrieve the session from the database
2. WHEN the session exists, THE Backend System SHALL return a 200 status code with session details
3. WHEN the session does not exist, THE Backend System SHALL return a 404 status code with an error message
4. THE Backend System SHALL include the session name, created timestamp, max users, and active status in the response
5. THE Backend System SHALL use Pydantic schemas for response serialization

### Requirement 12

**User Story:** As a developer, I want dependency injection for database sessions, so that database connections are managed efficiently

#### Acceptance Criteria

1. THE Database Layer SHALL provide an async database session factory
2. THE Database Layer SHALL provide a dependency injection function for FastAPI routes
3. THE Database Layer SHALL configure connection pooling with appropriate pool size
4. THE Database Layer SHALL enable connection pre-ping to handle stale connections
5. THE Database Layer SHALL properly close database sessions after request completion
