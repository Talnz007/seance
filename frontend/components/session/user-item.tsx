// Individual user display component with animations

'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { User } from '@/types/session';
import { cn } from '@/lib/utils';

interface UserItemProps {
  user: User;
  isCurrentUser?: boolean;
  className?: string;
}

const userVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

export const UserItem: React.FC<UserItemProps> = memo(({
  user,
  isCurrentUser = false,
  className
}) => {
  // Memoize formatted join time
  const formattedJoinTime = useMemo(() => {
    try {
      const date = new Date(user.joined_at);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  }, [user.joined_at]);

  return (
    <motion.li
      variants={userVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex items-center justify-between',
        'px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg',
        'border transition-all duration-200',
        'min-w-0', // Allow flex children to shrink
        isCurrentUser
          ? 'bg-purple-900/40 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
          : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50',
        className
      )}
      role="listitem"
      aria-label={`${user.name}${isCurrentUser ? ' (current user)' : ''}, joined at ${formattedJoinTime}`}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div
          className={cn(
            'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0',
            isCurrentUser ? 'bg-purple-500' : 'bg-emerald-500'
          )}
          role="status"
          aria-label={isCurrentUser ? 'Current user indicator' : 'Online indicator'}
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-xs sm:text-sm font-medium truncate',
              isCurrentUser ? 'text-purple-100' : 'text-slate-100'
            )}
          >
            {user.name}
            {isCurrentUser && (
              <span className="ml-1 sm:ml-2 text-xs text-purple-400">(you)</span>
            )}
          </p>
          <p className="text-xs text-slate-400 truncate">
            Joined {formattedJoinTime}
          </p>
        </div>
      </div>
    </motion.li>
  );
});

UserItem.displayName = 'UserItem';
