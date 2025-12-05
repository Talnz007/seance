# Ouija Board Components

This directory contains all components related to the Ouija board interface for the Séance application.

## Components

### Letter
Individual letter component for the Ouija board.

**Props:**
- `value: string` - The letter/number/word to display
- `isActive?: boolean` - Whether the letter is currently highlighted
- `onClick?: (value: string) => void` - Callback when letter is clicked
- `className?: string` - Additional CSS classes

**Features:**
- Circular container with purple border
- Glow effect when active
- Hover effects for interactivity
- Keyboard navigation support
- Responsive sizing

### LetterGrid
Layout component that displays all 52 letters in the Ouija board arrangement.

**Props:**
- `activeLetter?: string | null` - Currently highlighted letter
- `onLetterClick?: (letter: string) => void` - Callback for letter clicks
- `className?: string` - Additional CSS classes

**Layout:**
- Top arc: A-M (13 letters)
- Middle arc: N-Z (13 letters)
- Bottom row: 0-9 (10 numbers)
- YES (left side)
- NO (right side)
- GOODBYE (center bottom)

### Planchette
Animated pointer that moves across the Ouija board to spell out spirit responses.

**Props:**
- `targetLetter?: string | null` - Letter to move to
- `isAnimating?: boolean` - Whether animation is active
- `letterTimings?: number[]` - Array of millisecond delays for each letter
- `onAnimationComplete?: () => void` - Callback when animation finishes
- `className?: string` - Additional CSS classes

**Features:**
- Smooth spring animation using Framer Motion
- Circular design with transparent center
- Glowing effect during animation
- Configurable timing for dramatic effect

### MessageInput
Input component for users to ask questions to the spirit.

**Props:**
- `onSendMessage: (message: string) => void` - Callback when message is submitted
- `disabled?: boolean` - Whether input is disabled (e.g., while spirit is responding)
- `className?: string` - Additional CSS classes

**Features:**
- Text input with submit button
- Form validation (max 500 characters)
- Character counter
- Error display
- Disabled state while spirit is responding

### OuijaBoard
Main container component that composes all Ouija board elements.

**Props:**
- `sessionId: string` - Current session ID
- `onSendMessage: (message: string) => void` - Callback for sending messages
- `className?: string` - Additional CSS classes

**Features:**
- Manages animation state
- Letter-by-letter reveal logic
- Connects to Zustand store for messages
- Dark theme with purple accents
- Ambient glow effects
- Status indicators

## Usage Example

```tsx
import { OuijaBoard } from '@/components/ouija';
import { useWebSocket } from '@/hooks/use-websocket';

function SessionRoom({ sessionId, userId, userName }) {
  const { sendMessage } = useWebSocket({
    sessionId,
    userId,
    userName,
  });

  return (
    <OuijaBoard
      sessionId={sessionId}
      onSendMessage={sendMessage}
    />
  );
}
```

## Animation Flow

1. User submits a question via MessageInput
2. Question is sent through WebSocket
3. Backend processes and generates spirit response
4. Spirit response arrives with `letter_timings` array
5. OuijaBoard starts letter-by-letter animation
6. Planchette moves to each letter with timing from array
7. LetterGrid highlights current letter
8. Animation completes, ready for next question

## Styling

All components use:
- Dark theme (slate-950, slate-900)
- Purple accents (purple-500, purple-600)
- Emerald for YES (emerald-400)
- Red for NO (red-400)
- Responsive sizing with Tailwind breakpoints
- Smooth transitions and animations

## Accessibility

- Keyboard navigation support
- ARIA labels and roles
- Focus indicators
- Screen reader compatible
- High contrast text
