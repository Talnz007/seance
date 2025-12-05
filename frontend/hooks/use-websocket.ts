// WebSocket hook for real-time session communication

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSessionStore } from '@/stores/session-store';
import { WS_URL } from '@/lib/constants';
import type {
  ServerEvent,
  UserJoinedEvent,
  UserLeftEvent,
  MessageReceivedEvent,
  SpiritThinkingEvent,
  SpiritResponseEvent,
  ErrorEvent
} from '@/types/websocket';
import type { Message } from '@/types/session';

interface UseWebSocketOptions {
  sessionId: string;
  userId: string;
  userName: string;
}

interface UseWebSocketReturn {
  sendMessage: (message: string) => Promise<boolean>;
  connectionError: string | null;
  isReconnecting: boolean;
  reconnectAttempt: number;
}

export const useWebSocket = ({
  sessionId,
  userId,
  userName,
}: UseWebSocketOptions): UseWebSocketReturn => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // Start with 1 second

  // Local state for error handling
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const {
    addUser,
    removeUser,
    addMessage,
    setConnected,
    setRevealing,
  } = useSessionStore();

  // Handle incoming WebSocket events
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data: ServerEvent = JSON.parse(event.data);

      switch (data.event) {
        case 'user_joined': {
          const joinedEvent = data as UserJoinedEvent;
          console.log('User joined:', joinedEvent.data);
          addUser(joinedEvent.data);
          break;
        }

        case 'user_left': {
          const leftEvent = data as UserLeftEvent;
          console.log('User left:', leftEvent.data);
          removeUser(leftEvent.data.id);
          break;
        }

        case 'message_received': {
          const msgEvent = data as MessageReceivedEvent;
          console.log('Message received:', msgEvent.data);
          const message: Message = {
            type: 'user',
            user_name: msgEvent.data.user_name,
            message: msgEvent.data.message,
            timestamp: msgEvent.data.timestamp,
          };
          addMessage(message);
          break;
        }

        case 'spirit_thinking': {
          console.log('Spirit is thinking...');
          setRevealing(true);
          break;
        }

        case 'spirit_response': {
          const spiritEvent = data as SpiritResponseEvent;
          console.log('Spirit response:', spiritEvent.data);
          const message: Message = {
            type: 'spirit',
            message: spiritEvent.data.message,
            timestamp: spiritEvent.data.timestamp,
            letter_timings: spiritEvent.data.letter_timings,
          };
          addMessage(message);
          setRevealing(false);
          break;
        }

        case 'error': {
          const errorEvent = data as ErrorEvent;
          console.error('WebSocket error event:', errorEvent.data);
          // Could show toast notification here
          break;
        }

        default:
          console.warn('Unknown event type:', data);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [addUser, removeUser, addMessage, setRevealing]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Don't connect if missing required data
    if (!sessionId || !userId || !userName) {
      return;
    }

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = `${WS_URL}/ws/${sessionId}`;
      console.log('Connecting to WebSocket:', wsUrl);
      setConnectionError(null);

      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        setConnectionError(null);
        setIsReconnecting(false);
        reconnectAttemptsRef.current = 0;

        // Send user identification
        try {
          socket.send(JSON.stringify({
            user_id: userId,
            name: userName,
          }));
        } catch (error) {
          console.error('Error sending user identification:', error);
          setConnectionError('Failed to identify user to server');
        }
      };

      socket.onmessage = handleMessage;

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
        setConnectionError('Connection error occurred');
      };

      socket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setConnected(false);
        socketRef.current = null;

        // Determine error message based on close code
        let errorMessage = 'Connection closed';
        if (event.code === 1006) {
          errorMessage = 'Connection lost unexpectedly';
        } else if (event.code >= 4000) {
          errorMessage = event.reason || 'Server refused connection';
        }

        // Attempt reconnection if not a normal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          setIsReconnecting(true);

          // Exponential backoff: 1s, 2s, 4s, 8s, 16s
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1);

          console.log(
            `Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
          );
          setConnectionError(`${errorMessage}. Reconnecting...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
          setIsReconnecting(false);
          setConnectionError('Connection failed. Please refresh the page.');
        } else {
          setConnectionError(errorMessage);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setConnected(false);
      setConnectionError('Failed to establish connection');
    }
  }, [sessionId, userId, userName, handleMessage, setConnected, baseReconnectDelay, maxReconnectAttempts]);

  // Send message function with error handling
  const sendMessage = useCallback(async (message: string): Promise<boolean> => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      setConnectionError('Cannot send message: Not connected');
      return false;
    }

    try {
      socketRef.current.send(JSON.stringify({
        event: 'send_message',
        data: {
          user_name: userName,
          message,
        },
      }));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      setConnectionError('Failed to send message');
      return false;
    }
  }, [userName]);

  // Connect on mount, cleanup on unmount
  useEffect(() => {
    connect();

    return () => {
      // Clear reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Close WebSocket connection
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounting');
        socketRef.current = null;
      }
    };
  }, [connect]);

  return {
    sendMessage,
    connectionError,
    isReconnecting,
    reconnectAttempt: reconnectAttemptsRef.current,
  };
};
