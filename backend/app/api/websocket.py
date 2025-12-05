"""
WebSocket API endpoints for real-time session communication.

This module provides WebSocket endpoints for multi-user Séance sessions,
handling real-time message broadcasting and user presence management.
"""

from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.websocket_manager import manager
from app.schemas.websocket import EventType
from app.schemas.spirit import SpiritRequest
from app.services.kiro_spirit import spirit_service, SpiritServiceError
from app.utils.logger import (
    get_logger,
    log_websocket_connection,
    log_websocket_disconnection,
    log_websocket_error
)

router = APIRouter(tags=["websocket"])
logger = get_logger(__name__)


async def handle_user_message(
    websocket: WebSocket,
    session_id: str,
    data: Dict[str, Any]
) -> None:
    """
    Handle user message and broadcast to session participants.
    
    Validates message content, broadcasts to all participants,
    and sends spirit_thinking event as placeholder for AI integration.
    
    Args:
        websocket: The WebSocket connection that sent the message
        session_id: The session ID
        data: Message data containing 'message' and 'user_name'
    """
    message_text = data.get("message", "").strip()
    user_name = data.get("user_name", "Anonymous")
    
    # Validate message is not empty
    if not message_text:
        await manager.send_to(websocket, {
            "event": EventType.ERROR,
            "data": {
                "code": "EMPTY_MESSAGE",
                "message": "Message cannot be empty"
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        logger.warning(
            "message.validation.empty",
            session_id=session_id,
            user_name=user_name,
            event_type="validation_error"
        )
        return
    
    # Validate message length (max 500 characters)
    if len(message_text) > 500:
        await manager.send_to(websocket, {
            "event": EventType.ERROR,
            "data": {
                "code": "MESSAGE_TOO_LONG",
                "message": "Message exceeds maximum length of 500 characters"
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        logger.warning(
            "message.validation.too_long",
            session_id=session_id,
            user_name=user_name,
            message_length=len(message_text),
            max_length=500,
            event_type="validation_error"
        )
        return
    
    # Broadcast message_received event to all participants
    await manager.broadcast(session_id, {
        "event": EventType.MESSAGE_RECEIVED,
        "data": {
            "user_name": user_name,
            "message": message_text,
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    logger.info(
        "message.broadcast",
        session_id=session_id,
        user_name=user_name,
        message_length=len(message_text),
        event_type="message_broadcast"
    )
    
    # Broadcast spirit_thinking event
    await manager.broadcast(session_id, {
        "event": EventType.SPIRIT_THINKING,
        "data": {},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    logger.info(
        "spirit.thinking",
        session_id=session_id,
        event_type="spirit_event"
    )
    
    # Generate spirit response using Kiro API
    try:
        # Build spirit request
        spirit_request = SpiritRequest(
            session_id=session_id,
            question=message_text,
            user_name=user_name,
            session_history=[]  # TODO: Load from database
        )
        
        # Generate response
        spirit_response = await spirit_service.generate_response(spirit_request)
        
        # Broadcast spirit_response event
        await manager.broadcast(session_id, {
            "event": EventType.SPIRIT_RESPONSE,
            "data": {
                "message": spirit_response.text,
                "word_count": spirit_response.word_count,
                "letter_timings": spirit_response.letter_timings,
                "audio_url": spirit_response.audio_url,
                "timestamp": datetime.now(timezone.utc).isoformat()
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        logger.info(
            "spirit.response.sent",
            session_id=session_id,
            word_count=spirit_response.word_count,
            response_length=len(spirit_response.text),
            event_type="spirit_event"
        )
        
    except SpiritServiceError as e:
        logger.error(
            "spirit.response.failed",
            session_id=session_id,
            error=str(e),
            event_type="spirit_error"
        )
        
        # Send error event to clients
        await manager.broadcast(session_id, {
            "event": EventType.ERROR,
            "data": {
                "code": "SPIRIT_ERROR",
                "message": "The spirit could not respond. Try again."
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        })


@router.websocket("/ws/{session_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: str
) -> None:
    """
    WebSocket connection endpoint for real-time session communication.
    
    Handles the full lifecycle of a WebSocket connection:
    1. Accept connection
    2. Receive initial user data
    3. Register connection with manager
    4. Process incoming messages
    5. Handle disconnection and cleanup
    
    Args:
        websocket: The WebSocket connection
        session_id: The session ID to join
        
    Events Received (Client → Server):
        - Initial connection: {"user_id": str, "name": str}
        - send_message: {"event": "send_message", "data": {"message": str, "user_name": str}}
        
    Events Sent (Server → Client):
        - user_joined: When a user joins the session
        - user_left: When a user leaves the session
        - message_received: When a user sends a message
        - spirit_thinking: When AI is processing a response
        - error: When an error occurs
    """
    # Accept the WebSocket connection
    await websocket.accept()
    
    try:
        # Wait for initial user data
        user_data = await websocket.receive_json()
        
        # Extract user information
        user_info = {
            "id": user_data.get("user_id", "unknown"),
            "name": user_data.get("name", "Anonymous"),
            "joined_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Register connection with WebSocket manager
        # Note: manager.connect() will accept the connection again, but that's okay
        # We need to accept first to receive the initial user data
        if session_id not in manager.active_connections:
            manager.active_connections[session_id] = []
        
        manager.active_connections[session_id].append(websocket)
        manager.user_registry[websocket] = user_info
        
        # Log WebSocket connection with structured logging
        log_websocket_connection(
            session_id=session_id,
            user_id=user_info['id'],
            user_name=user_info['name'],
            logger=logger
        )
        
        # Broadcast user_joined to others (exclude this connection)
        await manager.broadcast(
            session_id,
            {
                "event": EventType.USER_JOINED,
                "data": user_info,
                "timestamp": datetime.now(timezone.utc).isoformat()
            },
            exclude=websocket
        )
        
        # Message receive loop
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            event = data.get("event")
            
            # Handle different event types
            if event == EventType.SEND_MESSAGE or event == "send_message":
                await handle_user_message(
                    websocket,
                    session_id,
                    data.get("data", {})
                )
            else:
                logger.warning(
                    "websocket.unknown_event",
                    session_id=session_id,
                    event=event,
                    event_type="unknown_event"
                )
    
    except WebSocketDisconnect:
        # Handle clean disconnection
        user_info = manager.user_registry.get(websocket, {})
        
        # Log WebSocket disconnection with structured logging
        log_websocket_disconnection(
            session_id=session_id,
            user_id=user_info.get('id', 'unknown'),
            user_name=user_info.get('name', 'Unknown'),
            logger=logger
        )
        
        # Get user info before removing
        user_info = manager.disconnect(websocket, session_id)
        
        # Broadcast user_left event to remaining participants
        if user_info:
            await manager.broadcast(session_id, {
                "event": EventType.USER_LEFT,
                "data": user_info,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
    
    except Exception as e:
        # Handle unexpected errors
        user_info = manager.user_registry.get(websocket, {})
        
        # Log WebSocket error with structured logging
        log_websocket_error(
            error=e,
            session_id=session_id,
            user_id=user_info.get('id'),
            logger=logger
        )
        
        # Try to send error event to client
        try:
            await manager.send_to(websocket, {
                "event": EventType.ERROR,
                "data": {
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected error occurred"
                },
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        except:
            pass
        
        # Cleanup connection
        user_info = manager.disconnect(websocket, session_id)
        
        # Broadcast user_left event
        if user_info:
            await manager.broadcast(session_id, {
                "event": EventType.USER_LEFT,
                "data": user_info,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
