import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';

type Client = SupabaseClient<Database>;

export async function insertJury(
  client: Client,
  jury: Database['public']['Tables']['defense_juries']['Insert']
) {
  const { data, error } = await client
    .from('defense_juries')
    .insert(jury)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function insertDefense(
  client: Client,
  defense: Database['public']['Tables']['defenses']['Insert']
) {
  const { data, error } = await client
    .from('defenses')
    .insert(defense)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDefenseResult(
  client: Client,
  id: string,
  updates: Database['public']['Tables']['defenses']['Update']
) {
  const { data, error } = await client
    .from('defenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function findDefenseByAssignment(client: Client, assignmentId: string) {
  const { data, error } = await client
    .from('defenses')
    .select('*, defense_juries(*)')
    .eq('assignment_id', assignmentId)
    .single();
  if (error) throw error;
  return data;
}
