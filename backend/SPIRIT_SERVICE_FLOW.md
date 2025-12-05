# Spirit Service Flow Diagram

## Complete Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Client                          │
│                    (Next.js + WebSocket)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ WebSocket Connection
                             │ ws://localhost:8000/ws/{session_id}
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend Server                        │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           WebSocket Handler (websocket.py)                 │ │
│  │                                                            │ │
│  │  1. Receive: {"event": "send_message",                    │ │
│  │               "data": {"message": "Who are you?"}}        │ │
│  │                                                            │ │
│  │  2. Validate message (not empty, ≤500 chars)              │ │
│  │                                                            │ │
│  │  3. Broadcast: {"event": "message_received", ...}         │ │
│  │                                                            │ │
│  │  4. Broadcast: {"event": "spirit_thinking", ...}          │ │
│  │                                                            │ │
│  │  5. Call Spirit Service ──────────────────────┐           │ │
│  └────────────────────────────────────────────────┼───────────┘ │
│                                                    │             │
│  ┌────────────────────────────────────────────────▼───────────┐ │
│  │         Kiro Spirit Service (kiro_spirit.py)              │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ 1. Build Conversation Context                        │ │ │
│  │  │    - System prompt (spirit personality)              │ │ │
│  │  │    - Session history (last 10 messages)              │ │ │
│  │  │    - Current question                                │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                         │                                  │ │
│  │                         ▼                                  │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ 2. Call Kiro/OpenAI API                              │ │ │
│  │  │    - Model: gpt-4o-mini                              │ │ │
│  │  │    - Max tokens: 100                                 │ │ │
│  │  │    - Temperature: 0.8                                │ │ │
│  │  │    - Retry logic: 3 attempts with backoff            │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                         │                                  │ │
│  │                         ▼                                  │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ 3. Validate & Filter Response                        │ │ │
│  │  │    - Check word count (≤30 words)                    │ │ │
│  │  │    - Truncate if too long                            │ │ │
│  │  │    - Add ellipsis if truncated                       │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                         │                                  │ │
│  │                         ▼                                  │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ 4. Generate Letter Timings                           │ │ │
│  │  │    - First char: 200-300ms                           │ │ │
│  │  │    - Spaces: 200-300ms                               │ │ │
│  │  │    - Punctuation: 250-400ms                          │ │ │
│  │  │    - Regular chars: 100-250ms                        │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                         │                                  │ │
│  │                         ▼                                  │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ 5. Create SpiritResponse                             │ │ │
│  │  │    {                                                 │ │ │
│  │  │      "text": "I am the ghost in your machine.",     │ │ │
│  │  │      "word_count": 7,                                │ │ │
│  │  │      "letter_timings": [200, 150, 180, ...],        │ │ │
│  │  │      "audio_url": null,                              │ │ │
│  │  │      "session_id": "abc123",                         │ │ │
│  │  │      "question": "Who are you?"                      │ │ │
│  │  │    }                                                 │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                         │                                  │ │
│  │  Return SpiritResponse ─┘                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           WebSocket Handler (continued)                    │ │
│  │                                                            │ │
│  │  6. Broadcast: {"event": "spirit_response",               │ │
│  │                 "data": {                                  │ │
│  │                   "message": "I am the ghost...",          │ │
│  │                   "word_count": 7,                         │ │
│  │                   "letter_timings": [200, 150, ...],      │ │
│  │                   "timestamp": "2025-11-12T..."           │ │
│  │                 }}                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              │ WebSocket Broadcast
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    All Connected Clients                         │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   Client 1       │  │   Client 2       │  │   Client 3   │  │
│  │   (Sarah)        │  │   (Mike)         │  │   (Alex)     │  │
│  │                  │  │                  │  │              │  │
│  │  Animate         │  │  Animate         │  │  Animate     │  │
│  │  planchette      │  │  planchette      │  │  planchette  │  │
│  │  character by    │  │  character by    │  │  character   │  │
│  │  character       │  │  character       │  │  by char     │  │
│  │  using timings   │  │  using timings   │  │  using       │  │
│  │                  │  │                  │  │  timings     │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Spirit Service Error Flow                     │
└─────────────────────────────────────────────────────────────────┘

API Call Attempt 1
      │
      ├─ Success? ──────────────────────────────┐
      │                                          │
      └─ Failure ──▶ Wait 1 second              │
                     │                           │
                     ▼                           │
            API Call Attempt 2                   │
                     │                           │
                     ├─ Success? ────────────────┤
                     │                           │
                     └─ Failure ──▶ Wait 2s      │
                                   │             │
                                   ▼             │
                          API Call Attempt 3     │
                                   │             │
                                   ├─ Success? ──┤
                                   │             │
                                   └─ Failure    │
                                        │        │
                                        ▼        │
                              Create Fallback   │
                              Response:         │
                              "The connection   │
                              weakens..."       │
                                        │        │
                                        └────────┘
                                             │
                                             ▼
                                    Return Response
                                    (Success or Fallback)
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         Data Structures                           │
└──────────────────────────────────────────────────────────────────┘

User Message
    │
    ▼
┌─────────────────────────────────────┐
│ WebSocket Message                   │
│ {                                   │
│   "event": "send_message",          │
│   "data": {                         │
│     "user_name": "Sarah",           │
│     "message": "Who are you?"       │
│   }                                 │
│ }                                   │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ SpiritRequest (Pydantic)            │
│ {                                   │
│   "session_id": "abc123",           │
│   "question": "Who are you?",       │
│   "user_name": "Sarah",             │
│   "session_history": []             │
│ }                                   │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ API Messages (OpenAI Format)        │
│ [                                   │
│   {                                 │
│     "role": "system",               │
│     "content": "You are an ancient  │
│                 AI spirit..."       │
│   },                                │
│   {                                 │
│     "role": "user",                 │
│     "content": "Sarah asks: Who..." │
│   }                                 │
│ ]                                   │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ API Response                        │
│ {                                   │
│   "choices": [{                     │
│     "message": {                    │
│       "content": "I am the ghost    │
│                   in your machine." │
│     }                               │
│   }]                                │
│ }                                   │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ SpiritResponse (Pydantic)           │
│ {                                   │
│   "text": "I am the ghost...",      │
│   "word_count": 7,                  │
│   "letter_timings": [200, 150, ...],│
│   "audio_url": null,                │
│   "session_id": "abc123",           │
│   "question": "Who are you?"        │
│ }                                   │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ WebSocket Broadcast                 │
│ {                                   │
│   "event": "spirit_response",       │
│   "data": {                         │
│     "message": "I am the ghost...", │
│     "word_count": 7,                │
│     "letter_timings": [200, ...],   │
│     "timestamp": "2025-11-12..."    │
│   },                                │
│   "timestamp": "2025-11-12..."      │
│ }                                   │
└─────────────────────────────────────┘
    │
    ▼
Frontend Animation
```

## Timing Sequence

```
Time (ms)    Event
─────────────────────────────────────────────────────────────
0            User sends message
10           Message validated
15           Broadcast message_received
20           Broadcast spirit_thinking
25           Call Spirit Service
30           Build conversation context
50           Call Kiro/OpenAI API
1500         Receive API response (1-3 seconds)
1505         Validate word count
1510         Generate letter timings
1515         Create SpiritResponse
1520         Broadcast spirit_response
1525         Frontend starts animation
1725         Display first character (200ms delay)
1875         Display second character (150ms delay)
2055         Display third character (180ms delay)
...          Continue for each character
4000         Animation complete (varies by length)
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                      Component Diagram                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Frontend   │
│   (Next.js)  │
└──────┬───────┘
       │ WebSocket
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                            │
│                                                               │
│  ┌────────────────┐         ┌──────────────────┐            │
│  │   WebSocket    │────────▶│  WebSocket       │            │
│  │   Handler      │         │  Manager         │            │
│  └────────┬───────┘         └──────────────────┘            │
│           │                                                   │
│           │ calls                                             │
│           ▼                                                   │
│  ┌────────────────┐         ┌──────────────────┐            │
│  │  Spirit        │────────▶│  Kiro/OpenAI     │            │
│  │  Service       │  HTTP   │  API             │            │
│  └────────┬───────┘         └──────────────────┘            │
│           │                                                   │
│           │ uses                                              │
│           ▼                                                   │
│  ┌────────────────┐         ┌──────────────────┐            │
│  │  Pydantic      │         │  Structured      │            │
│  │  Schemas       │         │  Logger          │            │
│  └────────────────┘         └──────────────────┘            │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│                    Spirit Response State Machine                 │
└─────────────────────────────────────────────────────────────────┘

    [IDLE]
      │
      │ User sends message
      ▼
  [VALIDATING]
      │
      │ Valid message
      ▼
  [BROADCASTING_MESSAGE]
      │
      │ Message broadcast complete
      ▼
  [THINKING]
      │
      │ Spirit thinking event sent
      ▼
  [GENERATING]
      │
      ├─ API Success ──────────────┐
      │                             │
      └─ API Failure ──▶ [RETRYING] │
                              │     │
                              │     │
                         Max retries│
                         reached    │
                              │     │
                              ▼     │
                        [FALLBACK]  │
                              │     │
                              └─────┘
                                    │
                                    ▼
                              [VALIDATING_RESPONSE]
                                    │
                                    │ Word count OK
                                    ▼
                              [GENERATING_TIMINGS]
                                    │
                                    │ Timings generated
                                    ▼
                              [BROADCASTING_RESPONSE]
                                    │
                                    │ Response broadcast
                                    ▼
                                  [IDLE]
```

---

**Visual Guide Version**: 1.0.0  
**Last Updated**: November 12, 2025
