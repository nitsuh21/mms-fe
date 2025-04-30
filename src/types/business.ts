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

    // Media
    logo: string | null;
    logo_url: string | null;
    cover_image: string | null;
    cover_image_url: string | null;

    // Business Hours
    business_hours: Record<string, DaySchedule>;

    // Social Media
    instagram: string | null;
    facebook: string | null;
    twitter: string | null;
    tiktok: string | null;
    youtube: string | null;
    whatsapp: string | null;
    telegram: string | null;

    // Visibility Settings
    category: string;
    is_visible_in_search: boolean;
    short_description: string;
    website_url?: string;
    instagram_url?: string;

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
    contact_email: string;
    contact_phone?: string;
    address?: string;
    timezone?: string;
    currency?: string;

    // Visibility Settings
    logo?: string;
    category?: string;
    is_visible_in_search?: boolean;
    short_description?: string;
    website_url?: string;
    instagram_url?: string;
}

export interface UpdateBusinessData extends Partial<CreateBusinessData> {
    is_active?: boolean;
}
