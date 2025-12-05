// MessageFeed component for displaying message history

'use client';

import { useEffect, useRef, useMemo, memo } from 'react';
import { useSessionStore } from '@/stores/session-store';
import { MessageItem } from './message-item';
import { cn } from '@/lib/utils';

interface MessageFeedProps {
  className?: string;
}

export const MessageFeed = memo<MessageFeedProps>(({ className }) => {
  const messages = useSessionStore((state) => state.messages);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Memoize sorted messages to avoid re-sorting on every render
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [messages]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sortedMessages]);

  return (
    <div
      className={cn(
        'flex flex-col',
        'bg-slate-950 border border-slate-800',
        'rounded-lg overflow-hidden',
        className
      )}
      role="region"
      aria-label="Message history"
    >
      {/* Header */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-slate-800 bg-slate-900/50 flex-shrink-0">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-100">
          Messages
        </h3>
        <p className="text-xs text-slate-400 mt-0.5 sm:mt-1" aria-live="polite">
          {messages.length} {messages.length === 1 ? 'message' : 'messages'}
        </p>
      </div>

      {/* Message List - Scrollable */}
      <div
        ref={scrollRef}
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden',
          'p-2 sm:p-3 md:p-4',
          'space-y-2 sm:space-y-3',
          'bg-slate-950/50',
          // Custom scrollbar styles
          'scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-slate-900/50',
          // Webkit scrollbar fallback
          '[&::-webkit-scrollbar]:w-2',
          '[&::-webkit-scrollbar-track]:bg-slate-900/50',
          '[&::-webkit-scrollbar-thumb]:bg-purple-500/30',
          '[&::-webkit-scrollbar-thumb]:rounded-full',
          '[&::-webkit-scrollbar-thumb]:hover:bg-purple-500/50'
        )}
        style={{
          // Ensure smooth scrolling on mobile
          WebkitOverflowScrolling: 'touch'
        }}
        role="log"
        aria-label="Message list"
        aria-live="polite"
        aria-atomic="false"
      >
        {sortedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[100px]">
            <p className="text-slate-500 text-xs sm:text-sm text-center px-4">
              No messages yet. Ask the spirit a question...
            </p>
          </div>
        ) : (
          sortedMessages.map((message, index) => (
            <MessageItem key={`${message.timestamp}-${index}`} message={message} />
          ))
        )}
      </div>
    </div>
  );
});

MessageFeed.displayName = 'MessageFeed';
