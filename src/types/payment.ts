export interface Payment {
  id: number;
  invoice: number;
  amount: number;
  payment_method: 'CA' | 'TB' | 'CB' | 'CP' | 'AG'; // Cash, Telebirr, CBE, Coop, Payment Aggregator
  status: 'P' | 'C' | 'F' | 'R'; // Pending, Completed, Failed, Refunded
  reference_number?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentData {
  invoice: number;
  amount: number;
  payment_method: 'CA' | 'TB' | 'CB' | 'CP' | 'AG';
  reference_number?: string;
}

export interface UpdatePaymentData {
  amount?: number;
  payment_method?: 'CA' | 'TB' | 'CB' | 'CP' | 'AG';
  status?: 'P' | 'C' | 'F' | 'R';
  reference_number?: string;
}
