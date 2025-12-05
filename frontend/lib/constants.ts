/**
 * API and WebSocket URLs
 */
/**
 * API and WebSocket URLs
 * 
 * Dynamically resolve the API URL based on environment or window location.
 * Priority: env var > window hostname > localhost fallback
 */
const getBaseUrl = () => {
  // Priority 1: Use environment variable (for production)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Priority 2: Browser - use current hostname (for LAN testing)
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  // Priority 3: SSR fallback
  return 'http://localhost:8000';
};

const getWsUrl = () => {
  // Priority 1: Use environment variable (for production)
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  // Priority 2: Derive from API URL
  if (process.env.NEXT_PUBLIC_API_URL) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    return apiUrl.replace('https://', 'wss://').replace('http://', 'ws://');
  }
  // Priority 3: Browser - use current hostname
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.hostname}:8000`;
  }
  // Priority 4: SSR fallback
  return 'ws://localhost:8000';
};

export const API_URL = getBaseUrl();
export const WS_URL = getWsUrl();

/**
 * Session configuration
 */
export const SESSION_CONFIG = {
  MIN_USERS: 2,
  MAX_USERS: 12,
  DEFAULT_MAX_USERS: 6,
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
} as const;

/**
 * Message configuration
 */
export const MESSAGE_CONFIG = {
  MAX_LENGTH: 500,
  MIN_LENGTH: 1,
} as const;

/**
 * Animation configuration
 */
export const ANIMATION_CONFIG = {
  PLANCHETTE_SPRING: {
    stiffness: 100,
    damping: 20,
  },
  LETTER_REVEAL_DELAY: 100, // ms between letters
  SPIRIT_THINKING_DURATION: 2000, // ms
} as const;

/**
 * Ouija board letters
 */
export const OUIJA_LETTERS = {
  TOP_ARC: 'ABCDEFGHIJKLM'.split(''),
  MIDDLE_ARC: 'NOPQRSTUVWXYZ'.split(''),
  BOTTOM_ROW: '0123456789'.split(''),
  CONTROLS: ['YES', 'NO', 'GOODBYE'],
} as const;

/**
 * Feature flags
 */
export const FEATURES = {
  VOICE_INPUT: process.env.NEXT_PUBLIC_ENABLE_VOICE_INPUT === 'true',
  ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
} as const;

/**
 * Environment
 */
export const IS_DEVELOPMENT = process.env.NEXT_PUBLIC_ENVIRONMENT === 'development';
export const IS_PRODUCTION = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
