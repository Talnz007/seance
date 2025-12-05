// MessageItem component for displaying individual messages

import { memo, useMemo } from 'react';
import { Message } from '@/types/session';
import { cn } from '@/lib/utils';

interface MessageItemProps {
  message: Message;
  className?: string;
}

export const MessageItem: React.FC<MessageItemProps> = memo(({
  message,
  className
}) => {
  const isSpirit = message.type === 'spirit';

  // Memoize formatted time to avoid recalculating on every render
  const formattedTime = useMemo(() => {
    const date = new Date(message.timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [message.timestamp]);

  return (
    <article
      className={cn(
        'flex flex-col gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-lg',
        'max-w-full break-words',
        isSpirit
          ? 'bg-purple-900/20 border border-purple-500/30 items-start'
          : 'bg-slate-800/40 border border-slate-700/50 items-end',
        className
      )}
      role="article"
      aria-label={`${isSpirit ? 'Spirit' : message.user_name || 'User'} message`}
    >
      {/* User name (only for user messages) */}
      {!isSpirit && message.user_name && (
        <span
          className="text-xs font-medium text-slate-400 truncate max-w-full"
          aria-label="Sender"
        >
          {message.user_name}
        </span>
      )}

      {/* Spirit indicator */}
      {isSpirit && (
        <span
          className="text-xs font-medium text-purple-400"
          aria-label="Sender"
        >
          The Spirit
        </span>
      )}

      {/* Message text */}
      <p
        className={cn(
          'text-xs sm:text-sm leading-relaxed',
          'break-words overflow-wrap-anywhere',
          isSpirit
            ? 'text-purple-100'
            : 'text-slate-200'
        )}
        aria-label="Message content"
      >
        {message.message}
      </p>

      {/* Timestamp */}
      <time
        className="text-xs text-slate-500"
        dateTime={message.timestamp}
        aria-label="Message time"
      >
        {formattedTime}
      </time>
    </article>
  );
});

MessageItem.displayName = 'MessageItem';
