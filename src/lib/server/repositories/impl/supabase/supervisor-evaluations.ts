import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "$lib/types/database.js";
import type {
    ISupervisorEvaluationRepository,
    SupervisorEvaluationRow,
    SupervisorEvaluationInsert,
    SupervisorEvaluationUpdate,
} from "../../port.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>;

export class SupabaseSupervisorEvaluationRepo implements ISupervisorEvaluationRepository {
    private c: AnyClient;
    constructor(client: SupabaseClient<Database>) {
        this.c = client as unknown as AnyClient;
    }

    async findByAssignment(assignmentId: string): Promise<SupervisorEvaluationRow[]> {
        const { data, error } = await this.c
            .from("supervisor_evaluations")
            .select("*")
            .eq("assignment_id", assignmentId)
            .order("submitted_at", { ascending: false });
        if (error) throw error;
        return data as unknown as SupervisorEvaluationRow[];
    }

    async findByStudent(studentId: string): Promise<SupervisorEvaluationRow[]> {
        const { data, error } = await this.c
            .from("supervisor_evaluations")
            .select("*")
            .eq("student_id", studentId)
            .order("submitted_at", { ascending: false });
        if (error) throw error;
        return data as unknown as SupervisorEvaluationRow[];
    }

    async findByEvaluator(evaluatorId: string, assignmentId: string): Promise<SupervisorEvaluationRow | null> {
        const { data, error } = await this.c
            .from("supervisor_evaluations")
            .select("*")
            .eq("evaluator_id", evaluatorId)
            .eq("assignment_id", assignmentId)
            .single();
        if (error) {
            if (error.code === "PGRST116") return null;
            throw error;
        }
        return data as unknown as SupervisorEvaluationRow;
    }

    async insert(data: SupervisorEvaluationInsert): Promise<SupervisorEvaluationRow> {
        const { data: inserted, error } = await this.c
            .from("supervisor_evaluations")
            .insert(data)
            .select()
            .single();
        if (error) throw error;
        return inserted as unknown as SupervisorEvaluationRow;
    }

    async update(id: string, data: SupervisorEvaluationUpdate): Promise<SupervisorEvaluationRow> {
        const { data: updated, error } = await this.c
            .from("supervisor_evaluations")
            .update(data)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return updated as unknown as SupervisorEvaluationRow;
    }
}