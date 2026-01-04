
export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    UNAUTHORIZED: '/unauthorized',
  },
  APPLICATIONS: {
    ROOT: '/applications',
    PREMARITAL: '/applications/premarital',
    CLINICAL_ATTACHMENT: '/applications/clinicalattachment',
  },
  PREMARITAL: {
    DASHBOARD: '/applications/premarital/dashboard',
    LIST: '/applications/premarital/list',
    REPORTS: '/applications/premarital/reports',
    SETTINGS: '/applications/premarital/settings',
    USERS: {
      CREATE: '/applications/premarital/users/create',
      EDIT: (id: number) => `/applications/premarital/users/edit/${id}`,
    },
  },
  CLINICAL: {
    APPLICATIONS: '/applications/clinicalattachment/applications',
    DETAILS: '/applications/clinicalattachment/details',
    REVIEWS: '/applications/clinicalattachment/reviews',
  },
  ERROR: {
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/unauthorized',
    SERVER_ERROR: '/500',
  },
} as const;

//APIs
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    STATUS: '/auth/status',
    REFRESH: '/auth/refresh',
  },
  CSRF: '/csrf-token',
  USERS: {
    BASE: '/users',
    BY_ID: (id: number) => `/users/${id}`,
    STATUS: (id: number) => `/users/${id}/status`,
  },
  APPLICATIONS: '/applications',
  LOGS: '/logs',
} as const;
