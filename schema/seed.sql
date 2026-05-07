-- ============================================================
-- SEED DATA PART 2: Transactions & Invoices
-- Run AFTER creating auth users and running supabase-schema.sql
-- ============================================================

-- NOTE: Replace the user IDs below with actual auth.users IDs
-- after creating the 5 test users via Supabase Auth Dashboard.
-- For now we use placeholder UUIDs that will be updated.

-- We'll use a DO block to grab the first user as created_by
DO $$
DECLARE
  v_admin_id UUID;
  v_cat_penjualan UUID;
  v_cat_piutang UUID;
  v_cat_operasional UUID;
  v_cat_pembelian UUID;
  v_cat_tagihan UUID;
  v_cat_gaji UUID;
  v_pm_transfer UUID;
  v_pm_tunai UUID;
  v_client1 UUID := 'a1b2c3d4-0001-4000-8000-000000000001';
  v_client2 UUID := 'a1b2c3d4-0001-4000-8000-000000000002';
  v_client3 UUID := 'a1b2c3d4-0001-4000-8000-000000000003';
  v_client4 UUID := 'a1b2c3d4-0001-4000-8000-000000000004';
  v_inv1 UUID;
  v_inv2 UUID;
  v_inv3 UUID;
  v_inv4 UUID;
  v_inv5 UUID;
  v_inc1 UUID;
  v_inc2 UUID;
  v_inc3 UUID;
  v_exp1 UUID;
  v_exp2 UUID;
  v_exp3 UUID;
BEGIN
  -- Get first admin user
  SELECT id INTO v_admin_id FROM public.users WHERE role = 'super_admin' LIMIT 1;
  IF v_admin_id IS NULL THEN
    SELECT id INTO v_admin_id FROM public.users LIMIT 1;
  END IF;

  -- Get category IDs
  SELECT id INTO v_cat_penjualan FROM public.categories WHERE name = 'Penjualan' AND type = 'income' LIMIT 1;
  SELECT id INTO v_cat_piutang FROM public.categories WHERE name = 'Piutang' AND type = 'income' LIMIT 1;
  SELECT id INTO v_cat_operasional FROM public.categories WHERE name = 'Operasional' AND type = 'expense' LIMIT 1;
  SELECT id INTO v_cat_pembelian FROM public.categories WHERE name = 'Pembelian' AND type = 'expense' LIMIT 1;
  SELECT id INTO v_cat_tagihan FROM public.categories WHERE name = 'Tagihan' AND type = 'expense' LIMIT 1;
  SELECT id INTO v_cat_gaji FROM public.categories WHERE name = 'Gaji' AND type = 'expense' LIMIT 1;

  -- Get payment method IDs
  SELECT id INTO v_pm_transfer FROM public.payment_methods WHERE name = 'Transfer Bank' LIMIT 1;
  SELECT id INTO v_pm_tunai FROM public.payment_methods WHERE name = 'Tunai' LIMIT 1;

  -- INVOICES
  v_inv1 := gen_random_uuid();
  v_inv2 := gen_random_uuid();
  v_inv3 := gen_random_uuid();
  v_inv4 := gen_random_uuid();
  v_inv5 := gen_random_uuid();

  INSERT INTO public.invoices (id, invoice_number, client_id, client_name, client_address, client_phone, client_email, invoice_date, due_date, status, subtotal, tax_rate, tax_amount, shipping_cost, grand_total, notes, created_by) VALUES
    (v_inv1, 'INV001', v_client1, 'PT Maju Sejahtera', 'Jl. Sudirman No. 12, Jakarta', '0812-3456-7890', 'info@majusejahtera.com', '2026-01-10', '2026-02-10', 'paid', 50000000, 11, 5500000, 250000, 55750000, 'Pembelian meja kantor batch 1', v_admin_id),
    (v_inv2, 'INV002', v_client2, 'CV Sentosa Jaya', 'Kawasan Industri Jatake', '021-55667788', 'purchasing@sentosajaya.co.id', '2026-01-15', '2026-02-15', 'paid', 25000000, 11, 2750000, 150000, 27900000, 'Pengadaan kursi kantor', v_admin_id),
    (v_inv3, 'INV003', v_client4, 'PT Sinar Abadi', 'Gedung Cyber Lt 5', '021-88990011', 'finance@sinarabadi.com', '2026-02-01', '2026-03-01', 'unpaid', 35000000, 11, 3850000, 0, 38850000, 'Proyek desain interior', v_admin_id),
    (v_inv4, 'INV004', v_client1, 'PT Maju Sejahtera', 'Jl. Sudirman No. 12, Jakarta', '0812-3456-7890', 'info@majusejahtera.com', '2026-03-05', '2026-04-05', 'unpaid', 15000000, 11, 1650000, 100000, 16750000, 'Meja rapat custom', v_admin_id),
    (v_inv5, 'INV005', v_client3, 'Toko Makmur', 'Ps. Baru Blok A/4', '0856-7890-1234', 'toko.makmur@gmail.com', '2026-04-10', '2026-05-10', 'unpaid', 8000000, 11, 880000, 75000, 8955000, 'Rak display toko', v_admin_id);

  -- Update paid_at for paid invoices
  UPDATE public.invoices SET paid_at = '2026-01-25' WHERE id = v_inv1;
  UPDATE public.invoices SET paid_at = '2026-02-10' WHERE id = v_inv2;

  -- INVOICE ITEMS
  INSERT INTO public.invoice_items (invoice_id, description, quantity, unit, unit_price, total_price) VALUES
    (v_inv1, 'Meja Kantor Executive 160cm', 10, 'Unit', 3500000, 35000000),
    (v_inv1, 'Meja Kantor Staff 120cm', 10, 'Unit', 1500000, 15000000),
    (v_inv2, 'Kursi Kantor Ergonomis', 25, 'Unit', 1000000, 25000000),
    (v_inv3, 'Desain Interior Ruang Meeting', 1, 'Paket', 20000000, 20000000),
    (v_inv3, 'Furniture Custom Lobby', 1, 'Paket', 15000000, 15000000),
    (v_inv4, 'Meja Rapat Oval 240cm', 2, 'Unit', 5000000, 10000000),
    (v_inv4, 'Kursi Rapat Premium', 10, 'Unit', 500000, 5000000),
    (v_inv5, 'Rak Display Kayu Jati 180cm', 4, 'Unit', 2000000, 8000000);

  -- INCOME (mix of auto from invoice + manual)
  v_inc1 := gen_random_uuid();
  v_inc2 := gen_random_uuid();
  v_inc3 := gen_random_uuid();

  INSERT INTO public.income (id, date, source, category_id, payment_method_id, amount, reference_number, invoice_id, entry_method, description, created_by) VALUES
    (v_inc1, '2026-01-25', 'Invoice INV001 - PT Maju Sejahtera', v_cat_piutang, v_pm_transfer, 55750000, 'INV001', v_inv1, 'auto', 'Pembayaran invoice INV001', v_admin_id),
    (v_inc2, '2026-02-10', 'Invoice INV002 - CV Sentosa Jaya', v_cat_piutang, v_pm_transfer, 27900000, 'INV002', v_inv2, 'auto', 'Pembayaran invoice INV002', v_admin_id),
    (v_inc3, '2026-03-15', 'Penjualan Langsung - Toko Makmur', v_cat_penjualan, v_pm_tunai, 5000000, NULL, NULL, 'manual', 'Penjualan rak kecil langsung di showroom', v_admin_id);

  -- Additional manual income
  INSERT INTO public.income (date, source, category_id, payment_method_id, amount, entry_method, description, created_by) VALUES
    ('2026-01-20', 'Penjualan Produk - Walk-in Customer', v_cat_penjualan, v_pm_tunai, 3500000, 'manual', 'Penjualan meja belajar 2 unit', v_admin_id),
    ('2026-02-18', 'Jasa Konsultasi Interior', v_cat_penjualan, v_pm_transfer, 7500000, 'manual', 'Konsultasi desain kantor', v_admin_id),
    ('2026-03-01', 'Penjualan Online Marketplace', v_cat_penjualan, v_pm_transfer, 12000000, 'manual', 'Penjualan via Tokopedia', v_admin_id),
    ('2026-04-05', 'Penjualan Langsung', v_cat_penjualan, v_pm_tunai, 4200000, 'manual', 'Penjualan kursi cafe 6 unit', v_admin_id),
    ('2026-04-20', 'Pendapatan Proyek Renovasi', v_cat_penjualan, v_pm_transfer, 18000000, 'manual', 'DP proyek renovasi kantor', v_admin_id);

  -- INCOME ITEMS for manual income
  INSERT INTO public.income_items (income_id, description, quantity, unit, unit_price, total_price) VALUES
    (v_inc3, 'Rak Kayu Kecil 90cm', 2, 'Unit', 2500000, 5000000);

  -- EXPENSES
  v_exp1 := gen_random_uuid();
  v_exp2 := gen_random_uuid();
  v_exp3 := gen_random_uuid();

  INSERT INTO public.expense (id, date, expense_type, category_id, payment_method_id, amount, description, created_by) VALUES
    (v_exp1, '2026-01-05', 'Pembelian Bahan Baku', v_cat_pembelian, v_pm_transfer, 15000000, 'Pembelian kayu jati dan MDF', v_admin_id),
    (v_exp2, '2026-01-10', 'Gaji Karyawan Januari', v_cat_gaji, v_pm_transfer, 45000000, 'Gaji 15 karyawan produksi', v_admin_id),
    (v_exp3, '2026-01-15', 'Listrik & Air', v_cat_tagihan, v_pm_transfer, 3500000, 'Tagihan PLN & PDAM Januari', v_admin_id);

  -- Additional expenses across months
  INSERT INTO public.expense (date, expense_type, category_id, payment_method_id, amount, description, created_by) VALUES
    ('2026-02-03', 'Pembelian Bahan Baku', v_cat_pembelian, v_pm_transfer, 18000000, 'Pembelian kayu mahoni dan cat', v_admin_id),
    ('2026-02-10', 'Gaji Karyawan Februari', v_cat_gaji, v_pm_transfer, 45000000, 'Gaji 15 karyawan produksi', v_admin_id),
    ('2026-02-15', 'Listrik & Air', v_cat_tagihan, v_pm_transfer, 3800000, 'Tagihan PLN & PDAM Februari', v_admin_id),
    ('2026-02-20', 'Sewa Gudang', v_cat_operasional, v_pm_transfer, 8000000, 'Sewa gudang Tangerang Q1', v_admin_id),
    ('2026-03-05', 'Pembelian Bahan Baku', v_cat_pembelian, v_pm_transfer, 12000000, 'Pembelian triplek dan hardware', v_admin_id),
    ('2026-03-10', 'Gaji Karyawan Maret', v_cat_gaji, v_pm_transfer, 46000000, 'Gaji + lembur karyawan', v_admin_id),
    ('2026-03-15', 'Listrik & Air', v_cat_tagihan, v_pm_transfer, 4200000, 'Tagihan PLN & PDAM Maret', v_admin_id),
    ('2026-04-01', 'Maintenance Mesin', v_cat_operasional, v_pm_tunai, 5500000, 'Service mesin CNC dan planer', v_admin_id),
    ('2026-04-10', 'Gaji Karyawan April', v_cat_gaji, v_pm_transfer, 46000000, 'Gaji + THR karyawan', v_admin_id),
    ('2026-04-15', 'Listrik & Air', v_cat_tagihan, v_pm_transfer, 3900000, 'Tagihan PLN & PDAM April', v_admin_id);

  -- EXPENSE ITEMS
  INSERT INTO public.expense_items (expense_id, description, quantity, unit, unit_price, total_price) VALUES
    (v_exp1, 'Kayu Jati Grade A', 20, 'Batang', 500000, 10000000),
    (v_exp1, 'MDF 18mm', 10, 'Lembar', 500000, 5000000);

  RAISE NOTICE 'Seed data inserted successfully!';
END $$;
