import { Customer } from './customer';
import { Plan } from './plan';

export interface Subscription {
  id: number;
  business: number;
  customer: Customer;
  plan: Plan;
  status: 'AC' | 'PN' | 'PD' | 'CN' | 'TR' | 'EX';
  start_date: string;
  end_date: string;
  trial_end: string | null;
  next_billing_date: string;
  cancelled_at: string | null;
  cancellation_reason: string;
  billing_cycle: number;
  last_billing_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionStatus {
  id: number;
  status: string;
  is_trial_active: boolean;
  is_expired: boolean;
  is_overdue: boolean;
  trial_end: string | null;
  end_date: string;
  next_billing_date: string;
  billing_cycle: number;
  cancelled_at: string | null;
  cancellation_reason: string;
}
