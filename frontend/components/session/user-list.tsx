// User list container with animations

'use client';

import { useState, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UserItem } from './user-item';
import { useSessionStore } from '@/stores/session-store';
import { cn } from '@/lib/utils';

interface UserListProps {
  currentUserId?: string;
  className?: string;
}

export const UserList = memo<UserListProps>(({
  currentUserId,
  className
}) => {
  const { users, session } = useSessionStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const userCount = users.length;
  const maxUsers = session?.max_users || 6;

  return (
    <aside
      className={cn(
        'flex flex-col',
        'bg-slate-950 border border-slate-800',
        'rounded-lg overflow-hidden',
        className
      )}
      role="complementary"
      aria-label="Session participants"
    >
      {/* Header - Clickable on Mobile */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        className={cn(
          'w-full px-3 sm:px-4 py-2 sm:py-3',
          'border-b border-slate-800 bg-slate-900/50',
          'flex items-center justify-between',
          'lg:cursor-default',
          'hover:bg-slate-900/70 lg:hover:bg-slate-900/50 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-slate-950 lg:focus:ring-0'
        )}
        aria-expanded={isExpanded}
        aria-controls="user-list-content"
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} participants list`}
      >
        <div className="text-left">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-100">
            Participants
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 sm:mt-1">
            {userCount}/{maxUsers} in session
          </p>
        </div>

        {/* Collapse indicator - Only visible on mobile/tablet */}
        <svg
          className={cn(
            'w-5 h-5 text-slate-400 transition-transform lg:hidden',
            isExpanded && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* User List - Collapsible on Mobile, Always Visible on Desktop */}
      <motion.div
        id="user-list-content"
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          'overflow-hidden lg:!h-auto lg:!opacity-100',
          'flex-1'
        )}
      >
        <ul
          className="overflow-y-auto p-2 sm:p-3 space-y-1.5 sm:space-y-2 max-h-[200px] md:max-h-[300px] lg:max-h-full"
          role="list"
          aria-label="List of participants"
        >
          <AnimatePresence mode="popLayout">
            {users.map((user) => (
              <UserItem
                key={user.id}
                user={user}
                isCurrentUser={user.id === currentUserId}
              />
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {users.length === 0 && (
            <li className="flex items-center justify-center py-6 sm:py-8">
              <p className="text-xs sm:text-sm text-slate-500">
                No participants yet
              </p>
            </li>
          )}
        </ul>
      </motion.div>
    </aside>
  );
});

UserList.displayName = 'UserList';
