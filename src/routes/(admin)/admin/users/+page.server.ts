import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";
import type {
  ProfileRow,
  TeacherRow,
  StudentRow,
  CompanyRow,
  PromotionRow,
  TeacherGrade,
  AvailabilityStatus,
  Level,
} from "$lib/server/repositories/port";

function getProfileName(profileId: string | null, profiles: ProfileRow[]): string {
  if (!profileId) return "—";
  const p = profiles.find((pr) => pr.id === profileId);
  return p?.full_name ?? "—";
}

function getProfileEmail(profileId: string | null, teachers: TeacherRow[], students: StudentRow[]): string {
  if (!profileId) return "—";
  const teacher = teachers.find((t) => t.profile_id === profileId);
  if (teacher?.email) return teacher.email;
  const student = students.find((s) => s.profile_id === profileId);
  if (student?.email) return student.email;
  return "—";
}

function getPromotionLabel(promotionId: string | null, promotions: PromotionRow[]): string {
  if (!promotionId) return "—";
  const p = promotions.find((pr) => pr.id === promotionId);
  return p?.label ?? "—";
}

const gradeLabels: Record<TeacherGrade, string> = {
  assistant: "Assistant",
  mab: "MAB",
  maa: "MAA",
  mcb: "MCB",
  mca: "MCA",
  professeur: "Professeur",
};

const availabilityLabels: Record<AvailabilityStatus, string> = {
  disponible: "Disponible",
  indisponible: "Indisponible",
  indisponible_jusqu_au: "Indisponible jusqu'au",
};

const availabilityVariants: Record<AvailabilityStatus, "success" | "warning" | "danger" | "neutral"> = {
  disponible: "success",
  indisponible: "danger",
  indisponible_jusqu_au: "warning",
};

const levelLabels: Record<Level, string> = {
  licence: "Licence",
  master: "Master",
  ingenieur: "Ingenieur",
};

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();

  const [profiles, teachers, students, companies, promotions, specialities] = await Promise.all([
    repos.users.findAllProfiles(),
    repos.users.findAllTeachers(),
    repos.users.findAllStudents(),
    repos.users.findAllCompanies(),
    repos.promotions.findAll(),
    repos.specialities.findAll(),
  ]);

  const formattedTeachers = teachers.map((t) => ({
    id: t.id,
    profile_id: t.profile_id,
    email: t.email,
    department: t.department,
    specialties: t.specialties,
    grade: t.grade,
    grade_label: gradeLabels[t.grade] ?? t.grade,
    availability_status: t.availability_status,
    availability_label: availabilityLabels[t.availability_status] ?? t.availability_status,
    availability_variant: availabilityVariants[t.availability_status] ?? "neutral",
    profile_name: getProfileName(t.profile_id, profiles),
  }));

  const formattedStudents = students.map((s) => ({
    id: s.id,
    profile_id: s.profile_id,
    email: s.email,
    student_number: s.student_number,
    specialty: s.specialty,
    level: s.level,
    level_label: levelLabels[s.level] ?? s.level,
    promotion_label: getPromotionLabel(s.promotion_id, promotions),
    profile_name: getProfileName(s.profile_id, profiles),
  }));

  const formattedCompanies = companies.map((c) => ({
    profile_id: c.profile_id,
    company_name: c.company_name,
    sector: c.sector,
    contact_phone: c.contact_phone,
    website: c.website,
    is_verified: c.is_verified,
    status_label: c.is_verified ? "Validee" : "En attente",
    status_variant: (c.is_verified ? "success" : "warning") as "success" | "warning" | "neutral",
    profile_name: getProfileName(c.profile_id, profiles),
    profile_email: getProfileEmail(c.profile_id, teachers, students),
  }));

  return {
    formattedTeachers,
    formattedStudents,
    formattedCompanies,
    specialities: specialities.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      year_type: s.year_type,
    })),
  };
};
