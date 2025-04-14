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

