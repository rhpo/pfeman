import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.js';
import type {
  IProgressReportRepository,
  ProgressReportRow,
  ProgressReportInsert,
} from '../../port.js';

export class SupabaseProgressRepo implements IProgressReportRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async findByAssignment(assignmentId: string): Promise<ProgressReportRow[]> {
    const { data, error } = await this.client
      .from('pfe_progress_reports')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('meeting_date', { ascending: false });
    if (error) throw error;
    return data as ProgressReportRow[];
  }

  async insert(report: ProgressReportInsert): Promise<ProgressReportRow> {
    const { data, error } = await this.client
      .from('pfe_progress_reports')
      .insert(report)
      .select()
      .single();
    if (error) throw error;
    return data as ProgressReportRow;
  }

  async cosign(id: string, feedback: string): Promise<ProgressReportRow> {
    const { data, error } = await this.client
      .from('pfe_progress_reports')
      .update({ teacher_feedback: feedback, signed_by_teacher: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as ProgressReportRow;
  }
}
