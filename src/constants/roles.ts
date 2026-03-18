/**
 * User role constants
 * Use these instead of magic strings for role checks
 */

export const USER_ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
} as const;

// Type helper
export type UserRoleValue = typeof USER_ROLES[keyof typeof USER_ROLES];
