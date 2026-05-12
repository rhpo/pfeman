import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) redirect(302, "/accounts/login");
    if (locals.user.role !== "admin") redirect(302, "/");

    const repos = createRepositories();
    const companies = await repos.users.findAllCompanies();

    const formatted = companies.map((c) => ({
        profile_id: c.profile_id,
        company_name: c.company_name,
        description: c.description,
        email: c.email,
        address: c.address,
        sector: c.sector,
        website: c.website,
        contact_phone: c.contact_phone,
        logo_url: c.logo_url,
        is_verified: c.is_verified,
        created_at: c.created_at,
        created_at_formatted: formatDate(c.created_at),
    }));

    return { companies: formatted };
};