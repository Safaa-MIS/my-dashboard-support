/**
 * Application Configuration Constants
 * All magic numbers and configuration values in one place
 */

/**
 * Pagination Configuration
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100] as const,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
} as const;

/**
 * Debounce/Throttle Timings (in milliseconds)
 */
export const TIMING = {
  DEBOUNCE: {
    SEARCH: 300,
    INPUT: 500,
    RESIZE: 250,
  },
  TOAST: {
    SUCCESS: 3000,
    ERROR: 5000,
    WARNING: 4000,
    INFO: 3000,
  },
  CACHE: {
    AUTH_STATUS: 30000, // 30 seconds
    USER_DATA: 300000,  // 5 minutes
  },
  BATCH: {
    LOG_INTERVAL: 10000, // 10 seconds
    LOG_BUFFER_SIZE: 50,
  },
} as const;

/**
 * Input Validation Limits
 */
export const INPUT_LIMITS = {
  TEXT: {
    MIN: 1,
    MAX: 255,
    SEARCH_MAX: 100,
  },
  EMAIL: {
    MAX: 254, // RFC 5321
  },
  PASSWORD: {
    MIN: 8,
    MAX: 128,
  },
  USERNAME: {
    MIN: 4,
    MAX: 30,
  },
  URL: {
    MAX: 2048, // RFC 7230
  },
  FILENAME: {
    MAX: 255,
  },
} as const;

//HTTP Configuration
export const HTTP = {
  TIMEOUT: 30000, // 30 seconds
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
  },
  STATUS_CODES: {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
  },
} as const;

//UI Configuration

export const UI = {
  SIDEBAR: {
    WIDTH: 250,
    COLLAPSED_WIDTH: 60,
  },
  NAVBAR: {
    HEIGHT: 56,
  },
  PAGINATION: {
    MAX_VISIBLE_PAGES: 7,
  },
  AVATAR: {
    SIZE: 40,
  },
} as const;

//Security Configuration
export const SECURITY = {
  SESSION: {
    ID_LENGTH: 32,
  },
  SANITIZATION: {
    ALLOWED_PROTOCOLS: ['http://', 'https://', '/'] as const,
    DANGEROUS_PROTOCOLS: ['javascript:', 'data:', 'vbscript:', 'file:'] as const,
  },
} as const;

//Logger Configuration
export const LOGGER = {
  BATCH_SIZE: 50,
  BATCH_INTERVAL: 10000, // 10 seconds
  MAX_STACK_TRACE_LENGTH: 1000,
} as const;

//User Status Options

export const USER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
} as const;

// User Roles 
export const USER_ROLES = {
  ADMIN: 'Admin',
  USER: 'User',
  MANAGER: 'Manager',
  GUEST: 'Guest',
} as const;


