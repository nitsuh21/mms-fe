import { Customer } from './customer';
import { Plan } from './plan';

export interface Subscription {
  id: number;
  customer: Customer;
  plan: Plan;
  status: 'active' | 'inactive' | 'expired';
  start_date: string;
  end_date: string;
  next_payment_date: string | null;
  payment_method: string;
  amount: number;
  created_at: string;
  updated_at: string;
}
