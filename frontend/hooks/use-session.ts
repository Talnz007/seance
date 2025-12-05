// Session data management hook

import { useState, useEffect, useCallback } from 'react';
import { useSessionStore } from '@/stores/session-store';
import { getSession, ApiError } from '@/lib/api';
import type { Session } from '@/types/session';

interface UseSessionOptions {
  sessionId: string;
}

interface UseSessionReturn {
  session: Session | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSession = ({
  sessionId,
}: UseSessionOptions): UseSessionReturn => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { session, setSession } = useSessionStore();

  // Fetch session data
  const fetchSession = useCallback(async () => {
    if (!sessionId) {
      setError('Session ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sessionData = await getSession(sessionId);
      setSession(sessionData);
    } catch (err) {
      console.error('Error fetching session:', err);
      
      if (err instanceof ApiError) {
        // Handle specific API errors
        if (err.statusCode === 404) {
          setError('Session not found. Please check the session ID.');
        } else if (err.code === 'NETWORK_ERROR') {
          setError('Network error. Please check your connection.');
        } else {
          setError(err.message || 'Failed to load session');
        }
      } else {
        setError('An unexpected error occurred');
      }
      
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [sessionId, setSession]);

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    await fetchSession();
  }, [fetchSession]);

  // Fetch on mount and when sessionId changes
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return {
    session,
    loading,
    error,
    refetch,
  };
};
