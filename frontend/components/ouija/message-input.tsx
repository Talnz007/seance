// Message input component for asking questions to the spirit

'use client';

import { useState, FormEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { isValidMessage } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

const MAX_MESSAGE_LENGTH = 500;

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  className,
}) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous error
    setError(null);

    // Validate message
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setError('Please enter a question');
      return;
    }

    if (!isValidMessage(trimmedMessage)) {
      if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
        setError(`Message must be ${MAX_MESSAGE_LENGTH} characters or less`);
      } else {
        setError('Please enter a valid message');
      }
      return;
    }

    // Send message
    onSendMessage(trimmedMessage);

    // Clear input
    setMessage('');
  }, [message, onSendMessage]);

  const handleChange = useCallback((value: string) => {
    setMessage(value);

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  }, [error]);

  const remainingChars = MAX_MESSAGE_LENGTH - message.length;
  const isNearLimit = remainingChars < 50;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('w-full max-w-2xl mx-auto', className)}
    >
      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <Input
              type="text"
              value={message}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Ask the spirit a question..."
              disabled={disabled}
              maxLength={MAX_MESSAGE_LENGTH}
              className={cn(
                'bg-slate-900/50 border-purple-500/30',
                'text-slate-100 placeholder:text-slate-500',
                'text-sm sm:text-base',
                'focus:border-purple-400 focus:ring-purple-500/20',
                disabled && 'opacity-50 cursor-not-allowed',
                error && 'border-red-500/50 focus:border-red-400'
              )}
              aria-label="Question input"
              aria-invalid={!!error}
              aria-describedby={error ? 'message-error' : undefined}
            />
          </div>

          <Button
            type="submit"
            disabled={disabled || !message.trim()}
            variant="primary"
            className={cn(
              'bg-purple-600 hover:bg-purple-700',
              'text-white font-semibold',
              'text-sm sm:text-base',
              'shadow-lg shadow-purple-500/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200',
              'w-full sm:w-auto px-6'
            )}
          >
            {disabled ? 'Waiting...' : 'Ask'}
          </Button>
        </div>

        {/* Character count and error */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-xs">
          <div className="flex-1">
            {error && (
              <span
                id="message-error"
                className="text-red-400"
                role="alert"
              >
                {error}
              </span>
            )}
          </div>

          <div
            className={cn(
              'text-slate-500 whitespace-nowrap',
              isNearLimit && 'text-yellow-500',
              remainingChars < 0 && 'text-red-500'
            )}
          >
            {remainingChars} characters remaining
          </div>
        </div>

        {/* Helper text */}
        {disabled && (
          <p className="text-xs text-slate-500 text-center">
            The spirit is responding... Please wait.
          </p>
        )}
      </div>
    </form>
  );
};
