export interface Invoice {
  id: number;
  subscription: {
    id: number;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  amount: number;
  payment_method: 'MT' | 'CA' | 'TB' | 'CB' | 'CP' | 'AG';
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
  payment_method: 'CA' | 'TB' | 'CB' | 'CP' | 'AG';
  status: 'P' | 'C' | 'F' | 'R';
  reference_number?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceData {
  subscription: number;
  amount: number;
  payment_method: 'MT' | 'CA' | 'TB' | 'CB' | 'CP' | 'AG';
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
  reference_number?: string;
}

export interface UpdatePaymentData {
  amount?: number;
  payment_method?: 'CA' | 'TB' | 'CB' | 'CP' | 'AG';
  status?: 'P' | 'C' | 'F' | 'R';
  reference_number?: string;
}
