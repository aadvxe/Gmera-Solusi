-- ============================================================
-- SECURITY HARDENING: ROLE-BASED ACCESS CONTROL (RLS) POLICIES
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Helper function to check authenticated user role securely
CREATE OR REPLACE FUNCTION public.check_user_role(required_roles user_role[])
RETURNS BOOLEAN AS $$
DECLARE
  current_user_role user_role;
BEGIN
  -- Fetch the role of the authenticated user
  SELECT role INTO current_user_role FROM public.users WHERE id = auth.uid();
  RETURN current_user_role = ANY(required_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. USERS
DROP POLICY IF EXISTS "Authenticated read all" ON public.users;
DROP POLICY IF EXISTS "Authenticated update" ON public.users;

CREATE POLICY "Users select policy" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update policy" ON public.users FOR UPDATE TO authenticated 
  USING (auth.uid() = id OR public.check_user_role(ARRAY['super_admin']::user_role[]));


-- 3. CLIENTS
DROP POLICY IF EXISTS "Authenticated read all" ON public.clients;
DROP POLICY IF EXISTS "Authenticated insert" ON public.clients;
DROP POLICY IF EXISTS "Authenticated update" ON public.clients;
DROP POLICY IF EXISTS "Authenticated delete" ON public.clients;

CREATE POLICY "Clients select policy" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Clients insert policy" ON public.clients FOR INSERT TO authenticated 
  WITH CHECK (public.check_user_role(ARRAY['super_admin', 'finance_manager', 'accounting_staff', 'sales_staff']::user_role[]));
CREATE POLICY "Clients update policy" ON public.clients FOR UPDATE TO authenticated 
  USING (public.check_user_role(ARRAY['super_admin', 'finance_manager', 'accounting_staff', 'sales_staff']::user_role[]));
CREATE POLICY "Clients delete policy" ON public.clients FOR DELETE TO authenticated 
  USING (public.check_user_role(ARRAY['super_admin', 'finance_manager']::user_role[]));


-- 4. INVOICES
DROP POLICY IF EXISTS "Authenticated read all" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated insert" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated update" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated delete" ON public.invoices;

CREATE POLICY "Invoices select policy" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Invoices insert policy" ON public.invoices FOR INSERT TO authenticated 
  WITH CHECK (public.check_user_role(ARRAY['super_admin', 'finance_manager', 'accounting_staff', 'sales_staff']::user_role[]));
CREATE POLICY "Invoices update policy" ON public.invoices FOR UPDATE TO authenticated 
  USING (public.check_user_role(ARRAY['super_admin', 'finance_manager', 'accounting_staff', 'sales_staff']::user_role[]));
CREATE POLICY "Invoices delete policy" ON public.invoices FOR DELETE TO authenticated 
  USING (public.check_user_role(ARRAY['super_admin', 'finance_manager']::user_role[]));


-- 5. INVOICE ITEMS
DROP POLICY IF EXISTS "Authenticated read all" ON public.invoice_items;
DROP POLICY IF EXISTS "Authenticated insert" ON public.invoice_items;
DROP POLICY IF EXISTS "Authenticated update" ON public.invoice_items;
DROP POLICY IF EXISTS "Authenticated delete" ON public.invoice_items;

CREATE POLICY "Invoice items select policy" ON public.invoice_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Invoice items insert policy" ON public.invoice_items FOR INSERT TO authenticated 
  WITH CHECK (public.check_user_role(ARRAY['super_admin', 'finance_manager', 'accounting_staff', 'sales_staff']::user_role[]));
CREATE POLICY "Invoice items update policy" ON public.invoice_items FOR UPDATE TO authenticated 
  USING (public.check_user_role(ARRAY['super_admin', 'finance_manager', 'accounting_staff', 'sales_staff']::user_role[]));
CREATE POLICY "Invoice items delete policy" ON public.invoice_items FOR DELETE TO authenticated 
  USING (public.check_user_role(ARRAY['super_admin', 'finance_manager']::user_role[]));


-- 6. INCOME
DROP POLICY IF EXISTS "Authenticated read all" ON public.income;
DROP POLICY IF EXISTS "Authenticated insert" ON public.income;
DROP POLICY IF EXISTS "Authenticated update" ON public.income;
DROP POLICY IF EXISTS "Authenticated delete" ON public.income;

CREATE POLICY "Income select policy" ON public.income FOR SELECT TO authenticated USING (true);
CREATE POLICY "Income insert policy" ON public.income FOR INSERT TO authenticated 
  WITH CHECK (public.check_user_role(ARRAY['super_admin', 'finance_manager', 'accounting_staff']::user_role[]));
CREATE POLICY "Income update policy" ON public.income FOR UPDATE TO authenticated 
  USING (public.check_user_role(ARRAY['super_admin', 'finance_manager', 'accounting_staff']::user_role[]));
CREATE POLICY "Income delete policy" ON public.income FOR DELETE TO authenticated 
  USING (public.check_user_role(ARRAY['super_admin', 'finance_manager']::user_role[]));


-- 7. INCOME ITEMS
DROP POLICY IF EXISTS "Authenticated read all" ON public.income_items;
DROP POLICY IF EXISTS "Authenticated insert" ON public.income_items;
DROP POLICY IF EXISTS "Authenticated update" ON public.income_items;
DROP POLICY IF EXISTS "Authenticated delete" ON public.income_items;

CREATE POLICY "Income items select policy" ON public.income_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Income items insert policy" ON public.income_items FOR INSERT TO authenticated 
  WITH CHECK (public.check_user_role(ARRAY['super_admin', 'finance_manager', 'accounting_staff']::user_role[]));
CREATE POLICY "Income items update policy" ON public.income_items FOR UPDATE TO authenticated 
  USING (public.check_user_role(ARRAY['super_admin', 'finance_manager', 'accounting_staff']::user_role[]));
CREATE POLICY "Income items delete policy" ON public.income_items FOR DELETE TO authenticated 
  USING (public.check_user_role(ARRAY['super_admin', 'finance_manager']::user_role[]));


-- 8. EXPENSE
DROP POLICY IF EXISTS "Authenticated read all" ON public.expense;
DROP POLICY IF EXISTS "Authenticated insert" ON public.expense;
DROP POLICY IF EXISTS "Authenticated update" ON public.expense;
DROP POLICY IF EXISTS "Authenticated delete" ON public.expense;

CREATE POLICY "Expense select policy" ON public.expense FOR SELECT TO authenticated USING (true);
CREATE POLICY "Expense insert policy" ON public.expense FOR INSERT TO authenticated 
  WITH CHECK (public.check_user_role(ARRAY['super_admin', 'finance_manager', 'accounting_staff']::user_role[]));
CREATE POLICY "Expense update policy" ON public.expense FOR UPDATE TO authenticated 
  USING (public.check_user_role(ARRAY['super_admin', 'finance_manager', 'accounting_staff']::user_role[]));
CREATE POLICY "Expense delete policy" ON public.expense FOR DELETE TO authenticated 
  USING (public.check_user_role(ARRAY['super_admin', 'finance_manager']::user_role[]));


-- 9. EXPENSE ITEMS
DROP POLICY IF EXISTS "Authenticated read all" ON public.expense_items;
DROP POLICY IF EXISTS "Authenticated insert" ON public.expense_items;
DROP POLICY IF EXISTS "Authenticated update" ON public.expense_items;
DROP POLICY IF EXISTS "Authenticated delete" ON public.expense_items;

CREATE POLICY "Expense items select policy" ON public.expense_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Expense items insert policy" ON public.expense_items FOR INSERT TO authenticated 
  WITH CHECK (public.check_user_role(ARRAY['super_admin', 'finance_manager', 'accounting_staff']::user_role[]));
CREATE POLICY "Expense items update policy" ON public.expense_items FOR UPDATE TO authenticated 
  USING (public.check_user_role(ARRAY['super_admin', 'finance_manager', 'accounting_staff']::user_role[]));
CREATE POLICY "Expense items delete policy" ON public.expense_items FOR DELETE TO authenticated 
  USING (public.check_user_role(ARRAY['super_admin', 'finance_manager']::user_role[]));


-- 10. COMPANY PROFILE
DROP POLICY IF EXISTS "Authenticated read all" ON public.company_profile;
DROP POLICY IF EXISTS "Authenticated update" ON public.company_profile;

CREATE POLICY "Company profile select policy" ON public.company_profile FOR SELECT TO authenticated USING (true);
CREATE POLICY "Company profile update policy" ON public.company_profile FOR UPDATE TO authenticated 
  USING (public.check_user_role(ARRAY['super_admin', 'finance_manager']::user_role[]));


-- 11. CATEGORIES
DROP POLICY IF EXISTS "Authenticated read all" ON public.categories;
DROP POLICY IF EXISTS "Authenticated insert" ON public.categories;
DROP POLICY IF EXISTS "Authenticated update" ON public.categories;
DROP POLICY IF EXISTS "Authenticated delete" ON public.categories;

CREATE POLICY "Categories select policy" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Categories insert policy" ON public.categories FOR INSERT TO authenticated 
  WITH CHECK (public.check_user_role(ARRAY['super_admin', 'finance_manager']::user_role[]));
CREATE POLICY "Categories update policy" ON public.categories FOR UPDATE TO authenticated 
  USING (public.check_user_role(ARRAY['super_admin', 'finance_manager']::user_role[]));
CREATE POLICY "Categories delete policy" ON public.categories FOR DELETE TO authenticated 
  USING (public.check_user_role(ARRAY['super_admin', 'finance_manager']::user_role[]));


-- 12. AUDIT LOGS
DROP POLICY IF EXISTS "Authenticated read all" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated insert" ON public.audit_logs;

CREATE POLICY "Audit logs select policy" ON public.audit_logs FOR SELECT TO authenticated 
  USING (public.check_user_role(ARRAY['super_admin', 'finance_manager']::user_role[]));
CREATE POLICY "Audit logs insert policy" ON public.audit_logs FOR INSERT TO authenticated 
  WITH CHECK (true);
