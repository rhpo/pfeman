import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';

type Client = SupabaseClient<Database>;

export async function findAssignmentById(client: Client, id: string) {
  const { data, error } = await client
    .from('pfe_assignments')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function findAssignmentsByStudent(client: Client, studentId: string) {
  const { data, error } = await client
    .from('pfe_assignments')
    .select('*, pfe_subjects(*)')
    .eq('student_id', studentId);
  if (error) throw error;
  return data;
}

export async function findAssignmentsBySupervisor(client: Client, supervisorId: string) {
  const { data, error } = await client
    .from('pfe_assignments')
    .select('*, pfe_subjects(*)')
    .eq('supervisor_id', supervisorId);
  if (error) throw error;
  return data;
}

export async function insertAssignment(
  client: Client,
  assignment: Database['public']['Tables']['pfe_assignments']['Insert']
) {
  const { data, error } = await client
    .from('pfe_assignments')
    .insert(assignment)
    .select()
    .single();
  if (error) throw error;
  return data;
}
