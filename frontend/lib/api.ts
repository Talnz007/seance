// API client for backend communication

import { API_URL } from './constants';
import type { Session } from '@/types';

/**
 * API response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
  };
}

/**
 * Session creation request
 */
export interface CreateSessionRequest {
  name: string;
  max_users?: number;
}

/**
 * API error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Make API request with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Parse response
    const data: ApiResponse<T> = await response.json();

    // Handle error responses
    if (!response.ok || !data.success) {
      throw new ApiError(
        data.error?.message || 'An error occurred',
        data.error?.code,
        response.status,
        data.error?.details
      );
    }

    // Return data
    if (!data.data) {
      throw new ApiError('No data in response', 'NO_DATA', response.status);
    }

    return data.data;
  } catch (error) {
    // Network or parsing errors
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new ApiError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR'
      );
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Create a new session
 */
export async function createSession(
  request: CreateSessionRequest
): Promise<Session> {
  return apiRequest<Session>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Get session by ID
 */
export async function getSession(sessionId: string): Promise<Session> {
  return apiRequest<Session>(`/api/sessions/${sessionId}`, {
    method: 'GET',
  });
}

/**
 * Join an existing session (verify it exists and has space)
 */
export async function joinSession(sessionId: string): Promise<Session> {
  const session = await getSession(sessionId);
  
  // Additional validation could be done here
  if (!session.is_active) {
    throw new ApiError(
      'This session is no longer active',
      'SESSION_INACTIVE',
      400
    );
  }
  
  return session;
}

/**
 * End a session (creator only)
 */
export async function endSession(sessionId: string): Promise<void> {
  await apiRequest<void>(`/api/sessions/${sessionId}`, {
    method: 'DELETE',
  });
}

/**
 * Get session message history
 */
export async function getSessionHistory(sessionId: string): Promise<any[]> {
  return apiRequest<any[]>(`/api/sessions/${sessionId}/history`, {
    method: 'GET',
  });
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<{ status: string }> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return await response.json();
  } catch (error) {
    throw new ApiError('Backend is not reachable', 'BACKEND_UNREACHABLE');
  }
}
