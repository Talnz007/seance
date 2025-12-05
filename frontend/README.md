# Séance Frontend

> A mystical, real-time multiplayer Ouija board experience powered by AI spirits.

![Next.js](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)
![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Component Documentation](#component-documentation)
- [State Management](#state-management)
- [WebSocket Communication](#websocket-communication)
- [Performance Optimizations](#performance-optimizations)
- [Accessibility](#accessibility)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🌟 Overview

Séance is an immersive, multi-user web application that simulates a digital Ouija board experience. Users join sessions, ask questions to an AI "spirit," and watch as responses are revealed letter-by-letter through smooth planchette animations.

**Key Highlights:**
- ✨ Real-time multiplayer sessions via WebSocket
- 🎭 Smooth, GPU-accelerated planchette animations
- 🎨 Dark, mystical UI with purple/green accents
- ♿ WCAG AA accessible
- 📱 Fully responsive (mobile, tablet, desktop)
- ⚡ Optimized for 60fps animations

---

## ✨ Features

### Core Features
- **Session Management**: Create or join sessions with up to 12 participants
- **Real-time Communication**: WebSocket-powered instant messaging
- **Ouija Board Interface**: Interactive letter grid with animated planchette
- **Spirit Responses**: AI-generated responses revealed letter-by-letter
- **User Presence**: Live user list with join/leave animations
- **Message History**: Scrollable feed of all questions and responses

### Technical Features
- **Automatic Reconnection**: Exponential backoff with up to 5 retry attempts
- **Error Handling**: Graceful degradation with user-friendly error messages
- **Performance**: React.memo, code splitting, and optimized animations
- **Accessibility**: Full keyboard navigation, ARIA labels, screen reader support
- **Responsive Design**: Mobile-first with collapsible sidebars

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router) |
| **UI Library** | React 18 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3 |
| **Animation** | Framer Motion 11 |
| **State Management** | Zustand 4 |
| **Real-time** | WebSocket API |
| **Build Tool** | Next.js built-in (Turbopack/Webpack) |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js**: v20+ (LTS recommended)
- **npm**: v10+ (comes with Node.js)
- **Backend API**: The Séance backend must be running (see backend README)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd seance/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local` with your configuration (see [Environment Variables](#environment-variables)).

### Environment Variables

Create a `.env.local` file based on `.env.local.example`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Feature Flags
NEXT_PUBLIC_ENABLE_VOICE_INPUT=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
```

**Variable Descriptions:**

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend REST API base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `ws://localhost:8000` |
| `NEXT_PUBLIC_ENABLE_VOICE_INPUT` | Enable voice input (future feature) | `false` |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics tracking | `false` |
| `NEXT_PUBLIC_ENVIRONMENT` | Environment name | `development` |

**Production URLs:**
- Replace `localhost:8000` with your production backend domain
- Use `wss://` for WebSocket in production (secure WebSocket)

### Running the Application

#### Development Mode

```bash
npm run dev
```

- Starts development server at **http://localhost:3000**
- Hot reload enabled
- Source maps available

#### Production Build

```bash
npm run build
npm run start
```

- Builds optimized production bundle
- Starts production server at **http://localhost:3000**

#### Linting

```bash
npm run lint
```

---

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   ├── globals.css          # Global styles
│   └── session/[id]/        # Dynamic session route
│       └── page.tsx         # Session room page
├── components/              # React components
│   ├── ouija/              # Ouija board components
│   │   ├── ouija-board.tsx # Main board container
│   │   ├── letter-grid.tsx # Letter layout
│   │   ├── letter.tsx      # Individual letter
│   │   ├── planchette.tsx  # Animated pointer
│   │   └── message-input.tsx # Question input
│   ├── session/            # Session management
│   │   ├── session-create.tsx
│   │   ├── session-join.tsx
│   │   ├── user-list.tsx   # Participants sidebar
│   │   ├── user-item.tsx   # Individual user
│   │   ├── message-feed.tsx # Message history
│   │   └── message-item.tsx # Individual message
│   ├── ui/                 # Primitive UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── loading-spinner.tsx
│   └── error-boundary.tsx  # Error handling
├── hooks/                  # Custom React hooks
│   ├── use-websocket.ts    # WebSocket connection
│   └── use-session.ts      # Session data fetching
├── stores/                 # Zustand state stores
│   └── session-store.ts    # Global session state
├── lib/                    # Utilities and constants
│   ├── utils.ts            # Helper functions
│   ├── api.ts              # API client
│   └── constants.ts        # App configuration
├── types/                  # TypeScript definitions
│   ├── session.ts          # Session types
│   ├── websocket.ts        # WebSocket event types
│   └── index.ts            # Type exports
├── public/                 # Static assets
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies

```

---

## 🧩 Component Documentation

### Core Components

#### `OuijaBoard`
**Path**: `components/ouija/ouija-board.tsx`

Main container for the Ouija board interface.

**Props:**
- `sessionId: string` - Current session ID
- `onSendMessage: (message: string) => Promise<boolean>` - Message send handler
- `className?: string` - Optional CSS classes

**Features:**
- Letter-by-letter spirit response animation
- Planchette movement synchronization
- Message input integration
- Responsive layout

#### `LetterGrid`
**Path**: `components/ouija/letter-grid.tsx`

Renders the 52 letters (A-Z, 0-9, YES, NO, GOODBYE) in arcs.

**Props:**
- `activeLetter?: string | null` - Currently highlighted letter
- `onLetterClick?: (letter: string) => void` - Letter click handler
- `className?: string` - Optional CSS classes

#### `Planchette`
**Path**: `components/ouija/planchette.tsx`

Animated pointer that moves to letters during spirit responses.

**Props:**
- `targetLetter?: string | null` - Letter to move to
- `isAnimating?: boolean` - Whether animation is active
- `letterTimings?: number[]` - Timing for each letter
- `onAnimationComplete?: () => void` - Callback when animation ends
- `className?: string` - Optional CSS classes

**Animation:**
- Spring physics (stiffness: 100, damping: 20)
- GPU-accelerated transforms
- Pulsing glow effect during animation

#### `UserList`
**Path**: `components/session/user-list.tsx`

Displays session participants with join/leave animations.

**Props:**
- `currentUserId?: string` - Logged-in user's ID (for highlighting)
- `className?: string` - Optional CSS classes

**Features:**
- Collapsible on mobile/tablet
- Animated enter/exit transitions
- User count display

#### `MessageFeed`
**Path**: `components/session/message-feed.tsx`

Scrollable feed of questions and spirit responses.

**Props:**
- `className?: string` - Optional CSS classes

**Features:**
- Auto-scroll to latest message
- Sorted by timestamp
- Memoized for performance
- Custom scrollbar styling

---

## 🗄 State Management

### Zustand Store (`session-store.ts`)

Global state for session data:

```typescript
interface SessionState {
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

**Usage:**
```typescript
import { useSessionStore } from '@/stores/session-store';

const { messages, addMessage } = useSessionStore();
```

---

## 🔌 WebSocket Communication

### Connection Flow

1. User joins session
2. WebSocket connects to `${WS_URL}/ws/${sessionId}`
3. Sends user identification: `{ user_id, name }`
4. Receives real-time events

### Event Types

**Client → Server:**
```typescript
{
  event: 'send_message',
  data: { user_name: string, message: string }
}
```

**Server → Client:**

| Event | Data | Description |
|-------|------|-------------|
| `user_joined` | `{ id, name, joined_at }` | New user joined |
| `user_left` | `{ id }` | User disconnected |
| `message_received` | `{ user_name, message, timestamp }` | User sent message |
| `spirit_thinking` | - | Spirit is processing |
| `spirit_response` | `{ message, timestamp, letter_timings }` | Spirit replied |
| `error` | `{ error, message }` | Error occurred |

### Reconnection Logic

- **Exponential Backoff**: 1s, 2s, 4s, 8s, 16s
- **Max Attempts**: 5
- **Auto-Reconnect**: On unexpected disconnections
- **UI Feedback**: Connection status indicator + error banner

---

## ⚡ Performance Optimizations

### React.memo
All major components are memoized:
- `OuijaBoard`, `LetterGrid`, `Letter`, `Planchette`
- `UserList`, `UserItem`
- `MessageFeed`, `MessageItem`

### useMemo
Expensive calculations cached:
- Message sorting
- Timestamp formatting
- Letter position calculations

### useCallback
Event handlers stabilized:
- WebSocket handlers
- Form submissions
- Click handlers

### Code Splitting
- `OuijaBoard` dynamically imported on session page
- Reduces initial bundle by ~15-20KB

### Animation Optimization
- CSS transforms only (GPU-accelerated)
- `will-change-transform` hint
- 60fps target maintained

**See**: `.kiro/specs/frontend-ui/performance-optimizations-summary.md` for details.

---

## ♿ Accessibility

### Keyboard Navigation
- ✅ All interactive elements tabbable
- ✅ Enter/Space to activate buttons
- ✅ Escape to close modals

### ARIA Labels
- All regions labeled (`role="region"`, `role="main"`, etc.)
- Dynamic content has `aria-live` regions
- Screen reader announcements for spirit messages

### Color Contrast
- WCAG AA compliant (4.5:1 minimum)
- Tested with contrast checker tools

### Focus Indicators
- Visible purple outlines on focus
- Consistent across all components

---

## 🚀 Deployment

### Docker Deployment

A Dockerfile can be created for containerization:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
```

**Build and run:**
```bash
docker build -t seance-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=<API_URL> seance-frontend
```

### Vercel Deployment

Next.js is production-ready for Vercel:

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard.

### Manual Deployment

```bash
npm run build
npm run start
```

Serve on port 3000 behind nginx or similar.

---

## 🐛 Troubleshooting

### WebSocket Won't Connect

**Problem**: Connection status shows "Disconnected"

**Solutions**:
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check `NEXT_PUBLIC_WS_URL` in `.env.local`
3. Ensure no firewall blocking port 8000
4. Check browser console for errors

### Planchette Not Animating

**Problem**: Spirit responses appear but planchette doesn't move

**Solutions**:
1. Check `letter_timings` in spirit response (backend)
2. Verify Framer Motion installed: `npm list framer-motion`
3. Check browser console for errors
4. Ensure GPU acceleration enabled

### Build Errors

**Problem**: `npm run build` fails

**Solutions**:
1. Delete `.next` folder and rebuild
2. Clear npm cache: `npm cache clean --force`
3. Reinstall dependencies: `rm -rf node_modules && npm install`
4. Check Node.js version: `node -v` (should be v20+)

### Type Errors

**Problem**: TypeScript errors during development

**Solutions**:
1. Restart TypeScript server in IDE
2. Check `tsconfig.json` is correct
3. Run `npm run lint` to see all errors
4. Ensure all `@types/*` packages installed

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** changes: `git commit -m 'Add my feature'`
4. **Push** to branch: `git push origin feature/my-feature`
5. **Submit** a pull request

### Code Standards

- Use TypeScript strict mode
- Follow ESLint rules: `npm run lint`
- Use Prettier for formatting (if configured)
- Write accessible components (ARIA, keyboard nav)
- Memoize expensive computations
- Add comments for complex logic

---

## 📄 License

[Add your license information here]

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Framer Motion for smooth animations
- Zustand for simple state management
- Tailwind CSS for utility-first styling

---

**Built with 💜 by the Séance Team**

For backend documentation,see `../backend/README.md`
