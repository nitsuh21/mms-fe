export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_months: number;
  features: string[];
  created_at: string;
  updated_at: string;
}
