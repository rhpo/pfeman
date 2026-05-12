import { redirect, fail } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import { transferAdminRole } from "$lib/server/use-cases/admin/transfer-admin-role";
import { z } from "zod/v4";
import type { PageServerLoad, Actions } from "./$types";

const updateTeacherSchema = z.object({
  full_name: z.string().min(2).optional(),
  grade: z.enum(["assistant", "mab", "maa", "mcb", "mca", "professeur"]).optional(),
  department: z.string().min(2).optional(),
  specialties: z.string().transform((s) => s.split(",").map((v) => v.trim()).filter(Boolean)).optional(),
});

const updateStudentSchema = z.object({
  full_name: z.string().min(2).optional(),
  specialty: z.string().min(2).optional(),
  level: z.enum(["licence", "master", "ingenieur"]).optional(),
  promotion_id: z.string().optional(),
});

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const profile = await repos.users.findProfileById(params.id);

  if (!profile) {
    redirect(302, "/admin/users");
  }

  let teacher = null;
  let student = null;
  let company = null;

  if (profile.role === "teacher") {
    teacher = await repos.users.findTeacherByProfileId(profile.id);
  } else if (profile.role === "student") {
    student = await repos.users.findStudentByProfileId(profile.id);
  } else if (profile.role === "company") {
    company = await repos.users.findCompanyByProfileId(profile.id);
  }

  const promotions = await repos.promotions.findAll();

  return {
    profile,
    teacher,
    student,
    company,
    promotions,
  };
};

export const actions: Actions = {
  updateTeacher: async ({ params, request }) => {
    const data = Object.fromEntries(await request.formData());
    const result = updateTeacherSchema.safeParse(data);

    if (!result.success) {
      return fail(400, { error: "Donnees invalides", fields: data });
    }

    try {
      const repos = createRepositories();
      const updates: Record<string, any> = {};

      if (result.data.full_name) updates.full_name = result.data.full_name;
      if (result.data.grade) updates.grade = result.data.grade;
      if (result.data.department) updates.department = result.data.department;
      if (result.data.specialties) updates.specialties = result.data.specialties;

      if (Object.keys(updates).length > 0) {
        await repos.users.updateProfile(params.id, updates);
      }

      return { success: true };
    } catch (err: any) {
      return fail(500, { error: err.message });
    }
  },

  updateStudent: async ({ params, request }) => {
    const data = Object.fromEntries(await request.formData());
    const result = updateStudentSchema.safeParse(data);

    if (!result.success) {
      return fail(400, { error: "Donnees invalides", fields: data });
    }

    try {
      const repos = createRepositories();
      const updates: Record<string, any> = {};

      if (result.data.full_name) updates.full_name = result.data.full_name;
      if (result.data.specialty) updates.specialty = result.data.specialty;
      if (result.data.level) updates.level = result.data.level;
      if (result.data.promotion_id) updates.promotion_id = result.data.promotion_id;

      if (Object.keys(updates).length > 0) {
        await repos.users.updateProfile(params.id, updates);
      }

      return { success: true };
    } catch (err: any) {
      return fail(500, { error: err.message });
    }
  },

  transferAdminRole: async ({ params, locals }) => {
    if (!locals.user) return fail(401, { error: "Non authentifie" });

    try {
      const repos = createRepositories();
      await transferAdminRole(repos, locals.user, params.id);
      return { success: true };
    } catch (err: any) {
      return fail(500, { error: err.message });
    }
  },

  deactivateUser: async ({ params }) => {
    try {
      const repos = createRepositories();
      await repos.users.deleteProfile(params.id);
      return { success: true };
    } catch (err: any) {
      return fail(500, { error: err.message });
    }
  },

  reactivateUser: async ({ params }) => {
    try {
      const repos = createRepositories();
      await repos.users.updateProfile(params.id, { is_active: true });
      return { success: true };
    } catch (err: any) {
      return fail(500, { error: err.message });
    }
  },
};
