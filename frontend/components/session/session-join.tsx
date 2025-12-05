'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { getSession } from '@/lib/api';
import { cn } from '@/lib/utils';

interface SessionJoinProps {
  onSessionJoined?: (sessionId: string) => void;
  className?: string;
}

export const SessionJoin: React.FC<SessionJoinProps> = ({
  onSessionJoined,
  className
}) => {
  const router = useRouter();
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateSessionId = (id: string): boolean => {
    if (!id.trim()) {
      setError('Session ID is required');
      return false;
    }
    // Basic format validation - adjust based on your session ID format
    if (id.trim().length < 3) {
      setError('Invalid session ID format');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedId = sessionId.trim();
    
    if (!validateSessionId(trimmedId)) {
      return;
    }

    setLoading(true);

    try {
      // Verify session exists and is joinable
      const session = await getSession(trimmedId);

      if (!session.is_active) {
        setError('This session is no longer active');
        setLoading(false);
        return;
      }

      // Note: We can't check if session is full here without user count
      // That will be handled by the WebSocket connection in the session room

      if (onSessionJoined) {
        onSessionJoined(session.id);
      }

      // Redirect to session room
      router.push(`/session/${session.id}`);
    } catch (err) {
      console.error('Failed to join session:', err);
      
      // Handle specific error cases
      if (err instanceof Error) {
        if (err.message.includes('404') || err.message.includes('not found')) {
          setError('Session not found. Please check the ID and try again.');
        } else if (err.message.includes('full')) {
          setError('This session is full. Please try another session.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to join session. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn('p-6', className)}>
      <h2 className="text-2xl font-bold text-slate-100 mb-4">
        Join Séance
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Session ID"
          type="text"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder="Enter session ID..."
          disabled={loading}
          required
        />

        {error && (
          <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          className="w-full disabled:bg-slate-700 disabled:text-slate-300"
          aria-busy={loading}
        >
          {loading ? 'Joining...' : 'Join Session'}
        </Button>
      </form>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-sm text-slate-400 text-center">
          Ask the session creator for the session ID
        </p>
      </div>
    </Card>
  );
};
