export interface DaySchedule {
  open: string;
  close: string;
}

export interface BusinessHours {
  open: string;
  close: string;
}

export interface Business {
    // Business Info
    id: string;
    name: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    timezone: string;
    currency: string;

    // Media
    logo: string | null;
    logo_url: string | null;
    cover_image: string | null;
    cover_image_url: string | null;

    // Business Hours
    business_hours: Record<string, DaySchedule>;

    // Notification Settings
    notify_new_members: boolean;
    notify_expiring_subscriptions: boolean;
    notify_failed_payments: boolean;
    email_notifications: boolean;
    sms_notifications: boolean;

    // Payment Settings
    allow_auto_renew: boolean;
    grace_period_days: number;
    send_payment_reminders: boolean;
    reminder_days_before: number;
    allow_partial_payments: boolean;

    // Social Media
    website: string | null;
    instagram: string | null;
    facebook: string | null;
    twitter: string | null;
    tiktok: string | null;
    youtube: string | null;
    whatsapp: string | null;
    telegram: string | null;

    // Visibility Settings
    category: string;
    subcategory: string;
    is_visible_in_search: boolean;

    // Status and Relations
    merchant: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateBusinessData {
    // Business Info
    name: string;
    description?: string;
    email: string;
    phone?: string;
    address?: string;
    timezone?: string;
    currency?: string;

    // Visibility Settings
    logo?: string;
    category?: string;
    subcategory?: string;
    is_visible_in_search?: boolean;
    short_description?: string;
    website?: string;
    instagram?: string;
}

export interface UpdateBusinessData extends Partial<CreateBusinessData> {
    is_active?: boolean;
}
