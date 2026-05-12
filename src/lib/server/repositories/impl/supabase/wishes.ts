import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "$lib/types/database.js";
import type {
  IWishRepository,
  WishRow,
  WishInsert,
  WishStatus,
} from "../../port.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>;

export class SupabaseWishRepo implements IWishRepository {
  private c: AnyClient;
  constructor(client: SupabaseClient<Database>) {
    this.c = client as unknown as AnyClient;
  }

  async findByStudent(studentId: string, yearId: string): Promise<WishRow[]> {
    const { data, error } = await this.c
      .from("wishes")
      .select("*")
      .eq("student_id", studentId)
      .eq("academic_year_id", yearId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as WishRow[];
  }

  async findBySubject(subjectId: string): Promise<WishRow[]> {
    const { data, error } = await this.c
      .from("wishes")
      .select("*")
      .eq("subject_id", subjectId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as WishRow[];
  }

  async findById(id: string): Promise<WishRow | null> {
    const { data, error } = await this.c
      .from("wishes")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as unknown as WishRow;
  }

  async countByStudent(studentId: string, yearId: string): Promise<number> {
    const { count, error } = await this.c
      .from("wishes")
      .select("*", { count: "exact", head: true })
      .eq("student_id", studentId)
      .eq("academic_year_id", yearId);
    if (error) throw error;
    return count ?? 0;
  }

  async insert(wish: WishInsert): Promise<WishRow> {
    const { data, error } = await this.c
      .from("wishes")
      .insert(wish)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as WishRow;
  }

  async updateStatus(id: string, status: WishStatus): Promise<WishRow> {
    const { data, error } = await this.c
      .from("wishes")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as WishRow;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.c
      .from("wishes")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }
}
