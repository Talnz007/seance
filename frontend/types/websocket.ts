// WebSocket event type definitions

import type { User, Message } from './session';

// Client → Server Events
export interface SendMessageEvent {
  event: 'send_message';
  data: {
    user_name: string;
    message: string;
  };
}

export interface JoinSessionEvent {
  event: 'join_session';
  data: {
    user_id: string;
    name: string;
  };
}

export interface LeaveSessionEvent {
  event: 'leave_session';
  data: {};
}

export interface TypingEvent {
  event: 'typing';
  data: {
    user_name: string;
  };
}

export type ClientEvent = SendMessageEvent | JoinSessionEvent | LeaveSessionEvent | TypingEvent;

// Server → Client Events
export interface UserJoinedEvent {
  event: 'user_joined';
  data: User;
}

export interface UserLeftEvent {
  event: 'user_left';
  data: User;
}

export interface MessageReceivedEvent {
  event: 'message_received';
  data: {
    user_name: string;
    message: string;
    timestamp: string;
  };
}

export interface SpiritThinkingEvent {
  event: 'spirit_thinking';
  data: {};
}

export interface SpiritResponseEvent {
  event: 'spirit_response';
  data: {
    message: string;
    letter_timings: number[];
    timestamp: string;
  };
}

export interface ErrorEvent {
  event: 'error';
  data: {
    message: string;
    code?: string;
  };
}

export type ServerEvent = 
  | UserJoinedEvent 
  | UserLeftEvent 
  | MessageReceivedEvent 
  | SpiritThinkingEvent 
  | SpiritResponseEvent 
  | ErrorEvent;

// WebSocket message wrapper
export interface WebSocketMessage<T = any> {
  event: string;
  data: T;
  timestamp?: string;
}
