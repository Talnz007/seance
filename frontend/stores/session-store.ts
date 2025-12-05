// Session state management with Zustand

import { create } from 'zustand';
import type { Session, User, Message } from '@/types/session';

interface SessionState {
  // Data
  session: Session | null;
  users: User[];
  messages: Message[];
  isConnected: boolean;
  isRevealing: boolean;

  // Actions
  setSession: (session: Session | null) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  addMessage: (message: Message) => void;
  setConnected: (connected: boolean) => void;
  setRevealing: (revealing: boolean) => void;
  reset: () => void;
}

const initialState = {
  session: null,
  users: [],
  messages: [],
  isConnected: false,
  isRevealing: false,
};

export const useSessionStore = create<SessionState>((set) => ({
  ...initialState,

  setSession: (session) => set({ session }),

  addUser: (user) =>
    set((state) => ({
      users: [...state.users, user],
    })),

  removeUser: (userId) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId),
    })),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setConnected: (connected) => set({ isConnected: connected }),

  setRevealing: (revealing) => set({ isRevealing: revealing }),

  reset: () => set(initialState),
}));
