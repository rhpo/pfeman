import type { IRepositories } from "$lib/server/repositories/port";
import type { SessionUser } from "$lib/types/domain";

export interface SubmitGradeInput {
  defenseId: string;
  juryMemberId: string;
  criterion1: number;
  criterion2: number;
  criterion3: number;
  criterion4: number;
}

export async function submitGrade(
  repos: IRepositories,
  _user: SessionUser,
  input: SubmitGradeInput,
) {
  const total = input.criterion1 + input.criterion2 + input.criterion3 + input.criterion4;

  const grade = await repos.juryGrades.insert({
    defense_id: input.defenseId,
    jury_member_id: input.juryMemberId,
    criterion1: input.criterion1,
    criterion2: input.criterion2,
    criterion3: input.criterion3,
    criterion4: input.criterion4,
    total,
  });

  // Check if both grades are submitted and compute gap
  const allGrades = await repos.juryGrades.findByDefense(input.defenseId);
  if (allGrades.length === 2) {
    const gap = Math.abs(allGrades[0].total - allGrades[1].total);
    if (gap <= 1) {
      // Auto-validate: set final grade as average
      const avg = (allGrades[0].total + allGrades[1].total) / 2;
      await repos.defenses.updateDefenseResult(input.defenseId, {
        final_grade: avg,
        grade_gap: gap,
      });
    } else {
      // Flag for tiebreak
      await repos.defenses.updateDefenseResult(input.defenseId, {
        grade_gap: gap,
      });
    }
  }

  return grade;
}

export async function resolveTiebreak(
  repos: IRepositories,
  _user: SessionUser,
  defenseId: string,
  choice: "president" | "member" | "average",
) {
  const grades = await repos.juryGrades.findByDefense(defenseId);
  if (grades.length !== 2) throw new Error("Both grades must be submitted first");

  const defense = await repos.defenses.findByAssignment("");
  // We need the defense to know who is president
  // For now, compute based on choice
  let finalGrade: number;
  if (choice === "average") {
    finalGrade = (grades[0].total + grades[1].total) / 2;
  } else if (choice === "president") {
    // Assume first grade is president's - in real impl, check jury_member_id
    finalGrade = grades[0].total;
  } else {
    finalGrade = grades[1].total;
  }

  await repos.defenses.updateDefenseResult(defenseId, {
    final_grade: finalGrade,
    tiebreak_choice: choice,
  });
}
