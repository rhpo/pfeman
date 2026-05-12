import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.js';
import type {
  IAssignmentRepository,
  AssignmentRow,
  AssignmentInsert,
  AssignmentUpdate,
  AssignmentWithSubject,
  PfeStatus,
} from '../../port.js';

export class SupabaseAssignmentRepo implements IAssignmentRepository {
  constructor(private readonly client: SupabaseClient<Database>) { }

  async findAll(): Promise<AssignmentRow[]> {
    const { data, error } = await this.client
      .from('pfe_assignments')
      .select('*')
      .order('assigned_at', { ascending: false });
    if (error) throw error;
    return data as unknown as AssignmentRow[];
  }

  async findById(id: string): Promise<AssignmentRow | null> {
    const { data, error } = await this.client
      .from('pfe_assignments')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as unknown as AssignmentRow;
  }

  async findByStudent(studentId: string): Promise<AssignmentWithSubject[]> {
    const { data, error } = await this.client
      .from('pfe_assignments')
      .select('*, pfe_subjects(*)')
      .eq('student_id', studentId);
    if (error) throw error;
    return data as unknown as AssignmentWithSubject[];
  }

  async findBySupervisor(supervisorId: string): Promise<AssignmentWithSubject[]> {
    const { data, error } = await this.client
      .from('pfe_assignments')
      .select('*, pfe_subjects(*)')
      .eq('supervisor_id', supervisorId);
    if (error) throw error;
    return data as unknown as AssignmentWithSubject[];
  }

  async findByAcademicYear(yearId: string): Promise<AssignmentRow[]> {
    const { data, error } = await this.client
      .from('pfe_assignments')
      .select('*')
      .eq('academic_year_id' as any, yearId)
      .order('assigned_at', { ascending: false });
    if (error) throw error;
    return data as unknown as AssignmentRow[];
  }

  async updateStatus(id: string, status: PfeStatus): Promise<AssignmentRow> {
    const { data, error } = await this.client
      .from('pfe_assignments')
      .update({ status } as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as AssignmentRow;
  }

  async update(id: string, data: AssignmentUpdate): Promise<AssignmentRow> {
    const { data: result, error } = await this.client
      .from('pfe_assignments')
      .update({ ...data, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result as unknown as AssignmentRow;
  }

  async insert(assignment: AssignmentInsert): Promise<AssignmentRow> {
    const { data, error } = await this.client
      .from('pfe_assignments')
      .insert(assignment as any)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as AssignmentRow;
  }
}