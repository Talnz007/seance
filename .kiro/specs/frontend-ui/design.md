# Séance Frontend Design Document

## Overview

The Séance frontend is built with Next.js 15 using the App Router, React 18, TypeScript, Tailwind CSS, and Framer Motion. The architecture follows a component-based design with clear separation between UI components, business logic (hooks), and state management (Zustand). The application provides an immersive, real-time multiplayer experience centered around an animated Ouija board interface.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
├─────────────────────────────────────────────────────────┤
│  Next.js App Router (React 18 + TypeScript)             │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Pages (App Router)                               │  │
│  │  - Landing Page (/)                               │  │
│  │  - Session Room (/session/[id])                   │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Components                                        │  │
│  │  - UI Primitives (Button, Input, Card)            │  │
│  │  - Ouija Board (Letter Grid, Planchette)          │  │
│  │  - Session (Create, Join, User List)              │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Custom Hooks                                      │  │
│  │  - useWebSocket (Real-time communication)         │  │
│  │  - useSession (Session management)                │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  State Management (Zustand)                       │  │
│  │  - Session Store (Global state)                   │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Utilities                                         │  │
│  │  - API Client (REST calls)                        │  │
│  │  - Utils (cn helper, formatters)                  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/REST & WebSocket
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (FastAPI + PostgreSQL)              │
│  - REST API (/api/sessions)                             │
│  - WebSocket (/ws/{session_id})                         │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 18
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Animation**: Framer Motion 11
- **State Management**: Zustand 4.4
- **WebSocket**: Native WebSocket API
- **HTTP Client**: Native Fetch API

## Components and Interfaces

### Component Hierarchy

```
App
├── RootLayout
│   ├── globals.css
│   └── Providers (if needed)
│
├── LandingPage (/)
│   ├── Header
│   ├── SessionCreate
│   └── SessionJoin
│
└── SessionRoomPage (/session/[id])
    ├── SessionHeader
    │   ├── SessionInfo
    │   └── ConnectionStatus
    ├── OuijaBoard
    │   ├── LetterGrid
    │   │   └── Letter (x52: A-Z, 0-9, YES, NO, GOODBYE)
    │   ├── Planchette
    │   └── MessageInput
    ├── UserList
    │   └── UserItem (x N users)
    └── MessageFeed
        └── MessageItem (x N messages)
```

### Core Components

#### 1. OuijaBoard Component

**Purpose**: Main interactive component displaying the letter grid and planchette

**Props**:
```typescript
interface OuijaBoardProps {
  sessionId: string;
  className?: string;
}
```

**State**:
- `currentLetter`: string | null - Currently highlighted letter
- `isAnimating`: boolean - Whether planchette is moving

**Behavior**:
- Renders 52 letters in a circular/arc layout
- Manages planchette animation state
- Handles message input submission
- Displays spirit response animations

**Styling**:
- Dark background (slate-950)
- Purple/green accent colors
- Glowing effects on active letters
- Responsive grid layout

#### 2. Planchette Component

**Purpose**: Animated pointer that moves across the Ouija board

**Props**:
```typescript
interface PlanchetteProps {
  targetLetter: string | null;
  isAnimating: boolean;
  letterTimings?: number[];
  onAnimationComplete?: () => void;
}
```

**State**:
- `position`: { x: number, y: number } - Current position
- `rotation`: number - Current rotation angle

**Behavior**:
- Animates smoothly between letter positions using Framer Motion
- Uses spring physics for natural movement
- Glows during animation
- Follows letter timing array for pacing

**Animation**:
```typescript
const planchetteVariants = {
  idle: { scale: 1, opacity: 0.8 },
  moving: { 
    scale: 1.1, 
    opacity: 1,
    boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)'
  }
};
```

#### 3. LetterGrid Component

**Purpose**: Displays all letters, numbers, and control words

**Props**:
```typescript
interface LetterGridProps {
  activeLetter: string | null;
  onLetterClick?: (letter: string) => void;
}
```

**Layout**:
- Top arc: A-M
- Middle arc: N-Z
- Bottom row: 0-9
- Left: YES
- Right: NO
- Center bottom: GOODBYE

**Styling**:
- Each letter in a circular container
- Active letter has glow effect
- Hover effects for interactivity

#### 4. SessionCreate Component

**Purpose**: Form for creating new sessions

**Props**:
```typescript
interface SessionCreateProps {
  onSessionCreated: (sessionId: string) => void;
}
```

**Form Fields**:
- Session name (required, 1-100 characters)
- Max users (2-12, default 6)

**Validation**:
- Name cannot be empty
- Max users must be between 2 and 12

**Behavior**:
- Calls API to create session
- Redirects to session room on success
- Displays error messages on failure

#### 5. SessionJoin Component

**Purpose**: Form for joining existing sessions

**Props**:
```typescript
interface SessionJoinProps {
  onSessionJoined: (sessionId: string) => void;
}
```

**Form Fields**:
- Session ID (required)

**Validation**:
- Session ID format validation
- Session existence check

**Behavior**:
- Verifies session exists via API
- Redirects to session room if valid
- Shows error if session not found or full

#### 6. UserList Component

**Purpose**: Displays all participants in the session

**Props**:
```typescript
interface UserListProps {
  users: User[];
  currentUserId: string;
  maxUsers: number;
}
```

**Features**:
- Shows user count (e.g., "3/6 participants")
- Highlights current user
- Animates user join/leave events
- Shows user join timestamps

#### 7. MessageFeed Component

**Purpose**: Displays conversation history

**Props**:
```typescript
interface MessageFeedProps {
  messages: Message[];
}
```

**Features**:
- Auto-scrolls to latest message
- Different styling for user vs spirit messages
- Shows timestamps
- Shows user names for user messages

#### 8. UI Primitives

**Button Component**:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}
```

**Input Component**:
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
```

**Card Component**:
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated';
}
```

## Data Models

### TypeScript Interfaces

#### Session
```typescript
interface Session {
  id: string;
  name: string;
  created_at: string;
  max_users: number;
  is_active: boolean;
}
```

#### User
```typescript
interface User {
  id: string;
  name: string;
  joined_at: string;
}
```

#### Message
```typescript
interface Message {
  type: 'user' | 'spirit';
  user_name?: string;
  message: string;
  timestamp: string;
  letter_timings?: number[];
}
```

#### WebSocket Events
```typescript
// Client → Server
interface SendMessageEvent {
  event: 'send_message';
  data: {
    user_name: string;
    message: string;
  };
}

// Server → Client
interface UserJoinedEvent {
  event: 'user_joined';
  data: User;
}

interface UserLeftEvent {
  event: 'user_left';
  data: User;
}

interface MessageReceivedEvent {
  event: 'message_received';
  data: {
    user_name: string;
    message: string;
    timestamp: string;
  };
}

interface SpiritThinkingEvent {
  event: 'spirit_thinking';
  data: {};
}

interface SpiritResponseEvent {
  event: 'spirit_response';
  data: {
    message: string;
    letter_timings: number[];
    timestamp: string;
  };
}

interface ErrorEvent {
  event: 'error';
  data: {
    message: string;
    code?: string;
  };
}
```

## State Management

### Zustand Store Structure

```typescript
interface SessionState {
  // Data
  session: Session | null;
  users: User[];
  messages: Message[];
  isConnected: boolean;
  isRevealing: boolean;
  
  // Actions
  setSession: (session: Session) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  addMessage: (message: Message) => void;
  setConnected: (connected: boolean) => void;
  setRevealing: (revealing: boolean) => void;
  reset: () => void;
}
```

### State Flow

1. **Session Creation/Join**:
   - User submits form → API call → Session data received → Store updated → Redirect to room

2. **WebSocket Connection**:
   - Enter room → WebSocket connects → Send user info → Receive events → Update store

3. **Message Flow**:
   - User types message → Submit → WebSocket send → Backend processes → Spirit response → Planchette animation → Store updated

4. **User Presence**:
   - User joins → WebSocket event → Add to store → UI updates
   - User leaves → WebSocket event → Remove from store → UI updates

## Custom Hooks

### useWebSocket Hook

**Purpose**: Manages WebSocket connection and event handling

**Parameters**:
```typescript
interface UseWebSocketOptions {
  sessionId: string;
  userId: string;
  userName: string;
}
```

**Returns**:
```typescript
interface UseWebSocketReturn {
  sendMessage: (message: string) => void;
}
```

**Behavior**:
- Establishes WebSocket connection on mount
- Sends user identification on connect
- Listens for all WebSocket events
- Updates Zustand store based on events
- Cleans up connection on unmount
- Handles reconnection on disconnect

### useSession Hook

**Purpose**: Manages session data and API calls

**Parameters**:
```typescript
interface UseSessionOptions {
  sessionId: string;
}
```

**Returns**:
```typescript
interface UseSessionReturn {
  session: Session | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

**Behavior**:
- Fetches session data on mount
- Provides loading and error states
- Allows manual refetch
- Updates Zustand store with session data

## Animation Strategy

### Planchette Movement

**Approach**: Use Framer Motion's `motion.div` with spring animation

**Implementation**:
```typescript
<motion.div
  animate={{
    x: targetPosition.x,
    y: targetPosition.y,
    rotate: targetRotation
  }}
  transition={{
    type: 'spring',
    stiffness: 100,
    damping: 20,
    duration: letterTiming / 1000
  }}
/>
```

**Letter Timing**:
- Backend provides array of millisecond delays
- Frontend sequences animations based on array
- Each letter gets its own timing for dramatic effect

### Letter Highlighting

**Approach**: CSS transitions with Tailwind classes

**Implementation**:
```typescript
<div className={cn(
  'letter',
  'transition-all duration-300',
  isActive && 'shadow-glow scale-110'
)} />
```

### User Join/Leave Animations

**Approach**: Framer Motion variants

**Implementation**:
```typescript
const userVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};
```

## Error Handling

### Error Boundary

**Implementation**: React Error Boundary component

**Behavior**:
- Catches React component errors
- Displays fallback UI
- Logs errors to console (future: send to Sentry)
- Provides "Try Again" button

### API Error Handling

**Pattern**:
```typescript
try {
  const session = await api.createSession(data);
  // Success handling
} catch (error) {
  console.error('Failed to create session:', error);
  setError(error.message);
  // Display error to user
}
```

### WebSocket Error Handling

**Pattern**:
```typescript
socket.onerror = (error) => {
  console.error('WebSocket error:', error);
  setConnected(false);
  // Attempt reconnection after delay
  setTimeout(() => reconnect(), 3000);
};
```

## Testing Strategy

### Component Testing

**Tool**: Jest + React Testing Library

**Approach**:
- Unit tests for individual components
- Integration tests for component interactions
- Mock WebSocket and API calls

**Example**:
```typescript
describe('OuijaBoard', () => {
  it('renders letter grid', () => {
    render(<OuijaBoard sessionId="test" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });
  
  it('animates planchette on spirit response', async () => {
    // Test animation logic
  });
});
```

### Hook Testing

**Tool**: @testing-library/react-hooks

**Approach**:
- Test hook behavior in isolation
- Mock dependencies (WebSocket, API)

**Example**:
```typescript
describe('useWebSocket', () => {
  it('connects on mount', () => {
    const { result } = renderHook(() => useWebSocket({
      sessionId: 'test',
      userId: 'user1',
      userName: 'Test User'
    }));
    
    // Assert connection established
  });
});
```

### E2E Testing

**Tool**: Playwright (future)

**Scenarios**:
- Create session flow
- Join session flow
- Send message and receive spirit response
- Multi-user interaction

## Performance Optimization

### Code Splitting

**Approach**: Next.js automatic code splitting + dynamic imports

**Implementation**:
```typescript
const HeavyComponent = dynamic(() => import('@/components/heavy'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

### Memoization

**Approach**: React.memo, useMemo, useCallback

**Implementation**:
```typescript
// Memoize expensive component
const LetterGrid = React.memo(({ letters, activeLetter }) => {
  // Component logic
});

// Memoize expensive calculation
const sortedMessages = useMemo(() => {
  return messages.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}, [messages]);

// Memoize callback
const handleSendMessage = useCallback((message: string) => {
  sendMessage(message);
}, [sendMessage]);
```

### Animation Performance

**Approach**: Use CSS transforms, will-change property

**Implementation**:
```css
.planchette {
  will-change: transform;
  transform: translateZ(0); /* Force GPU acceleration */
}
```

## Accessibility

### Keyboard Navigation

**Implementation**:
- All interactive elements have `tabIndex`
- Enter/Space trigger button actions
- Escape closes modals
- Arrow keys navigate letter grid (optional)

### Screen Reader Support

**Implementation**:
- Semantic HTML elements
- ARIA labels for all interactive elements
- ARIA live regions for dynamic content
- Alt text for images

**Example**:
```typescript
<div
  role="region"
  aria-label="Ouija board interface"
  aria-live="polite"
>
  <div aria-label={`Spirit message: ${spiritMessage}`}>
    {spiritMessage}
  </div>
</div>
```

### Color Contrast

**Implementation**:
- Text: slate-100 on slate-950 (high contrast)
- Accent: purple-600 with sufficient contrast
- Focus indicators: visible purple outline

## Responsive Design

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
};
```

### Layout Strategy

**Mobile (< 768px)**:
- Stack layout (board above, messages below)
- Smaller letter grid
- Collapsible user list
- Full-width message input

**Tablet (768px - 1024px)**:
- Two-column layout (board + sidebar)
- Medium letter grid
- Visible user list
- Inline message input

**Desktop (> 1024px)**:
- Three-column layout (users + board + messages)
- Large letter grid
- Full user list and message feed
- Enhanced animations

## Deployment

### Build Configuration

**next.config.js**:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // For Docker
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
};

module.exports = nextConfig;
```

### Environment Variables

**Production**:
```bash
NEXT_PUBLIC_API_URL=https://api.seance.app
NEXT_PUBLIC_WS_URL=wss://api.seance.app
```

**Development**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Hosting

**Recommended**: Vercel (optimized for Next.js)

**Alternatives**:
- Netlify
- AWS Amplify
- Self-hosted with Docker

## Security Considerations

### Input Validation

- Sanitize all user inputs
- Validate session IDs format
- Limit message length (500 characters)
- Prevent XSS attacks

### WebSocket Security

- Validate WebSocket origin
- Implement rate limiting (future)
- Handle malicious messages gracefully

### Content Security Policy

**Implementation**:
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  }
];
```

## Future Enhancements

### Phase 2 Features

1. **Voice Input**: Speech-to-text for questions
2. **Audio Output**: Text-to-speech for spirit responses
3. **Session Recording**: Save and replay sessions
4. **Custom Themes**: User-selectable color schemes
5. **Mobile App**: React Native version

### Phase 3 Features

1. **Multiple Spirits**: Different AI personalities
2. **Private Sessions**: Password-protected rooms
3. **Session Analytics**: Track engagement metrics
4. **Social Sharing**: Share session highlights
5. **Premium Features**: Enhanced animations, longer sessions

## Design Decisions and Rationales

### Why Next.js 15?

- **App Router**: Modern routing with React Server Components
- **Performance**: Automatic optimization and code splitting
- **Developer Experience**: Fast refresh, TypeScript support
- **Deployment**: Seamless Vercel integration

### Why Zustand over Redux?

- **Simplicity**: Less boilerplate, easier to learn
- **Performance**: Minimal re-renders
- **Size**: Smaller bundle size (3KB vs 20KB+)
- **TypeScript**: Excellent type inference

### Why Framer Motion?

- **Declarative**: Easy-to-read animation code
- **Performance**: GPU-accelerated animations
- **Features**: Spring physics, gestures, variants
- **Community**: Well-maintained, popular library

### Why Native WebSocket over Socket.IO?

- **Simplicity**: No additional library needed
- **Performance**: Lower overhead
- **Control**: Direct access to WebSocket API
- **Compatibility**: Works with FastAPI WebSocket

## Conclusion

This design provides a solid foundation for building an immersive, performant, and accessible Séance frontend. The component-based architecture ensures maintainability, while the use of modern tools like Next.js 15, Framer Motion, and Zustand provides an excellent developer experience and optimal user experience.
