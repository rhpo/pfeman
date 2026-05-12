import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.js';
import type {
  IDefenseRepository,
  JuryRow,
  JuryInsert,
  DefenseRow,
  DefenseInsert,
  DefenseUpdate,
  DefenseWithJury,
} from '../../port.js';

export class SupabaseDefenseRepo implements IDefenseRepository {
  constructor(private readonly client: SupabaseClient<Database>) { }

  async insertJury(jury: JuryInsert): Promise<JuryRow> {
    const { data, error } = await this.client
      .from('defense_juries')
      .insert(jury as any)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as JuryRow;
  }

  async insertDefense(defense: DefenseInsert): Promise<DefenseRow> {
    const { data, error } = await this.client
      .from('defenses')
      .insert(defense as any)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as DefenseRow;
  }

  async updateDefenseResult(id: string, updates: DefenseUpdate): Promise<DefenseRow> {
    const { data, error } = await this.client
      .from('defenses')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as DefenseRow;
  }

  async findByAssignment(assignmentId: string): Promise<DefenseWithJury | null> {
    const { data, error } = await this.client
      .from('defenses')
      .select('*, defense_juries(*)')
      .eq('assignment_id', assignmentId)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as unknown as DefenseWithJury;
  }

  async findAll(): Promise<DefenseRow[]> {
    const { data, error } = await this.client
      .from('defenses')
      .select('*')
      .order('scheduled_at', { ascending: false });
    if (error) throw error;
    return data as unknown as DefenseRow[];
  }

  async confirmJury(defenseId: string, userId: string, hasPrintedVersion: boolean): Promise<void> {
    const { data: defense, error } = await this.client
      .from('defenses')
      .select('*, defense_juries(*)')
      .eq('id', defenseId)
      .single();
    if (error || !defense) throw new Error(`Defense "${defenseId}" not found`);

    const d = defense as unknown as DefenseWithJury;
    const isPresident = d.defense_juries?.president_id === userId;
    const isMember = d.defense_juries?.member_id === userId;

    if (!isPresident && !isMember) throw new Error("You are not a jury member for this defense");

    if (hasPrintedVersion && isPresident) {
      const { data: assignment } = await this.client
        .from('pfe_assignments')
        .select('*')
        .eq('id', d.assignment_id)
        .single();

      if (assignment) {
        const a = assignment as unknown as { student_id: string; student2_id: string | null; student3_id: string | null };
        const studentIds = [a.student_id, a.student2_id, a.student3_id].filter(Boolean);
        for (const sid of studentIds) {
          await this.client.from('notifications').insert({
            id: crypto.randomUUID(),
            recipient_id: sid,
            type: 'DEFENSE_PRINTED_VERSION',
            payload: { defense_id: defenseId },
            message: 'Le jury a reçu la version imprimée de votre mémoire.',
          } as any);
        }
      }
    }
  }

  async declineJury(defenseId: string, userId: string): Promise<void> {
    const { data: defense, error } = await this.client
      .from('defenses')
      .select('*, defense_juries(*)')
      .eq('id', defenseId)
      .single();
    if (error || !defense) throw new Error(`Defense "${defenseId}" not found`);

    const d = defense as unknown as DefenseWithJury;
    const isPresident = d.defense_juries?.president_id === userId;
    const isMember = d.defense_juries?.member_id === userId;

    if (!isPresident && !isMember) throw new Error("You are not a jury member for this defense");

    const { data: admins } = await this.client
      .from('profiles')
      .select('id')
      .eq('role', 'admin');
    if (admins) {
      for (const admin of admins as unknown as { id: string }[]) {
        await this.client.from('notifications').insert({
          id: crypto.randomUUID(),
          recipient_id: admin.id,
          type: 'JURY_DECLINED',
          payload: { defense_id: defenseId, declined_by: userId },
          message: 'Un membre du jury a décliné la soutenance.',
        } as any);
      }
    }
  }
}
