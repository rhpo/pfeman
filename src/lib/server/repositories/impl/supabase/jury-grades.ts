import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "$lib/types/database.js";
import type {
  IJuryGradeRepository,
  JuryGradeRow,
  JuryGradeInsert,
} from "../../port.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>;

export class SupabaseJuryGradeRepo implements IJuryGradeRepository {
  private c: AnyClient;
  constructor(client: SupabaseClient<Database>) {
    this.c = client as unknown as AnyClient;
  }

  async findByDefense(defenseId: string): Promise<JuryGradeRow[]> {
    const { data, error } = await this.c
      .from("jury_grades")
      .select("*")
      .eq("defense_id", defenseId)
      .order("submitted_at", { ascending: true });
    if (error) throw error;
    return data as unknown as JuryGradeRow[];
  }

  async findByMember(defenseId: string, memberId: string): Promise<JuryGradeRow | null> {
    const { data, error } = await this.c
      .from("jury_grades")
      .select("*")
      .eq("defense_id", defenseId)
      .eq("jury_member_id", memberId)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as unknown as JuryGradeRow;
  }

  async insert(grade: JuryGradeInsert): Promise<JuryGradeRow> {
    const { data, error } = await this.c
      .from("jury_grades")
      .insert(grade)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as JuryGradeRow;
  }
}
