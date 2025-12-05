"""WebSocket connection manager for multi-user sessions."""

from fastapi import WebSocket
from typing import Dict, List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


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
        """Accept and register a new WebSocket connection.
        
        Args:
            websocket: The WebSocket connection to register
            session_id: The session ID to join
            user_info: User information dict (id, name, etc.)
        """
        await websocket.accept()
        
        # Initialize session list if needed
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        
        # Register connection
        self.active_connections[session_id].append(websocket)
        self.user_registry[websocket] = user_info
        
        logger.info(
            f"WebSocket connected - session: {session_id}, "
            f"user: {user_info.get('name', 'Unknown')}"
        )
        
        # Notify others in session
        await self.broadcast(
            session_id,
            {
                "event": "user_joined",
                "data": user_info,
                "timestamp": datetime.utcnow().isoformat()
            },
            exclude=websocket
        )
    
    def disconnect(self, websocket: WebSocket, session_id: str) -> Optional[dict]:
        """Remove a WebSocket connection and cleanup.
        
        Args:
            websocket: The WebSocket connection to remove
            session_id: The session ID to leave
            
        Returns:
            User info dict if found, None otherwise
        """
        # Remove from active connections
        if session_id in self.active_connections:
            if websocket in self.active_connections[session_id]:
                self.active_connections[session_id].remove(websocket)
            
            # Clean up empty sessions
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]
        
        # Remove from user registry
        user_info = self.user_registry.pop(websocket, None)
        
        if user_info:
            logger.info(
                f"WebSocket disconnected - session: {session_id}, "
                f"user: {user_info.get('name', 'Unknown')}"
            )
        
        return user_info
    
    async def broadcast(
        self,
        session_id: str,
        message: dict,
        exclude: Optional[WebSocket] = None
    ):
        """Broadcast message to all connections in a session.
        
        Args:
            session_id: The session ID to broadcast to
            message: The message dict to send
            exclude: Optional WebSocket to exclude from broadcast
        """
        if session_id not in self.active_connections:
            return
        
        dead_connections = []
        
        for connection in self.active_connections[session_id]:
            # Skip excluded connection
            if connection == exclude:
                continue
            
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(
                    f"Error broadcasting to connection: {e}",
                    exc_info=True
                )
                dead_connections.append(connection)
        
        # Clean up dead connections
        for conn in dead_connections:
            self.disconnect(conn, session_id)
    
    async def send_to(
        self,
        websocket: WebSocket,
        message: dict
    ):
        """Send message to specific connection.
        
        Args:
            websocket: The WebSocket to send to
            message: The message dict to send
        """
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(
                f"Error sending to connection: {e}",
                exc_info=True
            )
    
    def get_session_users(self, session_id: str) -> List[dict]:
        """Get all users in a session.
        
        Args:
            session_id: The session ID to query
            
        Returns:
            List of user info dicts
        """
        if session_id not in self.active_connections:
            return []
        
        return [
            self.user_registry[conn]
            for conn in self.active_connections[session_id]
            if conn in self.user_registry
        ]


# Global manager instance
manager = ConnectionManager()
