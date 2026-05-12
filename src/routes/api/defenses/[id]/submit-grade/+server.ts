import { json } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) {
    return json({ message: "Non authentifie" }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json();
  const { criterion1, criterion2, criterion3, criterion4 } = body;

  if (
    typeof criterion1 !== "number" ||
    typeof criterion2 !== "number" ||
    typeof criterion3 !== "number" ||
    typeof criterion4 !== "number"
  ) {
    return json({ message: "Les 4 criteres doivent etre des nombres" }, { status: 400 });
  }

  if (
    criterion1 < 0 || criterion1 > 5 ||
    criterion2 < 0 || criterion2 > 5 ||
    criterion3 < 0 || criterion3 > 5 ||
    criterion4 < 0 || criterion4 > 5
  ) {
    return json({ message: "Chaque critere doit etre entre 0 et 5" }, { status: 400 });
  }

  const repos = createRepositories();

  // Verify the defense exists
  const allDefenses = await repos.defenses.findAll();
  const defense = allDefenses.find((d) => d.id === id);
  if (!defense) {
    return json({ message: "Soutenance introuvable" }, { status: 404 });
  }

  // Verify the user is a member of the jury for this defense
  const jury = await repos.defenses.findByAssignment(defense.assignment_id);
  if (!jury || !jury.defense_juries) {
    return json({ message: "Jury introuvable" }, { status: 404 });
  }

  const juryData = jury.defense_juries;
  const userId = locals.user.id;
  if (userId !== juryData.president_id && userId !== juryData.member_id) {
    return json({ message: "Vous n'etes pas membre du jury de cette soutenance" }, { status: 403 });
  }

  // Check if this member already submitted a grade
  const existing = await repos.juryGrades.findByMember(id, userId);
  if (existing) {
    return json({ message: "Vous avez deja soumis votre evaluation" }, { status: 409 });
  }

  const total = criterion1 + criterion2 + criterion3 + criterion4;

  const grade = await repos.juryGrades.insert({
    defense_id: id,
    jury_member_id: userId,
    criterion1,
    criterion2,
    criterion3,
    criterion4,
    total,
  });

  return json({ grade }, { status: 201 });
};
