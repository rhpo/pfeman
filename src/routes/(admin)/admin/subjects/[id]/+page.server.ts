import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  valide: "Valide",
  refuse: "Refuse",
  expire: "Expire",
};

const GROUP_TYPE_LABELS: Record<string, string> = {
  monome: "Monome",
  binome: "Binome",
  trinome: "Trinome",
};

const REVIEW_LABELS: Record<string, string> = {
  accepte: "Accepte",
  accepte_sous_reserve: "Accepte sous reserve",
  refuse: "Refuse",
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const subject = await repos.subjects.findById(params.id);

  if (!subject) {
    redirect(302, "/admin/subjects");
  }

  const teachers = await repos.users.findAllTeachers();
  const allSpecialities = await repos.specialities.findAll();

  // Build a map of speciality ID -> name for display
  const specialityNames = new Map<string, string>();
  for (const spec of allSpecialities) {
    specialityNames.set(spec.id, spec.name);
  }

  const formattedSubject = {
    id: subject.id,
    title: subject.title,
    description: subject.description,
    specialty: subject.specialty,
    specialty_name: specialityNames.get(subject.specialty) ?? subject.specialty,
    group_type: subject.group_type,
    group_type_label: GROUP_TYPE_LABELS[subject.group_type] ?? subject.group_type,
    status: subject.status,
    status_label: STATUS_LABELS[subject.status] ?? subject.status,
    proposer_role: subject.proposer_role,
    proposer_role_label:
      subject.proposer_role === "teacher"
        ? "Enseignant"
        : subject.proposer_role === "company"
          ? "Entreprise"
          : subject.proposer_role,
    validator1_id: subject.validator1_id,
    validator2_id: subject.validator2_id,
    validator1_decision: subject.validator1_decision,
    validator1_decision_label: subject.validator1_decision
      ? (REVIEW_LABELS[subject.validator1_decision] ?? subject.validator1_decision)
      : null,
    validator2_decision: subject.validator2_decision,
    validator2_decision_label: subject.validator2_decision
      ? (REVIEW_LABELS[subject.validator2_decision] ?? subject.validator2_decision)
      : null,
    validator1_comment: subject.validator1_comment,
    validator2_comment: subject.validator2_comment,
    created_at_formatted: formatDate(subject.created_at),
    updated_at_formatted: formatDate(subject.updated_at),
  };

  // Compute match score for each teacher based on specialty overlap
  const formattedTeachers = teachers.map((t) => {
    const teacherSpecialtyNames = t.specialties.map((s) => specialityNames.get(s) ?? s);
    const isExactMatch = t.specialties.includes(subject.specialty);
    const matchScore = isExactMatch ? 3 : t.specialties.length > 0 ? 1 : 0;

    return {
      id: t.id,
      profile_name: t.profile_id ?? t.email ?? "Inconnu",
      specialties: t.specialties,
      specialty_names: teacherSpecialtyNames,
      match_score: matchScore,
    };
  });

  // Sort: exact matches first, then partial matches, then no match
  formattedTeachers.sort((a, b) => b.match_score - a.match_score);

  return { subject: formattedSubject, teachers: formattedTeachers };
};
