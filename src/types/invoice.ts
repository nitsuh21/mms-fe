export interface Invoice {
  id: number;
  invoice_number: string;
  subscription: {
    id: number;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  customer_name: string;
  customer_email: string;
  amount: number;
  payment_method: 'CA' | 'TB' | 'CB' | 'CP' | 'AG' | 'CBE' | 'BOA' | 'AW' | 'OT';
  status: 'P' | 'C' | 'O' | 'PA';
  due_date: string;
  paid_date?: string;
  reference_number?: string;
  total_paid: number;
  remaining_balance: number;
  created_at: string;
  updated_at: string;
  payments?: Payment[];
}

export interface Payment {
  id: number;
  invoice: number;
  amount: number;
  payment_method: 'CA' | 'TB' | 'CB' | 'CP' | 'AG' | 'CBE' | 'BOA' | 'AW' | 'OT';
  payment_type: 'base' | 'penalty' | 'extra' | 'other';
  reason: string;
  status: 'P' | 'C' | 'F' | 'R';
  reference_number?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceData {
  subscription: number;
  amount: number;
  payment_method: 'CA' | 'TB' | 'CB' | 'CP' | 'AG' | 'CBE' | 'BOA' | 'AW' | 'OT';
  due_date?: string;
}

export interface UpdateInvoiceData {
  amount?: number;
  payment_method?: 'MT' | 'CA' | 'TB' | 'CB' | 'CP' | 'AG';
  due_date?: string;
  status?: 'P' | 'C' | 'O' | 'PA';
}

export interface CreatePaymentData {
  
  invoice: number;
  amount: number;
  payment_method: 'CA' | 'TB' | 'CB' | 'CP' | 'AG';
  reference_number: string;
  payment_type: 'base' | 'penalty' | 'extra' | 'other';
  reason?: string;
}

export interface UpdatePaymentData {
  amount?: number;
  payment_method?: 'CA' | 'TB' | 'CB' | 'CP' | 'AG';
  payment_type?: 'base' | 'penalty' | 'extra' | 'other';
  reason?: string;
  status?: 'P' | 'C' | 'F' | 'R';
  reference_number?: string;
}
