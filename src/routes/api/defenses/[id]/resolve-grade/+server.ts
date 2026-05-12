import { json } from "@sveltejs/kit";
import { createRepositories } from "$lib/server/repositories/factory";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) {
    return json({ message: "Non authentifie" }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json();
  const { choice, newGrade } = body;

  if (!choice || !["own", "member", "new"].includes(choice)) {
    return json({ message: "Choix invalide. Utilisez 'own', 'member' ou 'new'" }, { status: 400 });
  }

  if (choice === "new") {
    if (
      !newGrade ||
      typeof newGrade.criterion1 !== "number" ||
      typeof newGrade.criterion2 !== "number" ||
      typeof newGrade.criterion3 !== "number" ||
      typeof newGrade.criterion4 !== "number"
    ) {
      return json({ message: "Une nouvelle evaluation avec les 4 criteres est requise" }, { status: 400 });
    }
    if (
      newGrade.criterion1 < 0 || newGrade.criterion1 > 5 ||
      newGrade.criterion2 < 0 || newGrade.criterion2 > 5 ||
      newGrade.criterion3 < 0 || newGrade.criterion3 > 5 ||
      newGrade.criterion4 < 0 || newGrade.criterion4 > 5
    ) {
      return json({ message: "Chaque critere doit etre entre 0 et 5" }, { status: 400 });
    }
  }

  const repos = createRepositories();

  // Verify the defense exists
  const allDefenses = await repos.defenses.findAll();
  const defense = allDefenses.find((d) => d.id === id);
  if (!defense) {
    return json({ message: "Soutenance introuvable" }, { status: 404 });
  }

  // Verify the user is the president of the jury
  const jury = await repos.defenses.findByAssignment(defense.assignment_id);
  if (!jury || !jury.defense_juries) {
    return json({ message: "Jury introuvable" }, { status: 404 });
  }

  const juryData = jury.defense_juries;
  if (locals.user.id !== juryData.president_id) {
    return json({ message: "Seul le president du jury peut resoudre le desaccord" }, { status: 403 });
  }

  // Load both grades
  const grades = await repos.juryGrades.findByDefense(id);
  if (grades.length < 2) {
    return json({ message: "Les deux membres du jury doivent avoir soumis leur evaluation" }, { status: 400 });
  }

  const presidentGrade = grades.find((g) => g.jury_member_id === juryData.president_id);
  const memberGrade = grades.find((g) => g.jury_member_id === juryData.member_id);
  if (!presidentGrade || !memberGrade) {
    return json({ message: "Evaluations des membres du jury introuvables" }, { status: 500 });
  }

  let finalGrade: number;
  let tiebreakChoice: "president" | "member" | "average";

  switch (choice) {
    case "own":
      finalGrade = presidentGrade.total;
      tiebreakChoice = "president";
      break;
    case "member":
      finalGrade = memberGrade.total;
      tiebreakChoice = "member";
      break;
    case "new": {
      const total = newGrade.criterion1 + newGrade.criterion2 + newGrade.criterion3 + newGrade.criterion4;
      finalGrade = total;
      tiebreakChoice = "average";
      break;
    }
    default:
      return json({ message: "Choix invalide" }, { status: 400 });
  }

  // Update the defense with the final grade
  await repos.defenses.updateDefenseResult(id, {
    final_grade: finalGrade,
    tiebreak_choice: tiebreakChoice,
    status: "done",
  });

  return json({ final_grade: finalGrade, tiebreak_choice: tiebreakChoice }, { status: 200 });
};
