// Application Messages Constants
// Centralized messages for errors, successes, confirmations, and validations
export const MESSAGES = {
  ERROR: {
    GENERIC: 'An unexpected error occurred. Please try again.',
    NETWORK: 'Network connection failed. Please check your internet connection.',
    SESSION_EXPIRED: 'Your session has expired. Please login again.',
    UNAUTHORIZED: 'You do not have permission to access this resource.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
    VALIDATION: 'Please check your input and try again.',
    LOAD_FAILED: 'Failed to load data. Please try again.',
    DELETE_FAILED: (item: string) => `Failed to delete ${item}. Please try again.`,
    UPDATE_FAILED: (item: string) => `Failed to update ${item}. Please try again.`,
    CREATE_FAILED: (item: string) => `Failed to create ${item}. Please try again.`,
  
  },
  SUCCESS: {
    LOGIN: 'Login successful!',
    LOGOUT: 'Logged out successfully.',
    SAVED: 'Changes saved successfully.',
    CREATED: 'Created successfully.',
    UPDATED: 'Updated successfully.',
    DELETED: 'Deleted successfully.',
    DELETED_ITEM: (item: string) => `${item} deleted successfully.`,
    CREATED_ITEM: (item: string) => `${item} created successfully.`,
    UPDATED_ITEM: (item: string) => `${item} updated successfully.`,
  },
  CONFIRM: {
    DELETE: (itemName: string) => `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
    LOGOUT: 'Are you sure you want to logout?',
    DISCARD_CHANGES: 'You have unsaved changes. Do you want to discard them?',
    BULK_DELETE: (count: number) => `Are you sure you want to delete ${count} items? This action cannot be undone.`,
 
  },
  VALIDATION: {
    REQUIRED: (fieldName: string) => `${fieldName} is required.`,
    MIN_LENGTH: (fieldName: string, length: number) => `${fieldName} must be at least ${length} characters.`,
    MAX_LENGTH: (fieldName: string, length: number) => `${fieldName} must not exceed ${length} characters.`,
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_FORMAT: (fieldName: string) => `${fieldName} format is invalid.`,
    PASSWORD_REQUIREMENTS: 'Password must be 8+ characters with uppercase, lowercase, number, and special character.',
    INVALID_PHONE: 'Please enter a valid phone number.',
    INVALID_DATE: 'Please enter a valid date.',
    MIN_VALUE: (fieldName: string, value: number) => `${fieldName} must be at least ${value}.`,
    MAX_VALUE: (fieldName: string, value: number) => `${fieldName} must not exceed ${value}.`,

  },
  INFO: {
    NO_RESULTS: 'No results found.',
    LOADING: 'Loading...',
    PROCESSING: 'Processing...',
    EMPTY_STATE: 'No data available.',
    SEARCHING: 'Searching...',
    SAVING: 'Saving...',
    DELETING: 'Deleting...',
  },
} as const;

//Permission Messages
export const PERMISSION_MESSAGES = {
  NO_CREATE: 'You do not have permission to create items.',
  NO_EDIT: 'You do not have permission to edit this item.',
  NO_DELETE: 'You do not have permission to delete this item.',
  NO_VIEW: 'You do not have permission to view this content.',
} as const;