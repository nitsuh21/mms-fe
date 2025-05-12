export type PaymentType = 'base' | 'penalty' | 'extra' | 'other' | 'other';

export interface Payment {
  id: number;
  invoice: number;
  amount: number;
  payment_method: 'CA' | 'TB' | 'CB' | 'CP' | 'AG'; // Cash, Telebirr, CBE, Coop, Payment Aggregator
  payment_type: PaymentType;
  reason?: string;
  status: 'P' | 'C' | 'F' | 'R'; // Pending, Completed, Failed, Refunded
  reference_number?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentData {
  invoice: number;
  amount: number;
  payment_method: 'CA' | 'TB' | 'CB' | 'CP' | 'AG';
  payment_type: PaymentType;
  reason?: string;
  reference_number: string;
}

export interface UpdatePaymentData {
  amount?: number;
  payment_method?: 'CA' | 'TB' | 'CB' | 'CP' | 'AG';
  status?: 'P' | 'C' | 'F' | 'R';
  reference_number?: string;
}
