# Séance Frontend - Integration Testing Guide

This guide outlines the manual integration testing procedures to ensure the Séance application works correctly across all features.

## Prerequisites

1. **Backend Running**: Ensure the backend API is running at `http://localhost:8000`.
2. **Frontend Running**: Ensure the frontend is running at `http://localhost:3000`.
   ```bash
   npm run dev
   ```
3. **Multiple Browsers**: Have Chrome, Firefox, and Safari (if available) ready.

---

## 1. Session Creation Flow

**Objective**: Verify a user can create a new session.

**Steps**:
1. Open `http://localhost:3000` in Browser A.
2. Locate the "Create Session" section.
3. Enter a session name (e.g., "Test Séance").
4. Adjust the "Max Participants" slider (e.g., to 4).
5. Click "Create Session".

**Expected Result**:
- Loading spinner appears briefly.
- User is redirected to `/session/[session-id]`.
- Name prompt modal appears.

---

## 2. Session Join Flow & WebSocket Connection

**Objective**: Verify a user can join a session and connect to the WebSocket.

**Steps**:
1. In the Name Prompt modal (from Step 1), enter a name (e.g., "Host").
2. Click "Join Session".
3. Observe the header.

**Expected Result**:
- Modal closes.
- Header shows "Connected" with a green indicator.
- "Participants" list shows "Host (you)".
- URL contains the session ID.

---

## 3. Multi-User Interaction

**Objective**: Verify multiple users can join and see each other.

**Steps**:
1. Copy the URL from Browser A.
2. Open Browser B (incognito or different browser).
3. Paste the URL.
4. Enter a different name (e.g., "Guest").
5. Click "Join Session".

**Expected Result**:
- **Browser B**: Shows "Connected", User list shows "Host" and "Guest (you)".
- **Browser A**: User list updates to show "Host (you)" and "Guest".
- A "User joined" notification might appear in the console/logs.

---

## 4. Messaging & Spirit Response

**Objective**: Verify messaging works and spirit responds.

**Steps**:
1. In **Browser A**, type "Is anyone there?" in the message input.
2. Click "Ask".

**Expected Result**:
- **Browser A**: Message appears in the feed immediately. Input is disabled.
- **Browser B**: Message appears in the feed immediately.
- **Both Browsers**:
  - "The spirit is revealing its message..." status appears.
  - Planchette starts moving to letters.
  - Letters glow as the planchette hovers over them.
  - Message is spelled out letter by letter.
  - Once complete, the full spirit message appears in the feed.
  - Input is re-enabled.

---

## 5. Error Handling

**Objective**: Verify error states are handled gracefully.

**Steps**:
1. **Invalid Session**:
   - Try to access `http://localhost:3000/session/invalid-id`.
   - **Expected**: "Session Not Found" error page with a "Return Home" button.

2. **Connection Loss**:
   - Stop the backend server.
   - **Expected**: Header status changes to "Reconnecting..." (yellow) then "Disconnected" (red). Error banner appears.
   - Restart the backend server.
   - **Expected**: Status changes back to "Connected" (green). Error banner disappears.

---

## 6. Responsive Design

**Objective**: Verify layout adapts to screen sizes.

**Steps**:
1. Open Developer Tools (F12) and toggle Device Toolbar.
2. Select **Mobile (iPhone SE/Pixel)**:
   - Verify User List is collapsible.
   - Verify Ouija Board fits within the screen.
   - Verify Message Feed is at the bottom.
3. Select **Tablet (iPad)**:
   - Verify layout adjusts (likely stacked or side-by-side depending on width).
4. Select **Desktop**:
   - Verify 3-column layout (User List, Board, Feed).

---

## 7. Accessibility

**Objective**: Verify keyboard navigation and screen reader support.

**Steps**:
1. Use `Tab` key to navigate through the landing page.
   - Verify focus indicators are visible on inputs and buttons.
2. In a session, use `Tab` to navigate to the message input.
3. Type a message and press `Enter`.
4. Verify focus management (focus should remain or move logically).

---

## Automated Testing

To run the automated unit/component tests:

```bash
npm test
```

(Note: You may need to set up a test runner like Jest or Vitest if not already configured).
