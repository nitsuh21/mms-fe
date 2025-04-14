export interface Business {
    address: string;
    contact_email: string;
    id: string;
    name: string;
    owner: string;
    location: string;
    status: 'active' | 'inactive';
    memberCount: number;
    revenue: string;
}

export interface CreateBusinessData {
    name: string;
    owner: string;
    location: string;
    status: 'active' | 'inactive';
    memberCount: number;
    revenue: string;
}

export interface UpdateBusinessData extends Partial<CreateBusinessData> {
    status?: 'active' | 'inactive';
}
