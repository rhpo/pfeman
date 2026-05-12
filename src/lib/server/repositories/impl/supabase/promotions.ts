import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "$lib/types/database.js";
import type {
  IPromotionRepository,
  PromotionRow,
  PromotionInsert,
} from "../../port.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>;

export class SupabasePromotionRepo implements IPromotionRepository {
  private c: AnyClient;
  constructor(client: SupabaseClient<Database>) {
    this.c = client as unknown as AnyClient;
  }

  async findAll(): Promise<PromotionRow[]> {
    const { data, error } = await this.c
      .from("promotions")
      .select("*")
      .order("label");
    if (error) throw error;
    return data as unknown as PromotionRow[];
  }

  async findById(id: string): Promise<PromotionRow | null> {
    const { data, error } = await this.c
      .from("promotions")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as unknown as PromotionRow;
  }

  async findByAcademicYear(academicYearId: string): Promise<PromotionRow[]> {
    const { data, error } = await this.c
      .from("promotions")
      .select("*")
      .eq("academic_year_id", academicYearId)
      .order("label");
    if (error) throw error;
    return data as unknown as PromotionRow[];
  }

  async insert(promotion: PromotionInsert): Promise<PromotionRow> {
    const { data, error } = await this.c
      .from("promotions")
      .insert(promotion)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as PromotionRow;
  }
}
