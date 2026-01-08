export const USER_ROLES = {
  ADMIN: 'Admin',
  USER: 'User',
  MANAGER: 'Manager',
  GUEST: 'Guest',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];