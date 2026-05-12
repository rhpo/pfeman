import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "$lib/types/database.js";
import type {
    ICompanyReportRepository,
    CompanyReportRow,
    CompanyReportInsert,
    CompanyReportUpdate,
    ReportStatus,
} from "../../port.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>;

export class SupabaseCompanyReportRepo implements ICompanyReportRepository {
    private c: AnyClient;
    constructor(client: SupabaseClient<Database>) {
        this.c = client as unknown as AnyClient;
    }

    async findAll(): Promise<CompanyReportRow[]> {
        const { data, error } = await this.c
            .from("company_reports")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) throw error;
        return data as unknown as CompanyReportRow[];
    }

    async findByCompany(companyId: string): Promise<CompanyReportRow[]> {
        const { data, error } = await this.c
            .from("company_reports")
            .select("*")
            .eq("company_id", companyId)
            .order("created_at", { ascending: false });
        if (error) throw error;
        return data as unknown as CompanyReportRow[];
    }

    async findByStatus(status: ReportStatus): Promise<CompanyReportRow[]> {
        const { data, error } = await this.c
            .from("company_reports")
            .select("*")
            .eq("status", status)
            .order("created_at", { ascending: false });
        if (error) throw error;
        return data as unknown as CompanyReportRow[];
    }

    async findById(id: string): Promise<CompanyReportRow | null> {
        const { data, error } = await this.c
            .from("company_reports")
            .select("*")
            .eq("id", id)
            .single();
        if (error) {
            if (error.code === "PGRST116") return null;
            throw error;
        }
        return data as unknown as CompanyReportRow;
    }

    async insert(data: CompanyReportInsert): Promise<CompanyReportRow> {
        const { data: inserted, error } = await this.c
            .from("company_reports")
            .insert(data)
            .select()
            .single();
        if (error) throw error;
        return inserted as unknown as CompanyReportRow;
    }

    async update(id: string, data: CompanyReportUpdate): Promise<CompanyReportRow> {
        const { data: updated, error } = await this.c
            .from("company_reports")
            .update(data)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return updated as unknown as CompanyReportRow;
    }
}