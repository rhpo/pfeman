import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';

type Client = SupabaseClient<Database>;

export async function findSubjectById(client: Client, id: string) {
  const { data, error } = await client
    .from('pfe_subjects')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function findSubjectsByProposer(client: Client, proposerId: string) {
  const { data, error } = await client
    .from('pfe_subjects')
    .select('*')
    .eq('proposer_id', proposerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function findSubjectsByStatus(client: Client, status: string) {
  const { data, error } = await client
    .from('pfe_subjects')
    .select('*')
    .eq('status', status as any)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertSubject(
  client: Client,
  subject: Database['public']['Tables']['pfe_subjects']['Insert']
) {
  const { data, error } = await client
    .from('pfe_subjects')
    .insert(subject)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSubjectStatus(
  client: Client,
  id: string,
  status: string
) {
  const { data, error } = await client
    .from('pfe_subjects')
    .update({ status: status as Database['public']['Tables']['pfe_subjects']['Update']['status'] })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
