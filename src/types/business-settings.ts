// types/business-settings.ts
export interface BusinessSettingsForm {
  // Business Info
  name: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
  currency: string;
  category: string;
  subcategory: string;
  isVisibleInSearch: boolean;
  shortDescription: string;
  website: string;
  instagram: string;
  facebook: string;
  twitter: string;
  tiktok: string;
  youtube: string;
  whatsapp: string;
  telegram: string;
  coverImage: File | null;
  logo: File | null;
  currentCoverImage: string;
  currentLogo: string;


  // Notifications
  notifyNewMembers: boolean;
  notifyExpiringSubscriptions: boolean;
  notifyFailedPayments: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  // Billing
  allowAutoRenew: boolean;
  gracePeriodDays: number;
  sendPaymentReminders: boolean;
  reminderDaysBefore: number;
  allowPartialPayments: boolean;
}