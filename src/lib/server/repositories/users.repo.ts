import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';

type Client = SupabaseClient<Database>;

// Profiles
export async function findProfileById(client: Client, id: string) {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function findAllProfiles(client: Client) {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function findProfilesByRole(client: Client, role: string) {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('role', role as any)
    .order('full_name');
  if (error) throw error;
  return data;
}

export async function updateProfile(
  client: Client,
  id: string,
  updates: Database['public']['Tables']['profiles']['Update']
) {
  const { data, error } = await client
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Whitelist Teachers
export async function findAllTeachers(client: Client) {
  const { data, error } = await client
    .from('teachers')
    .select('*')
    .order('email');
  if (error) throw error;
  return data;
}

export async function addTeacherToWhitelist(client: Client, teacher: Database['public']['Tables']['teachers']['Insert']) {
  const { data, error } = await client
    .from('teachers')
    .insert(teacher)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Whitelist Students
export async function findAllStudents(client: Client) {
  const { data, error } = await client
    .from('students')
    .select('*')
    .order('email');
  if (error) throw error;
  return data;
}

export async function addStudentToWhitelist(client: Client, student: Database['public']['Tables']['students']['Insert']) {
  const { data, error } = await client
    .from('students')
    .insert(student)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Companies
export async function findAllCompanies(client: Client) {
  const { data, error } = await client
    .from('companies')
    .select('*')
    .order('company_name');
  if (error) throw error;
  return data;
}

// Notifications
export async function findNotificationsByRecipient(
  client: Client,
  recipientId: string,
  unreadOnly = false
) {
  let query = client
    .from('notifications')
    .select('*')
    .eq('recipient_id', recipientId)
    .order('created_at', { ascending: false });

  if (unreadOnly) {
    query = query.is('read_at', null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function markNotificationRead(client: Client, id: string) {
  const { error } = await client
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// Delete
export async function deleteProfile(client: Client, id: string) {
  const { error } = await client
    .from('profiles')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
