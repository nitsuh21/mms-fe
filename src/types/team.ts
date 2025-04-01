export type TeamMember = {
  id: number;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  role: 'owner' | 'manager' | 'staff';
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Business = {
  id: number;
  name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  logo: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  members: TeamMember[];
};