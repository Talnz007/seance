// Session-related type definitions

export interface Session {
  id: string;
  name: string;
  created_at: string;
  max_users: number;
  is_active: boolean;
}

export interface User {
  id: string;
  name: string;
  joined_at: string;
}

export interface Message {
  type: 'user' | 'spirit';
  user_name?: string;
  message: string;
  timestamp: string;
  letter_timings?: number[];
}
