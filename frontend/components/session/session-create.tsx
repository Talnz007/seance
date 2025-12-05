'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { createSession } from '@/lib/api';
import { cn } from '@/lib/utils';

interface SessionCreateProps {
  onSessionCreated?: (sessionId: string) => void;
  className?: string;
}

export const SessionCreate: React.FC<SessionCreateProps> = ({
  onSessionCreated,
  className
}) => {
  const router = useRouter();
  const [sessionName, setSessionName] = useState('');
  const [maxUsers, setMaxUsers] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!sessionName.trim()) {
      setError('Session name is required');
      return false;
    }
    if (sessionName.trim().length > 100) {
      setError('Session name must be 100 characters or less');
      return false;
    }
    if (maxUsers < 2 || maxUsers > 12) {
      setError('Max users must be between 2 and 12');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const session = await createSession({
        name: sessionName.trim(),
        max_users: maxUsers
      });

      if (onSessionCreated) {
        onSessionCreated(session.id);
      }

      // Redirect to session room
      router.push(`/session/${session.id}`);
    } catch (err) {
      console.error('Failed to create session:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to create session. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn('p-6', className)}>
      <h2 className="text-2xl font-bold text-slate-100 mb-4">
        Create New Séance
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Session Name"
          type="text"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          placeholder="Enter session name..."
          disabled={loading}
          maxLength={100}
          required
        />

        <div>
          <label 
            htmlFor="max-users" 
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Max Participants
          </label>
          <select
            id="max-users"
            value={maxUsers}
            onChange={(e) => setMaxUsers(Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            disabled={loading}
            className={cn(
              'w-full px-3 py-2 rounded-lg',
              'bg-slate-900 border border-purple-500/30',
              'text-slate-100',
              'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-950',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label="Maximum number of participants"
          >
            {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
              <option key={num} value={num}>
                {num} participants
              </option>
            ))}
          </select>
        </div>

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
          {loading ? 'Creating...' : 'Create Session'}
        </Button>
      </form>
    </Card>
  );
};
