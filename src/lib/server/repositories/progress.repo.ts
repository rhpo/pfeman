import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';

type Client = SupabaseClient<Database>;

export async function findReportsByAssignment(client: Client, assignmentId: string) {
  const { data, error } = await client
    .from('pfe_progress_reports')
    .select('*')
    .eq('assignment_id', assignmentId)
    .order('meeting_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertProgressReport(
  client: Client,
  report: Database['public']['Tables']['pfe_progress_reports']['Insert']
) {
  const { data, error } = await client
    .from('pfe_progress_reports')
    .insert(report)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function cosignReport(
  client: Client,
  id: string,
  feedback: string
) {
  const { data, error } = await client
    .from('pfe_progress_reports')
    .update({ teacher_feedback: feedback, signed_by_teacher: true })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
