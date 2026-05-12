import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  valide: "Valide",
  refuse: "Refuse",
  expire: "Expire",
};

const STATUS_VARIANTS: Record<string, "warning" | "success" | "danger" | "neutral"> = {
  en_attente: "warning",
  valide: "success",
  refuse: "danger",
  expire: "neutral",
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();

  const statusFilter = url.searchParams.get("status") || undefined;
  const niveauFilter = url.searchParams.get("niveau") || undefined;
  const specialtyFilter = url.searchParams.get("specialty") || undefined;

  // Admin sees ALL subjects across all academic years
  const allSubjects = await repos.subjects.findAll();

  let subjects = allSubjects;
  if (statusFilter) {
    subjects = subjects.filter((s) => s.status === statusFilter);
  }
  if (niveauFilter) {
    subjects = subjects.filter((s) => s.level === niveauFilter);
  }
  if (specialtyFilter) {
    subjects = subjects.filter((s) => s.specialty === specialtyFilter);
  }

  const teachers = await repos.users.findAllTeachers();
  const allSpecialities = await repos.specialities.findAll();

  // Unique niveaux from specialities, pre-formatted for Select component
  const niveauLabels: Record<string, string> = { licence: "Licence", master: "Master", ingenieur: "Ingénieur" };
  const niveaux = [...new Set(allSpecialities.map((s) => s.year_type))].map((n) => ({
    value: n,
    label: niveauLabels[n] ?? n,
  }));

  const formattedSubjects = subjects.map((s) => ({
    id: s.id,
    title: s.title,
    specialty: s.specialty,
    level: s.level,
    group_type: s.group_type,
    group_type_label: s.group_type === "monome" ? "Monome" : s.group_type === "binome" ? "Binome" : "Trinome",
    status: s.status,
    status_label: STATUS_LABELS[s.status] ?? s.status,
    status_variant: STATUS_VARIANTS[s.status] ?? "neutral",
    proposer_role: s.proposer_role,
    proposer_role_label: s.proposer_role === "teacher" ? "Enseignant" : s.proposer_role === "company" ? "Entreprise" : s.proposer_role,
    created_at_formatted: formatDate(s.created_at),
  }));

  const formattedTeachers = teachers.map((t) => ({
    id: t.id,
    profile_name: t.profile_id ?? t.email ?? "Inconnu",
    specialties: t.specialties,
  }));

  return {
    subjects: formattedSubjects,
    teachers: formattedTeachers,
    specialities: allSpecialities,
    niveaux,
    statusFilter,
    niveauFilter,
    specialtyFilter,
  };
};
