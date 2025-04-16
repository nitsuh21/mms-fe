export interface Plan {
  id: number;
  business: number;
  name: string;
  description: string;
  price: number;
  discounted_price: number;
  currency: string;
  interval: 'D' | 'W' | 'M' | 'Y';
  trial_days: number;
  has_trial: boolean;
  is_discounted: boolean;
  features: Record<string, boolean>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
