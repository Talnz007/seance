# ==================================================
# .kiro/steering/ui-components.md
# ==================================================

---
inclusion: fileMatch
fileMatchPattern: "frontend/**/*.tsx"
---

# UI Component Standards for Séance Frontend

## Component Architecture

### Component Structure
```typescript
// components/ouija/ouija-board.tsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Session } from '@/types/session';

interface OuijaBoardProps {
  sessionId: string;
  onMessageSent: (message: string) => void;
  className?: string;
}

export const OuijaBoard: React.FC = ({
  sessionId,
  onMessageSent,
  className
}) => {
  // 1. State declarations
  const [isRevealing, setIsRevealing] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  
  // 2. Custom hooks
  const { connected, sendMessage } = useWebSocket(sessionId);
  
  // 3. Effects
  useEffect(() => {
    // Setup/cleanup
  }, [sessionId]);
  
  // 4. Event handlers
  const handleMessageSubmit = async (message: string) => {
    setIsRevealing(true);
    await sendMessage(message);
  };
  
  // 5. Render helpers (if complex)
  const renderLetterGrid = () => (
    
      {/* ... */}
    
  );
  
  // 6. Main render
  return (
    <div className={cn('ouija-board', className)}>
      {renderLetterGrid()}
    
  );
};
```

## Styling Standards

### Tailwind CSS Classes
- Use utility classes for simple styling
- Create component variants with `cn()` helper
- Extract repeated patterns to shared components

```typescript
import { cn } from '@/lib/utils';

// Good: Clean utility usage
<div className={cn(
  'flex items-center justify-center',
  'rounded-lg bg-purple-900/20',
  'border border-purple-500/30',
  isActive && 'bg-purple-800/40',
  className
)}>
```

### Theme Colors
```typescript
// Use semantic color names from tailwind.config.ts
const colors = {
  background: 'bg-slate-950',
  surface: 'bg-slate-900',
  accent: 'bg-purple-600',
  accentHover: 'hover:bg-purple-700',
  text: 'text-slate-100',
  textMuted: 'text-slate-400',
  border: 'border-purple-500/30',
  glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]'
};
```

### Dark Theme (Default)
- Background: Deep blacks/grays (`slate-950`)
- Accents: Purple/green ethereal (`purple-600`, `emerald-500`)
- Text: High contrast (`slate-100` on dark)
- Glows: Use box-shadow for supernatural effect

## Animation Standards

### Framer Motion Patterns

#### Planchette Movement
```typescript
import { motion } from 'framer-motion';


```

#### Letter Reveal
```typescript
const letterVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: 'easeOut'
    }
  })
};

{message.split('').map((char, i) => (
  
    {char}
  
))}
```

#### Page Transitions
```typescript
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};


```

### Performance Considerations
- Use `will-change: transform` for animated elements
- Prefer `transform` over `top/left` for positioning
- Use `motion.div` only for animated elements
- Debounce rapid animations (60fps max)

## State Management

### Zustand Store Pattern
```typescript
// stores/session-store.ts

import create from 'zustand';

interface SessionState {
  session: Session | null;
  users: User[];
  messages: Message[];
  isConnected: boolean;
  
  // Actions
  setSession: (session: Session) => void;
  addUser: (user: User) => void;
  addMessage: (message: Message) => void;
  setConnected: (connected: boolean) => void;
}

export const useSessionStore = create((set) => ({
  session: null,
  users: [],
  messages: [],
  isConnected: false,
  
  setSession: (session) => set({ session }),
  addUser: (user) => set((state) => ({
    users: [...state.users, user]
  })),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  setConnected: (connected) => set({ isConnected: connected })
}));
```

### Component State
- Use `useState` for local UI state
- Use Zustand for shared/global state
- Use `useRef` for DOM references
- Use `useMemo` for expensive computations
- Use `useCallback` for stable function references

## Custom Hooks

### WebSocket Hook
```typescript
// hooks/use-websocket.ts

export const useWebSocket = (sessionId: string) => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  
  useEffect(() => {
    const socket = io(WS_URL);
    
    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_session', { sessionId });
    });
    
    socket.on('disconnect', () => setConnected(false));
    
    socketRef.current = socket;
    
    return () => {
      socket.disconnect();
    };
  }, [sessionId]);
  
  const sendMessage = useCallback((message: string) => {
    socketRef.current?.emit('send_message', {
      sessionId,
      message
    });
  }, [sessionId]);
  
  return { connected, sendMessage };
};
```

### Audio Hook
```typescript
// hooks/use-audio.ts

export const useAudio = () => {
  const audioContextRef = useRef(null);
  
  const playSound = useCallback((url: string, options?: AudioOptions) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    // Implementation
  }, []);
  
  const speak = useCallback(async (text: string) => {
    // TTS implementation
  }, []);
  
  return { playSound, speak };
};
```

## Accessibility Standards

### Keyboard Navigation
```typescript
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  tabIndex={0}
  aria-label="Send message to spirit"
>
```

### ARIA Labels
```typescript
<div
  role="region"
  aria-label="Ouija board interface"
  aria-live="polite"  // Announce spirit responses
>
  
    {spiritMessage}
  

```

### Focus Management
```typescript
useEffect(() => {
  if (isModalOpen) {
    const firstFocusable = modalRef.current?.querySelector(
      'button, input, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  }
}, [isModalOpen]);
```

## Error Handling

### Error Boundary
```typescript
// components/error-boundary.tsx

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error:', error, errorInfo);
    // Send to error tracking (Sentry)
  }
  
  render() {
    if (this.state.hasError) {
      return ;
    }
    return this.props.children;
  }
}
```

### Async Error Handling
```typescript
const handleSubmit = async () => {
  setLoading(true);
  setError(null);
  
  try {
    await sendMessage(message);
  } catch (error) {
    console.error('Failed to send message:', error);
    setError('Failed to send message. Please try again.');
    toast.error('Message failed to send');
  } finally {
    setLoading(false);
  }
};
```

## Testing Standards

### Component Tests
```typescript
// __tests__/components/ouija-board.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { OuijaBoard } from '@/components/ouija/ouija-board';

describe('OuijaBoard', () => {
  it('renders letter grid', () => {
    render();
    
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('Z')).toBeInTheDocument();
  });
  
  it('calls onMessageSent when submitting', async () => {
    const onMessageSent = jest.fn();
    render();
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test message' } });
    fireEvent.submit(input.closest('form')!);
    
    expect(onMessageSent).toHaveBeenCalledWith('test message');
  });
});
```

## Performance Optimization

### Memoization
```typescript
const ExpensiveComponent = React.memo(({ data }) => {
  // Only re-renders if data changes
  return {/* ... */};
});

// Memoize expensive calculations
const sortedMessages = useMemo(() => {
  return messages.sort((a, b) => a.timestamp - b.timestamp);
}, [messages]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

### Lazy Loading
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/heavy'), {
  loading: () => ,
  ssr: false  // Client-side only if needed
});
```

## File Organization

```
components/
├── ui/                  # Reusable UI primitives
│   ├── button.tsx
│   ├── dialog.tsx
│   └── input.tsx
├── ouija/              # Ouija-specific components
│   ├── ouija-board.tsx
│   ├── planchette.tsx
│   └── letter-grid.tsx
├── session/            # Session management
│   ├── session-create.tsx
│   └── session-join.tsx
└── layout/             # Layout components
    ├── header.tsx
    └── footer.tsx
```

## Component Naming

- Component files: `kebab-case.tsx`
- Component names: `PascalCase`
- Props interfaces: `ComponentNameProps`
- Event handlers: `handleEventName`
- State variables: descriptive (`isLoading`, not `loading`)

Follow these standards for consistent, maintainable, and accessible UI components. 🎨
