-- ============================================================
-- PT GMERA SOLUSI - FINAL DATABASE SCHEMA v1.0
-- Jalankan SELURUH script ini di Supabase SQL Editor
-- ============================================================

-- ENUM TYPES
CREATE TYPE user_role AS ENUM ('super_admin', 'finance_manager', 'accounting_staff', 'sales_staff', 'viewer');
CREATE TYPE category_type AS ENUM ('income', 'expense');
CREATE TYPE invoice_status AS ENUM ('unpaid', 'paid', 'overdue', 'cancelled');
CREATE TYPE entry_method AS ENUM ('manual', 'auto');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'view', 'export', 'login', 'logout');

-- USERS (profile, linked to Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  phone VARCHAR(20),
  department VARCHAR(100),
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CLIENTS
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  npwp VARCHAR(50),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CATEGORIES
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type category_type NOT NULL,
  description VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PAYMENT METHODS
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- COMPANY PROFILE (singleton)
CREATE TABLE public.company_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  npwp VARCHAR(50),
  logo_url VARCHAR(500),
  website VARCHAR(255),
  bank_name VARCHAR(100),
  bank_account VARCHAR(100),
  bank_account_name VARCHAR(100),
  tax_rate DECIMAL(5,2) DEFAULT 11.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- INVOICES
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(20) UNIQUE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name VARCHAR(200) NOT NULL,
  client_address TEXT,
  client_phone VARCHAR(20),
  client_email VARCHAR(255),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status invoice_status DEFAULT 'unpaid',
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 11.00,
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(15,2) DEFAULT 0,
  shipping_method VARCHAR(50),
  tracking_number VARCHAR(100),
  shipping_address TEXT,
  estimated_arrival DATE,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  grand_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  notes TEXT,
  attachment_url VARCHAR(500),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- INVOICE ITEMS
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description VARCHAR(500) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) DEFAULT 'Pcs',
  unit_price DECIMAL(15,2) NOT NULL,
  total_price DECIMAL(15,2) NOT NULL
);

-- INCOME
CREATE TABLE public.income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  source VARCHAR(200) NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  reference_number VARCHAR(50),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  entry_method entry_method DEFAULT 'manual',
  status VARCHAR(20) DEFAULT 'recorded',
  description TEXT,
  attachment_url VARCHAR(500),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- INCOME ITEMS
CREATE TABLE public.income_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  income_id UUID NOT NULL REFERENCES public.income(id) ON DELETE CASCADE,
  description VARCHAR(500) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) DEFAULT 'Unit',
  unit_price DECIMAL(15,2) NOT NULL,
  total_price DECIMAL(15,2) NOT NULL
);

-- EXPENSE
CREATE TABLE public.expense (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  expense_type VARCHAR(200) NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  reference_number VARCHAR(50),
  status VARCHAR(20) DEFAULT 'recorded',
  description TEXT,
  attachment_url VARCHAR(500),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- EXPENSE ITEMS
CREATE TABLE public.expense_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES public.expense(id) ON DELETE CASCADE,
  description VARCHAR(500) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) DEFAULT 'Pcs',
  unit_price DECIMAL(15,2) NOT NULL,
  total_price DECIMAL(15,2) NOT NULL
);

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- COURIERS
CREATE TABLE public.couriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL,
  estimated_days VARCHAR(20),
  is_active BOOLEAN DEFAULT true
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_income_date ON public.income(date);
CREATE INDEX idx_income_category ON public.income(category_id);
CREATE INDEX idx_expense_date ON public.expense(date);
CREATE INDEX idx_expense_category ON public.expense(category_id);
CREATE INDEX idx_invoices_client ON public.invoices(client_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_date ON public.invoices(invoice_date);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;

-- SELECT: semua user autentikasi bisa baca
CREATE POLICY "auth_select" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON public.payment_methods FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON public.company_profile FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON public.invoice_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON public.income FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON public.income_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON public.expense FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON public.expense_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON public.couriers FOR SELECT TO authenticated USING (true);

-- INSERT
CREATE POLICY "auth_insert" ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert" ON public.invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert" ON public.invoice_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert" ON public.income FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert" ON public.income_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert" ON public.expense FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert" ON public.expense_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- UPDATE
CREATE POLICY "auth_update" ON public.clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_update" ON public.invoices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_update" ON public.income FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_update" ON public.expense FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_update" ON public.company_profile FOR UPDATE TO authenticated USING (true);
CREATE POLICY "own_update" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);

-- DELETE
CREATE POLICY "auth_delete" ON public.clients FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON public.invoices FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON public.invoice_items FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON public.income FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON public.income_items FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON public.expense FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete" ON public.expense_items FOR DELETE TO authenticated USING (true);

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_upd BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_clients_upd BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_invoices_upd BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_income_upd BEFORE UPDATE ON public.income FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_expense_upd BEFORE UPDATE ON public.expense FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_company_upd BEFORE UPDATE ON public.company_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create user profile on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, phone, department)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE NEW.raw_user_meta_data->>'role'
      WHEN 'super_admin'       THEN 'super_admin'::user_role
      WHEN 'finance_manager'   THEN 'finance_manager'::user_role
      WHEN 'accounting_staff'  THEN 'accounting_staff'::user_role
      WHEN 'sales_staff'       THEN 'sales_staff'::user_role
      WHEN 'viewer'            THEN 'viewer'::user_role
      ELSE 'viewer'::user_role
    END,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'department'
  )
  ON CONFLICT (id) DO UPDATE SET
    name  = EXCLUDED.name,
    email = EXCLUDED.email,
    role  = EXCLUDED.role;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Jangan pernah gagalkan pembuatan user Auth karena masalah profile
  RAISE WARNING 'handle_new_user error (non-fatal): %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SEED DATA (Static Reference Data)
-- ============================================================

-- Categories Income
INSERT INTO public.categories (name, type, description) VALUES
  ('Penjualan Produk', 'income', 'Pendapatan dari penjualan produk'),
  ('Penjualan Jasa', 'income', 'Pendapatan dari penjualan jasa'),
  ('Piutang Terbayar', 'income', 'Pembayaran piutang dari klien'),
  ('Jasa Konsultasi', 'income', 'Pendapatan dari jasa konsultasi'),
  ('Pendapatan Proyek', 'income', 'Pendapatan dari proyek khusus'),
  ('Pengembalian Dana', 'income', 'Refund atau pengembalian dana'),
  ('Lain-lain', 'income', 'Pendapatan lainnya');

-- Categories Expense
INSERT INTO public.categories (name, type, description) VALUES
  ('Operasional', 'expense', 'Biaya operasional kantor'),
  ('Pembelian Bahan Baku', 'expense', 'Pembelian bahan baku produksi'),
  ('Tagihan', 'expense', 'Tagihan listrik, air, internet'),
  ('Gaji & Upah', 'expense', 'Gaji dan tunjangan karyawan'),
  ('Pemasaran', 'expense', 'Biaya pemasaran dan iklan'),
  ('Transportasi', 'expense', 'Biaya transportasi dan pengiriman'),
  ('Pembelian Aset', 'expense', 'Pembelian aset tetap'),
  ('Lain-lain', 'expense', 'Pengeluaran lainnya');

-- Payment Methods
INSERT INTO public.payment_methods (name) VALUES
  ('Transfer Bank'),
  ('Tunai'),
  ('Check/Giro'),
  ('QRIS'),
  ('Kartu Kredit');

-- Company Profile
INSERT INTO public.company_profile (company_name, address, phone, email, npwp, website, bank_name, bank_account, bank_account_name, tax_rate) VALUES
  ('PT GMera Solusi', 'Gedung G-Tower Lt 12, Jl. Jend. Sudirman Kav 21, Jakarta Selatan, 12920', '021-12345678', 'finance@gmerasolusi.com', '01.234.567.8-901.000', 'www.gmerasolusi.com', 'Bank BCA', '1234567890', 'PT GMera Solusi', 11.00);

-- Couriers
INSERT INTO public.couriers (code, name, type, estimated_days) VALUES
  ('jne_reg', 'JNE Regular', 'Darat', '3-5 hari'),
  ('jne_yes', 'JNE YES', 'Express', '1-2 hari'),
  ('tiki_reg', 'TIKI Regular', 'Darat', '3-5 hari'),
  ('pos_reg', 'POS Indonesia', 'Darat', '5-7 hari'),
  ('gosend', 'GoSend', 'Same-day', 'Same-day'),
  ('grab_express', 'GrabExpress', 'Same-day', 'Same-day'),
  ('custom', 'Lainnya', 'Custom', 'Manual input');

-- Clients
INSERT INTO public.clients (id, name, address, city, province, postal_code, phone, email, npwp, notes) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'PT Maju Sejahtera', 'Jl. Sudirman No. 12', 'Jakarta Pusat', 'DKI Jakarta', '10220', '0812-3456-7890', 'info@majusejahtera.com', '01.234.567.8-901.000', 'Klien VIP, respon cepat'),
  ('a0000000-0000-4000-8000-000000000002', 'CV Sentosa Jaya', 'Kawasan Industri Jatake Blok J5', 'Tangerang', 'Banten', '15135', '021-55667788', 'purchasing@sentosajaya.co.id', '02.345.678.9-012.000', NULL),
  ('a0000000-0000-4000-8000-000000000003', 'Toko Makmur', 'Ps. Baru Blok A/4', 'Jakarta Pusat', 'DKI Jakarta', '10710', '0856-7890-1234', 'toko.makmur@gmail.com', NULL, NULL),
  ('a0000000-0000-4000-8000-000000000004', 'PT Sinar Abadi', 'Gedung Cyber Lt 5, Jl. Kuningan Barat', 'Jakarta Selatan', 'DKI Jakarta', '12710', '021-88990011', 'finance@sinarabadi.com', '03.456.789.0-123.000', 'Transfer BCA'),
  ('a0000000-0000-4000-8000-000000000005', 'UD Berkah', 'Jl. Raya Bogor KM 20', 'Depok', 'Jawa Barat', '16415', '0877-1122-3344', 'udberkah.jaya@yahoo.com', NULL, NULL);
