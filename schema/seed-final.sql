-- ============================================================
-- SEED DATA FINAL - Transaksi & Invoice
-- Jalankan SETELAH: 1) supabase-schema-final.sql, 2) supabase-create-users.sql
-- UUID admin & manager diambil otomatis dari auth.users berdasarkan email
-- ============================================================

DO $$
DECLARE
  v_admin    UUID;
  v_manager  UUID;

  v_cat_penjualan   UUID;
  v_cat_piutang     UUID;
  v_cat_operasional UUID;
  v_cat_bahan_baku  UUID;
  v_cat_tagihan     UUID;
  v_cat_gaji        UUID;
  v_pm_transfer     UUID;
  v_pm_tunai        UUID;

  v_inv1 UUID := gen_random_uuid();
  v_inv2 UUID := gen_random_uuid();
  v_inv3 UUID := gen_random_uuid();
  v_inv4 UUID := gen_random_uuid();
  v_inv5 UUID := gen_random_uuid();
  v_inc1 UUID := gen_random_uuid();
  v_inc2 UUID := gen_random_uuid();
  v_exp1 UUID := gen_random_uuid();
  v_exp2 UUID := gen_random_uuid();

  v_c1 UUID := 'a0000000-0000-4000-8000-000000000001';
  v_c2 UUID := 'a0000000-0000-4000-8000-000000000002';
  v_c3 UUID := 'a0000000-0000-4000-8000-000000000003';
  v_c4 UUID := 'a0000000-0000-4000-8000-000000000004';
  v_c5 UUID := 'a0000000-0000-4000-8000-000000000005';
BEGIN
  -- Ambil UUID dari email (tidak perlu hardcode)
  SELECT id INTO v_admin   FROM auth.users WHERE email = 'admin@admin.com'       LIMIT 1;
  SELECT id INTO v_manager FROM auth.users WHERE email = 'manager@finance.com'  LIMIT 1;

  IF v_admin IS NULL THEN
    RAISE EXCEPTION 'User admin@admin.com tidak ditemukan. Jalankan supabase-create-users.sql terlebih dahulu.';
  END IF;
  IF v_manager IS NULL THEN
    RAISE EXCEPTION 'User manager@finance.com tidak ditemukan. Jalankan supabase-create-users.sql terlebih dahulu.';
  END IF;

  -- Ambil category IDs
  SELECT id INTO v_cat_penjualan   FROM public.categories WHERE name = 'Penjualan Produk'    AND type = 'income'  LIMIT 1;
  SELECT id INTO v_cat_piutang     FROM public.categories WHERE name = 'Piutang Terbayar'    AND type = 'income'  LIMIT 1;
  SELECT id INTO v_cat_operasional FROM public.categories WHERE name = 'Operasional'         AND type = 'expense' LIMIT 1;
  SELECT id INTO v_cat_bahan_baku  FROM public.categories WHERE name = 'Pembelian Bahan Baku' AND type = 'expense' LIMIT 1;
  SELECT id INTO v_cat_tagihan     FROM public.categories WHERE name = 'Tagihan'             AND type = 'expense' LIMIT 1;
  SELECT id INTO v_cat_gaji        FROM public.categories WHERE name = 'Gaji & Upah'         AND type = 'expense' LIMIT 1;

  -- Ambil payment method IDs
  SELECT id INTO v_pm_transfer FROM public.payment_methods WHERE name = 'Transfer Bank' LIMIT 1;
  SELECT id INTO v_pm_tunai    FROM public.payment_methods WHERE name = 'Tunai'         LIMIT 1;

  -- ============================================================
  -- INVOICES
  -- ============================================================
  INSERT INTO public.invoices (
    id, invoice_number, client_id, client_name, client_address, client_phone, client_email,
    invoice_date, due_date, status, subtotal, tax_rate, tax_amount, shipping_cost, grand_total,
    notes, created_by, paid_at
  ) VALUES
    (v_inv1,'INV001',v_c1,'PT Maju Sejahtera',     'Jl. Sudirman No. 12, Jakarta',          '0812-3456-7890','info@majusejahtera.com',
     '2026-01-10','2026-02-10','paid',   50000000,11,5500000, 250000,55750000,'Pembelian meja kantor batch 1', v_admin,  '2026-01-25 10:00:00+07'),
    (v_inv2,'INV002',v_c2,'CV Sentosa Jaya',        'Kawasan Industri Jatake Blok J5',        '021-55667788', 'purchasing@sentosajaya.co.id',
     '2026-01-15','2026-02-15','paid',   25000000,11,2750000, 150000,27900000,'Pengadaan kursi kantor',        v_admin,  '2026-02-10 14:00:00+07'),
    (v_inv3,'INV003',v_c4,'PT Sinar Abadi',         'Gedung Cyber Lt 5, Jl. Kuningan Barat',  '021-88990011', 'finance@sinarabadi.com',
     '2026-02-01','2026-03-01','unpaid', 35000000,11,3850000,      0,38850000,'Proyek desain interior',         v_admin,  NULL),
    (v_inv4,'INV004',v_c1,'PT Maju Sejahtera',      'Jl. Sudirman No. 12, Jakarta',           '0812-3456-7890','info@majusejahtera.com',
     '2026-03-05','2026-04-05','unpaid', 15000000,11,1650000, 100000,16750000,'Meja rapat custom',              v_manager,NULL),
    (v_inv5,'INV005',v_c5,'UD Berkah',              'Jl. Raya Bogor KM 20',                   '0877-1122-3344','udberkah.jaya@yahoo.com',
     '2026-04-10','2026-04-25','overdue', 8000000,11, 880000,  75000, 8955000,'Rak display toko',               v_manager,NULL);

  -- ============================================================
  -- INVOICE ITEMS
  -- ============================================================
  INSERT INTO public.invoice_items (invoice_id, description, quantity, unit, unit_price, total_price) VALUES
    (v_inv1, 'Meja Kantor Executive 160cm',   10, 'Unit',  3500000, 35000000),
    (v_inv1, 'Meja Kantor Staff 120cm',       10, 'Unit',  1500000, 15000000),
    (v_inv2, 'Kursi Kantor Ergonomis',         25, 'Unit',  1000000, 25000000),
    (v_inv3, 'Desain Interior Ruang Meeting',   1, 'Paket',20000000, 20000000),
    (v_inv3, 'Furniture Custom Lobby',          1, 'Paket',15000000, 15000000),
    (v_inv4, 'Meja Rapat Oval 240cm',           2, 'Unit',  5000000, 10000000),
    (v_inv4, 'Kursi Rapat Premium',            10, 'Unit',   500000,  5000000),
    (v_inv5, 'Rak Display Kayu Jati 180cm',     4, 'Unit',  2000000,  8000000);

  -- ============================================================
  -- INCOME — auto dari invoice lunas
  -- ============================================================
  INSERT INTO public.income (id, date, source, category_id, payment_method_id, amount, reference_number, invoice_id, entry_method, status, description, created_by)
  VALUES
    (v_inc1,'2026-01-25','Invoice INV001 - PT Maju Sejahtera',v_cat_piutang,v_pm_transfer,55750000,'INV001',v_inv1,'auto','recorded','Pembayaran invoice INV001',v_admin),
    (v_inc2,'2026-02-10','Invoice INV002 - CV Sentosa Jaya',  v_cat_piutang,v_pm_transfer,27900000,'INV002',v_inv2,'auto','recorded','Pembayaran invoice INV002',v_admin);

  -- INCOME — manual
  INSERT INTO public.income (date, source, category_id, payment_method_id, amount, entry_method, status, description, created_by) VALUES
    ('2026-01-20','Penjualan Langsung - Walk-in Customer', v_cat_penjualan, v_pm_tunai,     3500000,'manual','recorded','Penjualan meja belajar 2 unit',    v_admin),
    ('2026-02-18','Jasa Konsultasi Interior',              v_cat_penjualan, v_pm_transfer,  7500000,'manual','recorded','Konsultasi desain kantor',          v_admin),
    ('2026-03-01','Penjualan Online Marketplace',          v_cat_penjualan, v_pm_transfer, 12000000,'manual','recorded','Penjualan via Tokopedia',           v_admin),
    ('2026-04-05','Penjualan Langsung - Kursi Cafe',       v_cat_penjualan, v_pm_tunai,     4200000,'manual','recorded','Penjualan kursi cafe 6 unit',       v_manager),
    ('2026-04-20','DP Proyek Renovasi Kantor',             v_cat_penjualan, v_pm_transfer, 18000000,'manual','recorded','DP proyek renovasi kantor klien',   v_manager);

  -- ============================================================
  -- EXPENSE
  -- ============================================================
  INSERT INTO public.expense (id, date, expense_type, category_id, payment_method_id, amount, status, description, created_by) VALUES
    (v_exp1,'2026-01-05','Pembelian Bahan Baku Kayu',    v_cat_bahan_baku, v_pm_transfer, 15000000,'recorded','Pembelian kayu jati dan MDF',        v_admin),
    (v_exp2,'2026-01-10','Gaji Karyawan Januari',         v_cat_gaji,       v_pm_transfer, 45000000,'recorded','Gaji 15 karyawan produksi',          v_admin);

  INSERT INTO public.expense (date, expense_type, category_id, payment_method_id, amount, status, description, created_by) VALUES
    ('2026-01-15','Tagihan Listrik & Air Januari',    v_cat_tagihan,    v_pm_transfer,  3500000,'recorded','Tagihan PLN & PDAM Januari',    v_admin),
    ('2026-02-03','Pembelian Bahan Baku Februari',    v_cat_bahan_baku, v_pm_transfer, 18000000,'recorded','Pembelian kayu mahoni dan cat',  v_admin),
    ('2026-02-10','Gaji Karyawan Februari',           v_cat_gaji,       v_pm_transfer, 45000000,'recorded','Gaji 15 karyawan produksi',      v_admin),
    ('2026-02-15','Tagihan Listrik & Air Februari',   v_cat_tagihan,    v_pm_transfer,  3800000,'recorded','Tagihan PLN & PDAM Februari',    v_admin),
    ('2026-02-20','Sewa Gudang Q1',                   v_cat_operasional,v_pm_transfer,  8000000,'recorded','Sewa gudang Tangerang Q1',       v_admin),
    ('2026-03-10','Gaji Karyawan Maret',              v_cat_gaji,       v_pm_transfer, 46000000,'recorded','Gaji + lembur karyawan',          v_admin),
    ('2026-03-15','Tagihan Listrik & Air Maret',      v_cat_tagihan,    v_pm_transfer,  4200000,'recorded','Tagihan PLN & PDAM Maret',       v_manager),
    ('2026-04-01','Maintenance Mesin Produksi',       v_cat_operasional,v_pm_tunai,     5500000,'recorded','Service mesin CNC dan planer',   v_manager),
    ('2026-04-10','Gaji Karyawan April',              v_cat_gaji,       v_pm_transfer, 46000000,'recorded','Gaji + THR karyawan April',       v_manager),
    ('2026-04-15','Tagihan Listrik & Air April',      v_cat_tagihan,    v_pm_transfer,  3900000,'recorded','Tagihan PLN & PDAM April',       v_manager);

  -- ============================================================
  -- EXPENSE ITEMS
  -- ============================================================
  INSERT INTO public.expense_items (expense_id, description, quantity, unit, unit_price, total_price) VALUES
    (v_exp1,'Kayu Jati Grade A', 20,'Batang',500000,10000000),
    (v_exp1,'MDF 18mm',          10,'Lembar', 500000, 5000000);

  RAISE NOTICE '✅ Seed data berhasil! Admin UUID: %, Manager UUID: %', v_admin, v_manager;
END $$;

-- ============================================================
-- VERIFIKASI AKHIR
-- ============================================================
SELECT 'clients'  AS tabel, COUNT(*) AS jumlah FROM public.clients
UNION ALL
SELECT 'invoices',  COUNT(*) FROM public.invoices
UNION ALL
SELECT 'invoice_items', COUNT(*) FROM public.invoice_items
UNION ALL
SELECT 'income',    COUNT(*) FROM public.income
UNION ALL
SELECT 'expense',   COUNT(*) FROM public.expense
UNION ALL
SELECT 'categories',COUNT(*) FROM public.categories
UNION ALL
SELECT 'users',     COUNT(*) FROM public.users;
