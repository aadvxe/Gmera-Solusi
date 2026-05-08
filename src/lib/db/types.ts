/**
 * Shared TypeScript types for the Gmera Solusi database schema.
 */

export type Client = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  npwp: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  // Computed via JOIN
  total_invoices?: number;
  unpaid_amount?: number;
};

export type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  description: string | null;
  is_active: boolean;
  order_index?: number;
};

export type PaymentMethod = {
  id: string;
  name: string;
  is_active: boolean;
};

export type Invoice = {
  id: string;
  invoice_number: string;
  client_id: string | null;
  client_name: string;
  client_address: string | null;
  client_phone: string | null;
  client_email: string | null;
  invoice_date: string;
  due_date: string;
  status: 'unpaid' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  shipping_cost: number;
  shipping_method: string | null;
  tracking_number: string | null;
  discount_amount: number;
  grand_total: number;
  notes: string | null;
  attachment_url?: string | null;
  created_by: string | null;
  created_at: string;
  paid_at?: string | null;
  invoice_items?: InvoiceItem[];
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
};

export type Income = {
  id: string;
  date: string;
  source: string;
  category_id: string | null;
  payment_method_id: string | null;
  amount: number;
  reference_number: string | null;
  invoice_id: string | null;
  entry_method: 'manual' | 'auto';
  status: string;
  description: string | null;
  attachment_url?: string | null;
  created_by: string | null;
  created_at: string;
  // Joined
  categories?: { name: string } | null;
  payment_methods?: { name: string } | null;
};

export type Expense = {
  id: string;
  date: string;
  expense_type: string;
  category_id: string | null;
  payment_method_id: string | null;
  amount: number;
  reference_number: string | null;
  status: string;
  description: string | null;
  attachment_url?: string | null;
  created_by: string | null;
  created_at: string;
  // Joined
  categories?: { name: string } | null;
  payment_methods?: { name: string } | null;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  department: string | null;
  avatar_url: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
};

export type CompanyProfile = {
  id: string;
  company_name: string;
  address: string;
  phone: string;
  email: string;
  npwp: string | null;
  logo_url: string | null;
  website: string | null;
  bank_name: string | null;
  bank_account: string | null;
  bank_account_name: string | null;
  tax_rate: number;
};
