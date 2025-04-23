export interface Business {
    // Business Info
    id: string;
    name: string;
    description: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    timezone: string;
    currency: string;

    // Visibility Settings
    logo: string;
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
