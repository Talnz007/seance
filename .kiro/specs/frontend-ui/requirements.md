# Séance Frontend Requirements Document

## Introduction

The Séance frontend is a Next.js 15 application that provides an immersive, supernatural user interface for multi-user AI spirit communication. Users interact with an animated Ouija board to ask questions and receive cryptic responses from an AI spirit, with real-time synchronization across all participants in a session.

## Glossary

- **Frontend Application**: The Next.js 15 web application that provides the user interface
- **Ouija Board Interface**: The visual component displaying letters, numbers, and control words (YES, NO, GOODBYE)
- **Planchette**: The animated pointer that moves across the Ouija board to spell out spirit responses
- **Session Room**: A shared space where multiple users can interact with the spirit simultaneously
- **Spirit Response**: AI-generated messages revealed letter-by-letter through planchette animation
- **WebSocket Client**: The browser-side connection that enables real-time communication with the backend
- **Letter Timing**: Array of millisecond delays controlling planchette movement speed between letters
- **Session Store**: Zustand state management store for session data, users, and messages

## Requirements

### Requirement 1: Session Management

**User Story:** As a user, I want to create or join séance sessions, so that I can communicate with the spirit alone or with friends.

#### Acceptance Criteria

1. WHEN a user visits the landing page, THE Frontend Application SHALL display options to create a new session or join an existing session
2. WHEN a user clicks create session, THE Frontend Application SHALL display a form with session name input and max users selection
3. WHEN a user submits the create session form with valid data, THE Frontend Application SHALL call the backend API to create a session and redirect to the session room
4. WHEN a user enters a valid session ID in the join form, THE Frontend Application SHALL verify the session exists and redirect to the session room
5. IF the session ID is invalid or the session is full, THEN THE Frontend Application SHALL display an error message to the user

### Requirement 2: Ouija Board Interface

**User Story:** As a user, I want to see a beautifully designed Ouija board with smooth animations, so that the experience feels immersive and supernatural.

#### Acceptance Criteria

1. THE Frontend Application SHALL render a letter grid containing letters A-Z, numbers 0-9, and control words YES, NO, and GOODBYE
2. THE Frontend Application SHALL display the Planchette as a circular pointer with a transparent center
3. WHEN the spirit is revealing a message, THE Frontend Application SHALL animate the Planchette to move smoothly between letters using Framer Motion
4. THE Frontend Application SHALL apply a dark theme with purple and green accents following the color scheme defined in ui-components.md
5. WHEN the Planchette hovers over a letter, THE Frontend Application SHALL apply a glowing effect to that letter

### Requirement 3: Real-Time Communication

**User Story:** As a user, I want to see other participants' questions and spirit responses in real-time, so that the séance feels like a shared experience.

#### Acceptance Criteria

1. WHEN a user enters a session room, THE Frontend Application SHALL establish a WebSocket connection to the backend
2. WHEN the WebSocket connection is established, THE Frontend Application SHALL send user identification data to the backend
3. WHEN another user joins the session, THE Frontend Application SHALL display a notification and update the user list
4. WHEN any user sends a message, THE Frontend Application SHALL broadcast the message to all participants through the WebSocket
5. WHEN the WebSocket connection is lost, THE Frontend Application SHALL display a disconnected status and attempt to reconnect

### Requirement 4: Message Input and Display

**User Story:** As a user, I want to ask questions to the spirit and see the responses displayed on the Ouija board, so that I can interact with the AI entity.

#### Acceptance Criteria

1. THE Frontend Application SHALL display a text input field for users to type their questions
2. WHEN a user submits a question, THE Frontend Application SHALL send the message through the WebSocket to the backend
3. WHEN the backend indicates the spirit is thinking, THE Frontend Application SHALL display a loading state on the Ouija board
4. WHEN a spirit response is received, THE Frontend Application SHALL animate the Planchette to spell out the message letter-by-letter
5. THE Frontend Application SHALL use the letter_timings array from the backend to control the speed of Planchette movement between letters

### Requirement 5: User Presence and List

**User Story:** As a user, I want to see who else is in the séance session, so that I know who I'm sharing the experience with.

#### Acceptance Criteria

1. THE Frontend Application SHALL display a list of all users currently in the session
2. WHEN a user joins, THE Frontend Application SHALL add their name to the user list with a join animation
3. WHEN a user leaves, THE Frontend Application SHALL remove their name from the user list with a fade-out animation
4. THE Frontend Application SHALL display the current user count and maximum user limit
5. THE Frontend Application SHALL highlight the current user's name in the user list

### Requirement 6: Message History

**User Story:** As a user, I want to see a history of questions and spirit responses, so that I can review the conversation.

#### Acceptance Criteria

1. THE Frontend Application SHALL display a scrollable message feed showing all questions and spirit responses
2. THE Frontend Application SHALL visually distinguish user messages from spirit messages using different styling
3. WHEN a new message is added, THE Frontend Application SHALL automatically scroll to show the latest message
4. THE Frontend Application SHALL display the user name and timestamp for each message
5. THE Frontend Application SHALL persist messages in the Session Store throughout the session

### Requirement 7: Responsive Design and Accessibility

**User Story:** As a user, I want the application to work on different devices and be accessible, so that everyone can participate regardless of their device or abilities.

#### Acceptance Criteria

1. THE Frontend Application SHALL render correctly on desktop, tablet, and mobile screen sizes
2. THE Frontend Application SHALL support keyboard navigation for all interactive elements
3. THE Frontend Application SHALL include ARIA labels for screen reader compatibility
4. THE Frontend Application SHALL maintain a minimum color contrast ratio of 4.5:1 for text elements
5. THE Frontend Application SHALL provide focus indicators for all focusable elements

### Requirement 8: Error Handling and Loading States

**User Story:** As a user, I want clear feedback when errors occur or content is loading, so that I understand what's happening.

#### Acceptance Criteria

1. WHEN the Frontend Application is loading session data, THE Frontend Application SHALL display a loading spinner or skeleton screen
2. IF an API request fails, THEN THE Frontend Application SHALL display an error message with a retry option
3. IF the WebSocket connection fails, THEN THE Frontend Application SHALL display a connection error and attempt automatic reconnection
4. THE Frontend Application SHALL validate user input and display inline validation errors before submission
5. THE Frontend Application SHALL implement an error boundary to catch and display React component errors gracefully

### Requirement 9: Animation Performance

**User Story:** As a user, I want smooth animations that don't lag or stutter, so that the experience feels polished and professional.

#### Acceptance Criteria

1. THE Frontend Application SHALL maintain 60 frames per second during Planchette animations
2. THE Frontend Application SHALL use CSS transforms for animations instead of position properties
3. THE Frontend Application SHALL debounce rapid state updates to prevent excessive re-renders
4. THE Frontend Application SHALL use React.memo for components that don't need frequent re-renders
5. THE Frontend Application SHALL lazy load heavy components that are not immediately visible

### Requirement 10: State Management

**User Story:** As a developer, I want a clear state management pattern, so that the application is maintainable and predictable.

#### Acceptance Criteria

1. THE Frontend Application SHALL use Zustand for global state management of session data, users, and messages
2. THE Frontend Application SHALL use React useState for local component state
3. THE Frontend Application SHALL use useCallback and useMemo to optimize performance-critical functions and computations
4. THE Frontend Application SHALL provide clear actions in the Session Store for updating state
5. THE Frontend Application SHALL reset the Session Store when a user leaves a session
