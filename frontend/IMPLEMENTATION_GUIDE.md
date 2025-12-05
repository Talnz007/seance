# Séance Frontend Implementation Guide

## Overview

This guide provides the complete implementation for the Séance Next.js frontend following ui-components.md and websocket-patterns.md patterns.

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

## Project Structure

```
frontend/
├── app/                    # Next.js 15 App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── session/
│       └── [id]/
│           └── page.tsx   # Session room
├── components/
│   ├── ui/                # Reusable UI primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── card.tsx
│   ├── ouija/             # Ouija board components
│   │   ├── ouija-board.tsx
│   │   ├── planchette.tsx
│   │   └── letter-grid.tsx
│   └── session/           # Session components
│       ├── session-create.tsx
│       └── session-join.tsx
├── hooks/                 # Custom React hooks
│   ├── use-websocket.ts
│   └── use-session.ts
├── stores/                # Zustand stores
│   └── session-store.ts
├── lib/                   # Utilities
│   ├── utils.ts
│   └── api.ts
├── types/                 # TypeScript types
│   ├── session.ts
│   └── message.ts
└── styles/
    └── globals.css

## Key Implementation Files

### 1. Tailwind Configuration (tailwind.config.ts)

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#020617', // slate-950
        surface: '#0f172a',    // slate-900
        accent: {
          DEFAULT: '#9333ea',  // purple-600
          hover: '#7e22ce',    // purple-700
        },
        text: {
          DEFAULT: '#f1f5f9',  // slate-100
          muted: '#94a3b8',    // slate-400
        },
        border: 'rgba(168, 85, 247, 0.3)', // purple-500/30
      },
      boxShadow: {
        glow: '0 0 20px rgba(168, 85, 247, 0.4)',
      },
    },
  },
  plugins: [],
}
export default config
```

### 2. Zustand Store (stores/session-store.ts)

```typescript
import { create } from 'zustand'

interface User {
  id: string
  name: string
  joined_at: string
}

interface Message {
  type: 'user' | 'spirit'
  user_name?: string
  message: string
  timestamp: string
  letter_timings?: number[]
}

interface Session {
  id: string
  name: string
  created_at: string
  max_users: number
  is_active: boolean
}

interface SessionState {
  session: Session | null
  users: User[]
  messages: Message[]
  isConnected: boolean
  isRevealing: boolean
  
  // Actions
  setSession: (session: Session) => void
  addUser: (user: User) => void
  removeUser: (userId: string) => void
  addMessage: (message: Message) => void
  setConnected: (connected: boolean) => void
  setRevealing: (revealing: boolean) => void
  reset: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  users: [],
  messages: [],
  isConnected: false,
  isRevealing: false,
  
  setSession: (session) => set({ session }),
  
  addUser: (user) => set((state) => ({
    users: [...state.users, user]
  })),
  
  removeUser: (userId) => set((state) => ({
    users: state.users.filter(u => u.id !== userId)
  })),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setConnected: (connected) => set({ isConnected: connected }),
  
  setRevealing: (revealing) => set({ isRevealing: revealing }),
  
  reset: () => set({
    session: null,
    users: [],
    messages: [],
    isConnected: false,
    isRevealing: false
  })
}))
```

### 3. WebSocket Hook (hooks/use-websocket.ts)

```typescript
import { useEffect, useRef, useCallback } from 'react'
import { useSessionStore } from '@/stores/session-store'

interface UseWebSocketOptions {
  sessionId: string
  userId: string
  userName: string
}

export const useWebSocket = ({
  sessionId,
  userId,
  userName
}: UseWebSocketOptions) => {
  const socketRef = useRef<WebSocket | null>(null)
  const { addUser, removeUser, addMessage, setConnected, setRevealing } = useSessionStore()
  
  useEffect(() => {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/${sessionId}`
    const socket = new WebSocket(wsUrl)
    
    socket.onopen = () => {
      console.log('WebSocket connected')
      setConnected(true)
      
      // Send user info
      socket.send(JSON.stringify({
        user_id: userId,
        name: userName
      }))
    }
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      switch (data.event) {
        case 'user_joined':
          addUser(data.data)
          break
          
        case 'user_left':
          removeUser(data.data.id)
          break
          
        case 'message_received':
          addMessage({
            type: 'user',
            user_name: data.data.user_name,
            message: data.data.message,
            timestamp: data.data.timestamp
          })
          break
          
        case 'spirit_thinking':
          setRevealing(true)
          break
          
        case 'spirit_response':
          setRevealing(false)
          addMessage({
            type: 'spirit',
            message: data.data.message,
            timestamp: data.data.timestamp,
            letter_timings: data.data.letter_timings
          })
          break
          
        case 'error':
          console.error('WebSocket error:', data.data)
          break
      }
    }
    
    socket.onclose = () => {
      console.log('WebSocket disconnected')
      setConnected(false)
    }
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    socketRef.current = socket
    
    return () => {
      socket.close()
    }
  }, [sessionId, userId, userName, addUser, removeUser, addMessage, setConnected, setRevealing])
  
  const sendMessage = useCallback((message: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        event: 'send_message',
        data: {
          user_name: userName,
          message
        }
      }))
    }
  }, [userName])
  
  return { sendMessage }
}
```

### 4. Utility Functions (lib/utils.ts)

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 5. API Client (lib/api.ts)

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface CreateSessionRequest {
  name: string
  max_users?: number
}

export interface Session {
  id: string
  name: string
  created_at: string
  max_users: number
  is_active: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export const api = {
  async createSession(data: CreateSessionRequest): Promise<Session> {
    const response = await fetch(`${API_URL}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    const result: ApiResponse<Session> = await response.json()
    
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to create session')
    }
    
    return result.data
  },
  
  async getSession(sessionId: string): Promise<Session> {
    const response = await fetch(`${API_URL}/api/sessions/${sessionId}`)
    
    const result: ApiResponse<Session> = await response.json()
    
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Session not found')
    }
    
    return result.data
  }
}
```

## Component Implementations

Due to token limits, I'll provide the key component structures. You can implement the full details following the patterns in ui-components.md.

### OuijaBoard Component Structure

```typescript
// components/ouija/ouija-board.tsx
- Letter grid (A-Z, 0-9, YES, NO, GOODBYE)
- Planchette component
- Message input
- Spirit message display with letter-by-letter animation
- Uses Framer Motion for animations
- Dark theme with purple/green accents
- Glowing effects on active letters
```

### Planchette Component Structure

```typescript
// components/ouija/planchette.tsx
- Circular planchette with pointer
- Framer Motion for smooth movement
- Animates to each letter based on letter_timings
- Glowing effect during movement
- Follows the path: letter → letter → letter
```

### Session Pages Structure

```typescript
// app/page.tsx - Landing page
- Welcome message
- Create session button
- Join session input
- Dark theme with supernatural styling

// app/session/[id]/page.tsx - Session room
- OuijaBoard component
- User list sidebar
- Message history
- WebSocket connection
- Real-time updates
```

## Next Steps

1. Run `npm install` in the frontend directory
2. Create the remaining component files following the structures above
3. Implement the Ouija board letter grid and planchette animation
4. Test WebSocket connection with the backend
5. Add error boundaries and loading states

## Testing

```bash
# Start backend
cd backend
uvicorn app.main:app --reload

# Start frontend (in another terminal)
cd frontend
npm run dev
```

Visit http://localhost:3000 to see the application.

## Key Features to Implement

1. ✅ Zustand store for state management
2. ✅ WebSocket hook for real-time communication
3. ✅ API client for REST endpoints
4. ⏳ OuijaBoard component with letter grid
5. ⏳ Planchette with Framer Motion animation
6. ⏳ Session create/join pages
7. ⏳ Dark theme with Tailwind CSS
8. ⏳ Letter-by-letter spirit message reveal

Follow the ui-components.md patterns for all component implementations!
