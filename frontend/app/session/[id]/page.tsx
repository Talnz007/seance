'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const OuijaBoard = dynamic(() => import('@/components/ouija/ouija-board').then(mod => mod.OuijaBoard), {
  loading: () => <div className="w-full h-[400px] flex items-center justify-center text-purple-500/50">Summoning board...</div>,
  ssr: false // Board interaction is client-side only
});
import { UserList } from '@/components/session/user-list';
import { MessageFeed } from '@/components/session/message-feed';
import { useWebSocket } from '@/hooks/use-websocket';
import { useSession } from '@/hooks/use-session';
import { useSessionStore } from '@/stores/session-store';

export default function SessionRoomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [isNamePromptOpen, setIsNamePromptOpen] = useState(true);
  const [nameInput, setNameInput] = useState('');

  const { session, loading: sessionLoading, error: sessionError } = useSession({ sessionId });
  const { isConnected } = useSessionStore();

  // Generate userId on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('seance_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('seance_user_id', newUserId);
      setUserId(newUserId);
    }
  }, []);

  // Initialize WebSocket connection after user provides name
  const websocketEnabled = Boolean(userName && userId && sessionId);
  const { sendMessage, connectionError, isReconnecting, reconnectAttempt } = useWebSocket(
    websocketEnabled
      ? { sessionId, userId, userName }
      : { sessionId: '', userId: '', userName: '' }
  );

  // Handle Escape key to go back
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isNamePromptOpen) {
        router.push('/');
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isNamePromptOpen, router]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      setIsNamePromptOpen(false);
    }
  };

  // Loading state
  if (sessionLoading || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Summoning the spirit...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (sessionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">👻</div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">Session Not Found</h1>
          <p className="text-slate-400 mb-6">{sessionError}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }



  // Name prompt modal
  if (isNamePromptOpen) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-950 p-4"
        role="dialog"
        aria-labelledby="name-prompt-title"
        aria-describedby="name-prompt-description"
      >
        <div className="bg-slate-900 border border-purple-500/30 rounded-lg p-8 max-w-md w-full">
          <h2
            id="name-prompt-title"
            className="text-2xl font-bold text-purple-400 mb-2 text-center"
          >
            Enter the Séance
          </h2>
          <p
            id="name-prompt-description"
            className="text-slate-400 text-sm mb-6 text-center"
          >
            The spirit awaits your presence...
          </p>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    router.push('/');
                  }
                }}
                placeholder="Enter your name"
                className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                autoFocus
                maxLength={50}
                aria-required="true"
              />
            </div>
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              aria-label="Join session with entered name"
              aria-disabled={!nameInput.trim()}
            >
              Join Session
            </button>
          </form>
          <p className="text-xs text-slate-500 text-center mt-4">
            Press Escape to return home
          </p>
        </div>
      </div>
    );
  }

  // Main session room
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header
        className="bg-slate-900/50 border-b border-purple-500/20 px-3 sm:px-4 py-2 sm:py-3"
        role="banner"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-purple-400 truncate">
              {session?.name || 'Séance Session'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              <span className="sr-only">Session ID:</span>
              {sessionId}
            </p>
          </div>

          {/* Connection Status */}
          <div
            className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-2"
            role="status"
            aria-live="polite"
            aria-label={`Connection status: ${isConnected ? 'Connected' : isReconnecting ? `Reconnecting (${reconnectAttempt}/5)` : 'Disconnected'}`}
          >
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : isReconnecting ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                }`}
              aria-hidden="true"
            ></div>
            <span className="text-xs sm:text-sm text-slate-400 hidden sm:inline">
              {isConnected ? 'Connected' : isReconnecting ? `Reconnecting (${reconnectAttempt}/5)` : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Error Banner */}
        {connectionError && (
          <div
            className="bg-red-900/30 border-l-4 border-red-500 px-3 sm:px-4 py-2 sm:py-3"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-200 font-medium">Connection Issue</p>
                <p className="text-xs text-red-300 mt-1">{connectionError}</p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content - Responsive Layout */}
      <div
        className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full gap-3 sm:gap-4 p-3 sm:p-4 overflow-hidden"
        role="main"
      >
        {/* User List - Collapsible on Mobile, Sidebar on Desktop */}
        <div className="lg:w-64 flex-shrink-0 order-1 lg:order-1">
          <UserList currentUserId={userId} className="h-48 md:h-64 lg:h-full" />
        </div>

        {/* Ouija Board - Center, Full Width on Mobile */}
        <section
          className="flex-1 flex items-center justify-center order-2 lg:order-2 min-h-[400px] md:min-h-[500px] lg:min-h-0"
          aria-label="Ouija board interaction area"
        >
          <OuijaBoard sessionId={sessionId} onSendMessage={sendMessage} />
        </section>

        {/* Message Feed - Bottom on Mobile, Right Sidebar on Desktop */}
        <div className="lg:w-80 flex-shrink-0 order-3 lg:order-3">
          <MessageFeed className="h-64 md:h-80 lg:h-full" />
        </div>
      </div>
    </div>
  );
}
