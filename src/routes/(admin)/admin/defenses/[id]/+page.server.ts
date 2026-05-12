import { redirect } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) redirect(302, "/accounts/login");

  const repos = createRepositories();
  const allDefenses = await repos.defenses.findAll();
  const defense = allDefenses.find((d) => d.id === params.id) ?? null;

  if (!defense) {
    redirect(302, "/admin/defenses");
  }

  const grades = await repos.juryGrades.findByDefense(params.id);

  // Load supervisor evaluation (criterion 5, /4)
  const supervisorEvalArray = await repos.supervisorEvaluations.findByAssignment(defense.assignment_id);
  const supervisorEval = supervisorEvalArray[0] ?? null;

  // Load jury info
  const jury = await repos.defenses.findByAssignment(defense.assignment_id);
  const juryData = jury?.defense_juries ?? null;

  // Load profile names for jury members
  let presidentName = "";
  let memberName = "";
  if (juryData) {
    const [presidentProfile, memberProfile] = await Promise.all([
      repos.users.findProfileById(juryData.president_id),
      repos.users.findProfileById(juryData.member_id),
    ]);
    presidentName = presidentProfile?.full_name ?? juryData.president_id;
    memberName = memberProfile?.full_name ?? juryData.member_id;
  }

  return {
    defense,
    grades,
    supervisorEval,
    jury: juryData,
    presidentName,
    memberName,
    currentUserId: locals.user.id,
  };
};
