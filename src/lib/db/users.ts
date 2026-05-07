import { createClient } from '@/utils/supabase/client';
import type { UserProfile, CompanyProfile } from './types';

// ─── USER PROFILE ─────────────────────────────────────────────────────────────

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function updateProfile(payload: Partial<UserProfile>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', user.id)
    .select()
    .single();

  return { data, error };
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name', { ascending: true });

  if (error) { console.error('getAllUsers:', error); return []; }
  return data || [];
}

export async function updateUserRole(id: string, role: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteUser(id: string) {
  const supabase = createClient();
  // Soft-delete: preserve audit trail by setting is_active = false
  const { error } = await supabase.from('users').update({ is_active: false }).eq('id', id);
  return { error };
}

// ─── COMPANY PROFILE ──────────────────────────────────────────────────────────

export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('company_profile')
    .select('*')
    .single();

  if (error) return null;
  return data;
}

export async function updateCompanyProfile(payload: Partial<CompanyProfile>) {
  const supabase = createClient();
  const company = await getCompanyProfile();
  if (!company) return { error: 'Company profile not found' };

  const { data, error } = await supabase
    .from('company_profile')
    .update(payload)
    .eq('id', company.id)
    .select()
    .single();

  return { data, error };
}

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────

export async function createAuditLog(
  user_id: string,
  action: 'create' | 'update' | 'delete' | 'view' | 'export' | 'login' | 'logout',
  entity_type: string,
  entity_id?: string | null,
  old_values?: any,
  new_values?: any
) {
  const supabase = createClient();
  const { error } = await supabase.from('audit_logs').insert([{
    user_id,
    action,
    entity_type,
    entity_id: entity_id || null,
    old_values: old_values || null,
    new_values: new_values || null
  }]);
  
  if (error) {
    console.error('[createAuditLog] Error inserting audit log:', error);
  }
}
