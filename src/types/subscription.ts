import { Customer } from './customer';
import { Plan } from './plan';

export interface Subscription {
  id: number;
  customer: Customer;
  plan: Plan;
  status: 'AC' | 'PN' | 'PD' | 'CN' | 'TR' | 'EX';
  start_date: string;
  end_date: string;
  next_payment_date: string | null;
  payment_method: string;
  amount: number;
  created_at: string;
  updated_at: string;
}
