# ==================================================
# .kiro/steering/websocket-patterns.md
# ==================================================

---
inclusion: fileMatch
fileMatchPattern: "**/websocket*,**/session*"
---

# WebSocket Implementation Patterns

## FastAPI WebSocket Manager

### Connection Manager Class
```python
# app/core/websocket_manager.py

from fastapi import WebSocket
from typing import Dict, List
import json

class ConnectionManager:
    """Manage WebSocket connections for multi-user sessions."""
    
    def __init__(self):
        # session_id -> list of websockets
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # websocket -> user_info
        self.user_registry: Dict[WebSocket, dict] = {}
    
    async def connect(
        self,
        websocket: WebSocket,
        session_id: str,
        user_info: dict
    ):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        
        self.active_connections[session_id].append(websocket)
        self.user_registry[websocket] = user_info
        
        # Notify others
        await self.broadcast(session_id, {
            "event": "user_joined",
            "data": user_info
        }, exclude=websocket)
    
    def disconnect(self, websocket: WebSocket, session_id: str):
        """Remove a WebSocket connection."""
        if session_id in self.active_connections:
            self.active_connections[session_id].remove(websocket)
            
            # Clean up empty sessions
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]
        
        user_info = self.user_registry.pop(websocket, None)
        return user_info
    
    async def broadcast(
        self,
        session_id: str,
        message: dict,
        exclude: WebSocket = None
    ):
        """Broadcast message to all connections in a session."""
        if session_id not in self.active_connections:
            return
        
        dead_connections = []
        
        for connection in self.active_connections[session_id]:
            if connection == exclude:
                continue
            
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error broadcasting to connection: {e}")
                dead_connections.append(connection)
        
        # Clean up dead connections
        for conn in dead_connections:
            self.disconnect(conn, session_id)
    
    async def send_to(
        self,
        websocket: WebSocket,
        message: dict
    ):
        """Send message to specific connection."""
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"Error sending to connection: {e}")
    
    def get_session_users(self, session_id: str) -> List[dict]:
        """Get all users in a session."""
        if session_id not in self.active_connections:
            return []
        
        return [
            self.user_registry[conn]
            for conn in self.active_connections[session_id]
            if conn in self.user_registry
        ]

# Global instance
manager = ConnectionManager()
```

### WebSocket Route Implementation
```python
# app/api/websocket.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.websocket_manager import manager
from app.services.kiro_spirit import SpiritService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/ws/{session_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: str,
):
    """WebSocket connection for real-time session communication."""
    
    # Wait for initial user info
    await websocket.accept()
    user_data = await websocket.receive_json()
    
    user_info = {
        "id": user_data.get("user_id"),
        "name": user_data.get("name", "Anonymous"),
        "joined_at": datetime.utcnow().isoformat()
    }
    
    # Register connection
    await manager.connect(websocket, session_id, user_info)
    
    logger.info(
        "websocket.connected",
        session_id=session_id,
        user_id=user_info["id"]
    )
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            event = data.get("event")
            
            if event == "send_message":
                await handle_user_message(
                    websocket,
                    session_id,
                    data.get("data", {})
                )
            
            elif event == "typing":
                await manager.broadcast(
                    session_id,
                    {
                        "event": "user_typing",
                        "data": {"user": user_info["name"]}
                    },
                    exclude=websocket
                )
    
    except WebSocketDisconnect:
        logger.info(
            "websocket.disconnected",
            session_id=session_id,
            user_id=user_info["id"]
        )
        user_info = manager.disconnect(websocket, session_id)
        
        await manager.broadcast(session_id, {
            "event": "user_left",
            "data": user_info
        })

async def handle_user_message(
    websocket: WebSocket,
    session_id: str,
    data: dict
):
    """Handle user question and generate spirit response."""
    question = data.get("message", "")
    
    # Broadcast user message to all
    await manager.broadcast(session_id, {
        "event": "message_received",
        "data": {
            "user": data.get("user_name"),
            "message": question,
            "timestamp": datetime.utcnow().isoformat()
        }
    })
    
    # Show spirit is thinking
    await manager.broadcast(session_id, {
        "event": "spirit_thinking",
        "data": {}
    })
    
    # Generate spirit response using Kiro
    spirit_service = SpiritService()
    response = await spirit_service.generate_response(
        session_id=session_id,
        question=question
    )
    
    # Broadcast spirit response
    await manager.broadcast(session_id, {
        "event": "spirit_response",
        "data": {
            "message": response.text,
            "letter_timings": response.letter_timings,
            "audio_url": response.audio_url,
            "timestamp": datetime.utcnow().isoformat()
        }
    })
```

## Redis Pub/Sub for Scaling

### Redis Integration
```python
# app/core/redis_client.py

import redis.asyncio as redis
import json
from typing import Callable

class RedisClient:
    """Redis pub/sub for distributed WebSocket messages."""
    
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
        self.pubsub = self.redis.pubsub()
    
    async def publish(self, channel: str, message: dict):
        """Publish message to channel."""
        await self.redis.publish(
            channel,
            json.dumps(message)
        )
    
    async def subscribe(
        self,
        channel: str,
        handler: Callable
    ):
        """Subscribe to channel and handle messages."""
        await self.pubsub.subscribe(channel)
        
        async for message in self.pubsub.listen():
            if message['type'] == 'message':
                data = json.loads(message['data'])
                await handler(data)
    
    async def close(self):
        """Close connections."""
        await self.pubsub.close()
        await self.redis.close()
```

### Distributed Connection Manager
```python
# For horizontal scaling across multiple backend instances

class DistributedConnectionManager(ConnectionManager):
    """WebSocket manager with Redis pub/sub."""
    
    def __init__(self, redis_client: RedisClient):
        super().__init__()
        self.redis = redis_client
    
    async def broadcast(
        self,
        session_id: str,
        message: dict,
        exclude: WebSocket = None
    ):
        """Broadcast via Redis for cross-instance delivery."""
        # Local broadcast
        await super().broadcast(session_id, message, exclude)
        
        # Publish to Redis for other instances
        await self.redis.publish(
            f"session:{session_id}",
            {
                "message": message,
                "exclude_connection_id": id(exclude) if exclude else None
            }
        )
```

## Frontend WebSocket Client

### React Hook
```typescript
// hooks/use-websocket.ts

import { useEffect, useRef, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  sessionId: string;
  userId: string;
  userName: string;
}

export const useWebSocket = ({
  sessionId,
  userId,
  userName
}: UseWebSocketOptions) => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const socketRef = useRef<Socket | null>(null);
  
  useEffect(() => {
    // Connect to WebSocket
    const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      query: { sessionId, userId, userName }
    });
    
    // Connection events
    socket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
    });
    
    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });
    
    // Session events
    socket.on('user_joined', (data: User) => {
      setUsers(prev => [...prev, data]);
    });
    
    socket.on('user_left', (data: User) => {
      setUsers(prev => prev.filter(u => u.id !== data.id));
    });
    
    socket.on('message_received', (data: Message) => {
      setMessages(prev => [...prev, data]);
    });
    
    socket.on('spirit_thinking', () => {
      // Show loading state
    });
    
    socket.on('spirit_response', (data: SpiritResponse) => {
      setMessages(prev => [...prev, {
        type: 'spirit',
        ...data
      }]);
    });
    
    socketRef.current = socket;
    
    return () => {
      socket.disconnect();
    };
  }, [sessionId, userId, userName]);
  
  const sendMessage = useCallback((message: string) => {
    if (!socketRef.current) return;
    
    socketRef.current.emit('send_message', {
      event: 'send_message',
      data: {
        user_name: userName,
        message
      }
    });
  }, [userName]);
  
  return {
    connected,
    messages,
    users,
    sendMessage
  };
};
```

### Socket.IO Client Setup
```typescript
// lib/websocket.ts

import { io, Socket } from 'socket.io-client';

export const createSocket = (sessionId: string): Socket => {
  const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
    path: '/ws',
    transports: ['websocket'],
    upgrade: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });
  
  // Auto-join session
  socket.on('connect', () => {
    socket.emit('join_session', { sessionId });
  });
  
  // Handle reconnection
  socket.on('reconnect', (attemptNumber) => {
    console.log('Reconnected after', attemptNumber, 'attempts');
    socket.emit('join_session', { sessionId });
  });
  
  return socket;
};
```

## Error Handling

### Backend Error Handler
```python
@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    try:
        # ... connection logic
        pass
    except WebSocketDisconnect:
        # Clean disconnect
        pass
    except Exception as e:
        logger.error(
            "websocket.error",
            session_id=session_id,
            error=str(e)
        )
        try:
            await websocket.send_json({
                "event": "error",
                "data": {
                    "message": "An error occurred",
                    "code": "INTERNAL_ERROR"
                }
            })
        except:
            pass
        finally:
            manager.disconnect(websocket, session_id)
```

### Frontend Error Handler
```typescript
socket.on('error', (error) => {
  console.error('WebSocket error:', error);
  toast.error('Connection error. Reconnecting...');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  // Show reconnection UI
});
```

## Testing WebSocket Connections

### Backend Test
```python
@pytest.mark.asyncio
async def test_websocket_connection():
    async with AsyncClient(app=app, base_url="http://test") as client:
        async with client.websocket_connect("/ws/test-session") as websocket:
            # Send user info
            await websocket.send_json({
                "user_id": "test-user",
                "name": "Test User"
            })
            
            # Should receive user_joined
            data = await websocket.receive_json()
            assert data["event"] == "user_joined"
```

### Frontend Test
```typescript
// __tests__/hooks/use-websocket.test.ts

import { renderHook, act } from '@testing-library/react-hooks';
import { useWebSocket } from '@/hooks/use-websocket';

describe('useWebSocket', () => {
  it('connects and receives messages', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useWebSocket({
        sessionId: 'test',
        userId: 'user1',
        userName: 'Test User'
      })
    );
    
    await waitForNextUpdate();
    
    expect(result.current.connected).toBe(true);
  });
});
```

## Performance Optimization

### Rate Limiting
```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@router.websocket("/ws/{session_id}")
@limiter.limit("100/minute")
async def websocket_endpoint(...):
    pass
```

### Message Batching
```typescript
// Batch rapid messages
const messageQueue: Message[] = [];
let timeout: NodeJS.Timeout;

const queueMessage = (message: Message) => {
  messageQueue.push(message);
  
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (messageQueue.length > 0) {
      socket.emit('batch_messages', messageQueue);
      messageQueue.length = 0;
    }
  }, 100);
};
```

## Security

### Authentication
```python
from jose import jwt

@router.websocket("/ws/{session_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: str,
    token: str = Query(...)
):
    # Verify JWT
    try:
        payload = jwt.decode(token, SECRET_KEY)
        user_id = payload.get("sub")
    except:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
```

### Input Validation
```python
async def handle_user_message(websocket, session_id, data):
    # Validate message
    if not data.get("message"):
        await websocket.send_json({
            "event": "error",
            "data": {"message": "Message cannot be empty"}
        })
        return
    
    message = data["message"].strip()
    if len(message) > 500:
        await websocket.send_json({
            "event": "error",
            "data": {"message": "Message too long"}
        })
        return
```

