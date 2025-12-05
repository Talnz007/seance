# Séance Frontend Specification

## Overview

This specification defines the complete implementation plan for the Séance frontend - a Next.js 15 application providing an immersive, supernatural Ouija board interface for multi-user AI spirit communication.

## Specification Documents

### 1. [Requirements](./requirements.md)
Defines 10 core requirements with user stories and acceptance criteria following EARS patterns:
- Session Management (create/join)
- Ouija Board Interface (letter grid, planchette animation)
- Real-Time Communication (WebSocket)
- Message Input and Display
- User Presence and List
- Message History
- Responsive Design and Accessibility
- Error Handling and Loading States
- Animation Performance
- State Management

### 2. [Design](./design.md)
Comprehensive design document covering:
- Architecture (component hierarchy, tech stack)
- Component specifications (OuijaBoard, Planchette, LetterGrid, etc.)
- Data models and TypeScript interfaces
- State management with Zustand
- Custom hooks (useWebSocket, useSession)
- Animation strategy with Framer Motion
- Error handling patterns
- Testing strategy
- Performance optimization
- Accessibility standards
- Responsive design
- Deployment configuration

### 3. [Tasks](./tasks.md)
Implementation plan with 17 main tasks:
1. Project setup and configuration
2. Core utilities and types
3. State management with Zustand
4. Custom hooks
5. UI primitive components
6. Ouija board components
7. Session management components
8. User presence components
9. Message history components
10. Page layouts
11. Error handling and loading states
12. Responsive design implementation
13. Accessibility enhancements
14. Performance optimization
15. Environment configuration and deployment prep
16. Documentation
17. Integration testing

**Estimated Timeline**: ~32 hours (4 days of focused work)

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 18
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Animation**: Framer Motion 11
- **State Management**: Zustand 4.4
- **WebSocket**: Native WebSocket API
- **HTTP Client**: Native Fetch API

## Key Features

### Core Features (MVP)
- ✅ Multi-user session creation and joining
- ✅ Real-time WebSocket communication
- ✅ Animated Ouija board with letter grid
- ✅ Smooth planchette movement with Framer Motion
- ✅ Letter-by-letter spirit response reveals
- ✅ User presence list with join/leave animations
- ✅ Message history feed
- ✅ Dark theme with purple/green accents
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Error handling and loading states

### Accessibility
- ✅ Keyboard navigation
- ✅ ARIA labels and roles
- ✅ High color contrast (WCAG AA)
- ✅ Focus indicators
- ✅ Screen reader support

### Performance
- ✅ 60 FPS animations
- ✅ Code splitting and lazy loading
- ✅ Memoization (React.memo, useMemo, useCallback)
- ✅ Optimized bundle size (< 500KB)

## Integration with Backend

The frontend integrates with the completed Séance backend:

### REST API Endpoints
- `POST /api/sessions` - Create new session
- `GET /api/sessions/{id}` - Get session details

### WebSocket Connection
- `WS /ws/{session_id}` - Real-time session communication

### WebSocket Events
**Client → Server**:
- `send_message` - User asks question

**Server → Client**:
- `user_joined` - New participant joined
- `user_left` - Participant left
- `message_received` - User message broadcast
- `spirit_thinking` - AI generating response
- `spirit_response` - AI response ready (with letter_timings)
- `error` - Error occurred

## Development Workflow

### Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with backend URLs
npm run dev
```

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Development Server
```bash
npm run dev
# Visit http://localhost:3000
```

### Build for Production
```bash
npm run build
npm start
```

## Implementation Approach

### Phase 1: Foundation (Tasks 1-4)
- Set up project structure
- Configure Tailwind and dependencies
- Create TypeScript types
- Implement state management
- Build custom hooks

### Phase 2: Core Components (Tasks 5-9)
- Build UI primitives
- Create Ouija board components
- Implement session management
- Add user presence
- Build message history

### Phase 3: Pages and Integration (Task 10)
- Create landing page
- Build session room page
- Integrate all components
- Connect to backend

### Phase 4: Polish (Tasks 11-14)
- Add error handling
- Implement responsive design
- Enhance accessibility
- Optimize performance

### Phase 5: Deployment (Tasks 15-17)
- Configure for production
- Write documentation
- Run integration tests
- Deploy to hosting

## Testing Strategy

### Component Testing
- Unit tests for individual components
- Integration tests for component interactions
- Mock WebSocket and API calls

### Manual Testing
- Test session creation/join flows
- Test WebSocket connection
- Test multi-user interaction (multiple tabs)
- Test spirit response animation
- Test error scenarios
- Test on different browsers and devices

### Performance Testing
- Measure First Contentful Paint
- Measure Time to Interactive
- Monitor animation frame rate
- Check bundle size

## Success Criteria

- ✅ All core components implemented and working
- ✅ WebSocket connection reliable
- ✅ Planchette animation smooth (60 FPS)
- ✅ Multi-user interaction tested with 3+ users
- ✅ Responsive on mobile, tablet, desktop
- ✅ Accessibility standards met
- ✅ Error handling for all failure scenarios
- ✅ Performance targets achieved
- ✅ Code well-documented
- ✅ Integration tests passing

## Next Steps

1. **Review this specification** - Ensure all requirements and design decisions are approved
2. **Begin implementation** - Start with Task 1 (Project setup)
3. **Iterate incrementally** - Complete each task before moving to the next
4. **Test continuously** - Test each component as it's built
5. **Integrate with backend** - Use the completed backend at http://localhost:8000

## Resources

- [Backend Implementation](../../../backend/IMPLEMENTATION_COMPLETE.md)
- [UI Components Guide](../../../.kiro/steering/ui-components.md)
- [WebSocket Patterns](../../../.kiro/steering/websocket-patterns.md)
- [Product Overview](../../../.kiro/steering/product.md)
- [Tech Stack](../../../.kiro/steering/tech.md)

## Status

**Specification Status**: ✅ Complete  
**Implementation Status**: 🚧 Ready to Start  
**Estimated Completion**: 4 days

---

**Created**: December 1, 2025  
**Last Updated**: December 1, 2025  
**Version**: 1.0.0
