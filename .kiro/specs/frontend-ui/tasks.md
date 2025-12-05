# Séance Frontend Implementation Plan

## Overview

This implementation plan breaks down the Séance frontend development into discrete, manageable tasks. Each task builds incrementally on previous work, following the design document and ui-components.md patterns.

## Implementation Tasks

- [x] 1. Project setup and configuration
  - Initialize Next.js 15 project structure with TypeScript
  - Configure Tailwind CSS with custom theme colors (purple/green accents, dark theme)
  - Set up Framer Motion and Zustand dependencies
  - Create environment variable configuration (.env.local)
  - Configure next.config.js for production builds
  - _Requirements: 1.1, 7.1_

- [x] 2. Core utilities and types
  - [x] 2.1 Create TypeScript type definitions
    - Define Session, User, Message interfaces in types/session.ts
    - Define WebSocket event types in types/websocket.ts
    - Export all types from types/index.ts
    - _Requirements: 10.1_
  
  - [x] 2.2 Implement utility functions
    - Create cn() helper function in lib/utils.ts for className merging
    - Add date formatting utilities
    - Add validation helper functions
    - _Requirements: 8.4_
  
  - [x] 2.3 Create API client
    - Implement createSession() function in lib/api.ts
    - Implement getSession() function with error handling
    - Add proper TypeScript types for API responses
    - _Requirements: 1.3, 8.2_

- [x] 3. State management with Zustand
  - Create session store in stores/session-store.ts
  - Implement state interface with session, users, messages, isConnected, isRevealing
  - Add actions: setSession, addUser, removeUser, addMessage, setConnected, setRevealing, reset
  - Add TypeScript types for all state and actions
  - _Requirements: 10.1, 10.2, 10.4, 10.5_

- [x] 4. Custom hooks
  - [x] 4.1 Implement useWebSocket hook
    - Create hooks/use-websocket.ts with WebSocket connection logic
    - Handle connection lifecycle (connect, disconnect, reconnect)
    - Implement event listeners for all WebSocket events (user_joined, user_left, message_received, spirit_thinking, spirit_response, error)
    - Update Zustand store based on received events
    - Provide sendMessage function for sending messages
    - Add proper cleanup on unmount
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 4.2 Implement useSession hook
    - Create hooks/use-session.ts for session data management
    - Fetch session data from API on mount
    - Provide loading and error states
    - Update Zustand store with session data
    - Add refetch capability
    - _Requirements: 1.4, 8.1_

- [x] 5. UI primitive components
  - [x] 5.1 Create Button component
    - Implement components/ui/button.tsx with variants (primary, secondary, ghost)
    - Add size options (sm, md, lg)
    - Include proper TypeScript props interface
    - Apply Tailwind styling with purple accent colors
    - Add hover and focus states
    - _Requirements: 7.2, 7.5_
  
  - [x] 5.2 Create Input component
    - Implement components/ui/input.tsx with label and error support
    - Add proper TypeScript props interface
    - Apply Tailwind styling consistent with theme
    - Include focus states and validation styling
    - _Requirements: 7.2, 7.5, 8.4_
  
  - [x] 5.3 Create Card component
    - Implement components/ui/card.tsx with variants (default, elevated)
    - Add proper TypeScript props interface
    - Apply dark theme styling with borders
    - _Requirements: 2.4_

- [x] 6. Ouija board components
  - [x] 6.1 Create Letter component
    - Implement components/ouija/letter.tsx for individual letters
    - Add props for letter value, isActive, onClick
    - Apply circular container styling with Tailwind
    - Implement glow effect for active state using box-shadow
    - Add hover effects
    - _Requirements: 2.1, 2.5_
  
  - [x] 6.2 Create LetterGrid component
    - Implement components/ouija/letter-grid.tsx with all 52 letters
    - Layout letters in arcs: top (A-M), middle (N-Z), bottom (0-9)
    - Position YES (left), NO (right), GOODBYE (center bottom)
    - Use CSS Grid or Flexbox for responsive layout
    - Pass activeLetter prop to highlight current letter
    - _Requirements: 2.1, 2.4_
  
  - [x] 6.3 Create Planchette component
    - Implement components/ouija/planchette.tsx with Framer Motion
    - Create circular planchette with transparent center
    - Implement smooth animation to target positions using motion.div
    - Use spring physics for natural movement (stiffness: 100, damping: 20)
    - Add glowing effect during animation
    - Accept targetLetter, isAnimating, letterTimings props
    - Calculate letter positions for animation targets
    - _Requirements: 2.2, 2.3, 4.5, 9.1, 9.2_
  
  - [x] 6.4 Create MessageInput component
    - Implement components/ouija/message-input.tsx for question input
    - Add text input field with submit button
    - Implement form validation (max 500 characters)
    - Handle form submission and call sendMessage from useWebSocket
    - Disable input while spirit is responding
    - _Requirements: 4.1, 4.2, 8.4_
  
  - [x] 6.5 Create OuijaBoard component
    - Implement components/ouija/ouija-board.tsx as main container
    - Compose LetterGrid, Planchette, and MessageInput
    - Manage animation state (currentLetter, isAnimating)
    - Implement letter-by-letter reveal logic using letterTimings
    - Connect to Zustand store for messages and isRevealing state
    - Apply dark theme styling with purple accents
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.3, 4.4, 4.5_

- [x] 7. Session management components
  - [x] 7.1 Create SessionCreate component
    - Implement components/session/session-create.tsx with form
    - Add input fields for session name and max users
    - Implement form validation (name: 1-100 chars, max_users: 2-12)
    - Call api.createSession() on form submission
    - Handle loading state during API call
    - Display error messages on failure
    - Redirect to session room on success using Next.js router
    - _Requirements: 1.1, 1.2, 1.3, 8.1, 8.2, 8.4_
  
  - [x] 7.2 Create SessionJoin component
    - Implement components/session/session-join.tsx with form
    - Add input field for session ID
    - Validate session ID format
    - Call api.getSession() to verify session exists
    - Handle loading state during API call
    - Display error if session not found or full
    - Redirect to session room on success
    - _Requirements: 1.1, 1.4, 1.5, 8.1, 8.2, 8.4_

- [x] 8. User presence components
  - [x] 8.1 Create UserItem component
    - Implement components/session/user-item.tsx for individual user display
    - Show user name and join timestamp
    - Highlight current user with different styling
    - Add Framer Motion animations for join/leave (fade in/out)
    - _Requirements: 5.2, 5.3, 5.5_
  
  - [x] 8.2 Create UserList component
    - Implement components/session/user-list.tsx as container
    - Display user count (e.g., "3/6 participants")
    - Render UserItem for each user from Zustand store
    - Apply AnimatePresence for smooth user join/leave animations
    - Style as sidebar with dark theme
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 9. Message history components
  - [x] 9.1 Create MessageItem component
    - Implement components/session/message-item.tsx for individual messages
    - Different styling for user vs spirit messages (colors, alignment)
    - Display user name for user messages
    - Display timestamp for all messages
    - Apply appropriate text colors and spacing
    - _Requirements: 6.2, 6.4_
  
  - [x] 9.2 Create MessageFeed component
    - Implement components/session/message-feed.tsx as scrollable container
    - Render MessageItem for each message from Zustand store
    - Implement auto-scroll to latest message using useEffect and ref
    - Style as scrollable panel with dark background
    - Add scroll indicators if needed
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 10. Page layouts
  - [x] 10.1 Create root layout
    - Implement app/layout.tsx with HTML structure
    - Import globals.css for Tailwind styles
    - Set up dark theme background colors
    - Add metadata for SEO (title, description)
    - Configure font (system fonts or custom)
    - _Requirements: 2.4, 7.1_
  
  - [x] 10.2 Create landing page
    - Implement app/page.tsx with welcome content
    - Add SessionCreate component
    - Add SessionJoin component
    - Style with centered layout and dark theme
    - Add supernatural-themed copy and imagery
    - _Requirements: 1.1_
  
  - [x] 10.3 Create session room page
    - Implement app/session/[id]/page.tsx as dynamic route
    - Extract sessionId from URL params
    - Generate unique userId (localStorage or UUID)
    - Prompt for user name (modal or inline form)
    - Initialize useWebSocket hook with session and user data
    - Initialize useSession hook to fetch session details
    - Compose OuijaBoard, UserList, and MessageFeed components
    - Create responsive layout (mobile: stack, desktop: three-column)
    - Add connection status indicator
    - Handle loading and error states
    - _Requirements: 3.1, 3.2, 5.1, 6.1, 7.1, 8.1_

- [-] 11. Error handling and loading states
  - [x] 11.1 Create ErrorBoundary component
    - Implement components/error-boundary.tsx as React Error Boundary
    - Catch component errors in getDerivedStateFromError
    - Log errors in componentDidCatch
    - Display fallback UI with error message and "Try Again" button
    - _Requirements: 8.5_
  
  - [x] 11.2 Create LoadingSpinner component
    - Implement components/ui/loading-spinner.tsx with animation
    - Use Framer Motion or CSS animation for spinning effect
    - Apply purple accent color
    - Add size variants (sm, md, lg)
    - _Requirements: 8.1_
  
  - [x] 11.3 Add error handling to API calls
    - Wrap all API calls in try-catch blocks
    - Display user-friendly error messages
    - Provide retry mechanisms where appropriate
    - Log errors to console for debugging
    - _Requirements: 8.2_
  
  - [x] 11.4 Add WebSocket error handling
    - Implement reconnection logic in useWebSocket hook
    - Display connection status to user
    - Handle WebSocket errors gracefully
    - Show error messages for failed message sends
    - _Requirements: 8.3_

- [x] 12. Responsive design implementation
  - Apply responsive Tailwind classes to all components
  - Test layout on mobile (< 768px), tablet (768-1024px), and desktop (> 1024px)
  - Adjust OuijaBoard size for different screen sizes
  - Make UserList collapsible on mobile
  - Ensure MessageFeed is scrollable on all devices
  - Test touch interactions on mobile devices
  - _Requirements: 7.1_

- [x] 13. Accessibility enhancements
  - [x] 13.1 Add keyboard navigation
    - Ensure all interactive elements have proper tabIndex
    - Implement Enter/Space key handlers for buttons
    - Add Escape key handler for modals/dialogs
    - Test full keyboard navigation flow
    - _Requirements: 7.2_
  
  - [x] 13.2 Add ARIA labels and roles
    - Add aria-label to all interactive elements
    - Use semantic HTML elements (button, input, etc.)
    - Add aria-live regions for dynamic content (spirit responses)
    - Add role attributes where needed
    - _Requirements: 7.3_
  
  - [x] 13.3 Ensure color contrast
    - Verify text contrast ratios meet WCAG AA standards (4.5:1)
    - Test with color contrast checker tools
    - Adjust colors if needed while maintaining theme
    - _Requirements: 7.4_
  
  - [x] 13.4 Add focus indicators
    - Ensure all focusable elements have visible focus states
    - Use purple outline for focus indicators
    - Test focus visibility on all components
    - _Requirements: 7.5_

- [x] 14. Performance optimization
  - [x] 14.1 Implement memoization
    - Wrap expensive components with React.memo
    - Use useMemo for expensive calculations (message sorting)
    - Use useCallback for event handlers passed as props
    - _Requirements: 9.3, 9.4, 10.3_
  
  - [x] 14.2 Optimize animations
    - Ensure Planchette animation maintains 60fps
    - Use CSS transforms instead of position properties
    - Add will-change property to animated elements
    - Test animation performance on lower-end devices
    - _Requirements: 9.1, 9.2_
  
  - [x] 14.3 Implement code splitting
    - Use dynamic imports for heavy components
    - Configure Next.js for optimal code splitting
    - Lazy load components not needed on initial render
    - _Requirements: 9.5_

- [x] 15. Environment configuration and deployment prep
  - Create .env.local.example with required variables
  - Document environment variables in README
  - Configure next.config.js for production builds
  - Set up build scripts in package.json
  - Test production build locally
  - Create Dockerfile for containerization (optional)
  - _Requirements: 1.1_

- [x] 16. Documentation
  - Create comprehensive README.md with setup instructions
  - Document component props and usage
  - Add code comments for complex logic
  - Create deployment guide
  - Document environment variables
  - Add troubleshooting section
  - _Requirements: All_

- [x] 17. Integration testing
  - Test session creation flow end-to-end
  - Test session join flow end-to-end
  - Test WebSocket connection and message flow
  - Test multi-user interaction (open multiple browser tabs)
  - Test spirit response animation
  - Test error scenarios (invalid session, connection loss)
  - Test on different browsers (Chrome, Firefox, Safari)
  - Test responsive design on different screen sizes
  - _Requirements: All_

## Task Dependencies

```
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17
    ↓       ↓   ↓   ↓   ↓   ↓   ↓   ↓
    └───────┴───┴───┴───┴───┴───┴───┘
    (All depend on types and utilities)
```

## Implementation Notes

### Development Workflow

1. Start with project setup and core utilities (Tasks 1-2)
2. Implement state management and hooks (Tasks 3-4)
3. Build UI primitives (Task 5)
4. Create Ouija board components (Task 6)
5. Add session management (Task 7)
6. Implement user presence and messages (Tasks 8-9)
7. Build page layouts (Task 10)
8. Add error handling (Task 11)
9. Polish with responsive design, accessibility, and performance (Tasks 12-14)
10. Prepare for deployment (Task 15)
11. Document and test (Tasks 16-17)

### Testing Strategy

- Test each component in isolation as it's built
- Use browser DevTools to inspect WebSocket messages
- Open multiple browser tabs to test multi-user functionality
- Test on actual mobile devices, not just browser DevTools
- Use React DevTools to inspect component state and props

### Code Quality

- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Follow naming conventions from ui-components.md
- Keep components small and focused (< 200 lines)
- Extract reusable logic into custom hooks
- Add comments for complex logic

### Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Animation frame rate: 60 FPS
- Bundle size: < 500KB (initial)
- WebSocket latency: < 50ms

## Success Criteria

- ✅ All components render correctly
- ✅ WebSocket connection works reliably
- ✅ Planchette animation is smooth and follows letter timings
- ✅ Multi-user interaction works (tested with 3+ users)
- ✅ Responsive design works on mobile, tablet, and desktop
- ✅ Accessibility standards met (keyboard nav, ARIA labels, contrast)
- ✅ Error handling works for all failure scenarios
- ✅ Performance targets met
- ✅ Code is well-documented
- ✅ Integration tests pass

## Estimated Timeline

- Tasks 1-2: 2 hours (Setup and utilities)
- Tasks 3-4: 3 hours (State and hooks)
- Task 5: 2 hours (UI primitives)
- Task 6: 6 hours (Ouija board components)
- Task 7: 3 hours (Session management)
- Tasks 8-9: 4 hours (User presence and messages)
- Task 10: 3 hours (Page layouts)
- Task 11: 2 hours (Error handling)
- Tasks 12-14: 4 hours (Polish)
- Tasks 15-17: 3 hours (Deployment and testing)

**Total: ~32 hours** (4 days of focused work)

## Next Steps

Once this implementation plan is approved, begin with Task 1 (Project setup and configuration). Each task should be completed and tested before moving to the next. Use the backend at http://localhost:8000 for development and testing.
