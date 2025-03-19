export type Role = 'platform_admin' | 'business_admin' | 'business_staff';

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface RolePermissions {
  platform_admin: Permission[];
  business_admin: Permission[];
  business_staff: Permission[];
}

export const PERMISSIONS = {
  // Platform-level permissions
  MANAGE_PLATFORM: 'manage_platform',
  MANAGE_BUSINESSES: 'manage_businesses',
  MANAGE_ADMINS: 'manage_admins',
  VIEW_PLATFORM_ANALYTICS: 'view_platform_analytics',
  
  // Business-level permissions
  MANAGE_BUSINESS_SETTINGS: 'manage_business_settings',
  MANAGE_SUBSCRIPTIONS: 'manage_subscriptions',
  MANAGE_DISCOUNTS: 'manage_discounts',
  MANAGE_MEMBERS: 'manage_members',
  VIEW_TRANSACTIONS: 'view_transactions',
  VIEW_BUSINESS_ANALYTICS: 'view_business_analytics',
  MANAGE_BUSINESS_STAFF: 'manage_business_staff',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Define role-based permissions
export const ROLE_PERMISSIONS: RolePermissions = {
  platform_admin: [
    { id: PERMISSIONS.MANAGE_PLATFORM, name: 'Manage Platform', description: 'Full platform management access' },
    { id: PERMISSIONS.MANAGE_BUSINESSES, name: 'Manage Businesses', description: 'Create and manage businesses' },
    { id: PERMISSIONS.MANAGE_ADMINS, name: 'Manage Admins', description: 'Manage platform administrators' },
    { id: PERMISSIONS.VIEW_PLATFORM_ANALYTICS, name: 'View Platform Analytics', description: 'Access platform-wide analytics' },
  ],
  business_admin: [
    { id: PERMISSIONS.MANAGE_BUSINESS_SETTINGS, name: 'Manage Business Settings', description: 'Manage business configuration' },
    { id: PERMISSIONS.MANAGE_SUBSCRIPTIONS, name: 'Manage Subscriptions', description: 'Manage subscription plans' },
    { id: PERMISSIONS.MANAGE_DISCOUNTS, name: 'Manage Discounts', description: 'Manage discounts and promotions' },
    { id: PERMISSIONS.MANAGE_MEMBERS, name: 'Manage Members', description: 'Manage business members' },
    { id: PERMISSIONS.VIEW_TRANSACTIONS, name: 'View Transactions', description: 'View business transactions' },
    { id: PERMISSIONS.VIEW_BUSINESS_ANALYTICS, name: 'View Business Analytics', description: 'Access business analytics' },
    { id: PERMISSIONS.MANAGE_BUSINESS_STAFF, name: 'Manage Staff', description: 'Manage business staff' },
  ],
  business_staff: [
    { id: PERMISSIONS.VIEW_TRANSACTIONS, name: 'View Transactions', description: 'View business transactions' },
    { id: PERMISSIONS.MANAGE_MEMBERS, name: 'Manage Members', description: 'Manage business members' },
  ],
};
