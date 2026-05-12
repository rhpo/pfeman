import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db/client.js';
import { companyReports } from '$lib/server/db/schema.js';
import type {
    ICompanyReportRepository,
    CompanyReportRow,
    CompanyReportInsert,
    CompanyReportUpdate,
    ReportStatus,
} from '../../port.js';

export class DrizzleCompanyReportRepo implements ICompanyReportRepository {
    async findAll(): Promise<CompanyReportRow[]> {
        return db.query.companyReports.findMany({
            orderBy: (r, { desc }) => [desc(r.created_at)],
        });
    }

    async findByCompany(companyId: string): Promise<CompanyReportRow[]> {
        return db.query.companyReports.findMany({
            where: (r, { eq }) => eq(r.company_id, companyId),
            orderBy: (r, { desc }) => [desc(r.created_at)],
        });
    }

    async findByStatus(status: ReportStatus): Promise<CompanyReportRow[]> {
        return db.query.companyReports.findMany({
            where: (r, { eq }) => eq(r.status, status),
            orderBy: (r, { desc }) => [desc(r.created_at)],
        });
    }

    async findById(id: string): Promise<CompanyReportRow | null> {
        const row = await db.query.companyReports.findFirst({
            where: (r, { eq }) => eq(r.id, id),
        });
        return row ?? null;
    }

    async insert(data: CompanyReportInsert): Promise<CompanyReportRow> {
        const [inserted] = await db
            .insert(companyReports)
            .values(data)
            .returning();
        if (!inserted) throw new Error('Failed to insert company report');
        return inserted;
    }

    async update(id: string, data: CompanyReportUpdate): Promise<CompanyReportRow> {
        const [updated] = await db
            .update(companyReports)
            .set(data)
            .where(eq(companyReports.id, id))
            .returning();
        if (!updated) throw new Error(`CompanyReport not found: ${id}`);
        return updated;
    }
}