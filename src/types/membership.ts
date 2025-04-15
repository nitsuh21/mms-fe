import { Business } from './business';
import { Customer } from './customer';
import { User } from './user';

export interface MembershipRequest {
  id: number;
  business: Business;
  business_name: string;
  user: User | null;
  user_email: string | null;
  customer: Customer;
  customer_email: string;
  type: 'MEMBER' | 'SYNC';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  updated_at: string;
}
