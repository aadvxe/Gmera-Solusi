-- ============================================================
-- BUAT USER TEST LANGSUNG VIA SQL (tanpa UI Supabase)
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Fungsi helper untuk membuat user di auth.users
-- Password di-hash menggunakan bcrypt (password: "Admin1234!")
-- Semua user pakai format password yang sama agar mudah diingat

-- Aktifkan pgcrypto (jika belum aktif)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Buat 5 user sekaligus
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  aud,
  created_at,
  updated_at
)
VALUES
  -- 1. Super Admin
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@admin.com',
    crypt('Admin1234!', gen_salt('bf')),
    now(),
    '{"name": "Ahmad Fauzi", "role": "super_admin"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now()
  ),
  -- 2. Finance Manager
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'manager@finance.com',
    crypt('Manager1234!', gen_salt('bf')),
    now(),
    '{"name": "Sari Dewi", "role": "finance_manager"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now()
  ),
  -- 3. Accounting Staff
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'staff@accounting.com',
    crypt('Accounting1234!', gen_salt('bf')),
    now(),
    '{"name": "Budi Santoso", "role": "accounting_staff"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now()
  ),
  -- 4. Sales Staff
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'staff@sales.com',
    crypt('Sales1234!', gen_salt('bf')),
    now(),
    '{"name": "Rina Melati", "role": "sales_staff"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now()
  ),
  -- 5. Viewer
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'viewer@company.com',
    crypt('Viewer1234!', gen_salt('bf')),
    now(),
    '{"name": "Dani Kurniawan", "role": "viewer"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now()
  );

-- ============================================================
-- VERIFIKASI: Cek user berhasil dibuat
-- ============================================================
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.name,
  p.role,
  p.is_active
FROM auth.users u
LEFT JOIN public.users p ON p.id = u.id
WHERE u.email IN (
  'admin@admin.com',
  'manager@finance.com', 
  'staff@accounting.com',
  'staff@sales.com',
  'viewer@company.com'
)
ORDER BY u.created_at;
