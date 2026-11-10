// Names, requirements and progress match the mobile Achievements screen.
const DEFINITIONS = [
  ["Unang Hakbang", "Complete one distinct published quiz."],
  ["Masipag na Mag-aaral", "Complete five distinct published quizzes."],
  ["Patuloy na Pag-unlad", "Improve by at least 10 percentage points on a later graded attempt at the same quiz version. Retakes depend on the teacher’s attempt limit."],
  ["Tuloy-tuloy na Tagumpay", "Earn at least 80% on three consecutive distinct quizzes. Only the first completed graded attempt per quiz counts."],
  ["Ganap na Tagumpay", "Earn 100% on a published quiz."],
] as const;

export type Achievement = {
  id: number;
  name: string;
  requirement: string;
  progress: string;
  /** How close the student is to this badge, from 0 (nothing yet) to 1. */
  fraction: number;
  unlockedAt: string | null;
};

/** The locked badge the student is closest to earning, or null if none is locked. */
export function nextAchievement(achievements: readonly Achievement[]): Achievement | null {
  let next: Achievement | null = null;
  for (const item of achievements) {
    if (item.unlockedAt !== null) continue;
    if (next === null || item.fraction > next.fraction) next = item;
  }
  return next;
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid achievements response.");
  return value as Record<string, unknown>;
}

/** Saved awards are authoritative: progress must never invent an unlock. */
export function parseAchievements(value: unknown): Achievement[] {
  const data = record(value);
  const number = (key: string): number => {
    const result = data[key];
    if (typeof result !== "number" || !Number.isFinite(result) || result < 0) throw new Error("Invalid achievement progress.");
    return result;
  };
  const count = number("distinctQuizzes");
  const improvement = number("bestImprovement");
  const streak = number("streak");
  const best = number("bestPercentage");
  if (!Array.isArray(data.awards)) throw new Error("Missing achievement awards.");
  const awards = new Map<number, string>();
  for (const value of data.awards) {
    const award = record(value);
    if (typeof award.badge !== "number" || !Number.isInteger(award.badge) || typeof award.unlockedAt !== "string" || !Number.isFinite(Date.parse(award.unlockedAt))) {
      throw new Error("Invalid achievement award.");
    }
    awards.set(award.badge, award.unlockedAt);
  }
  const progress = [
    `${Math.min(count, 1)}/1 distinct quiz`,
    `${Math.min(count, 5)}/5 distinct quizzes`,
    `${improvement.toFixed(1)}/10 percentage points`,
    `${Math.min(streak, 3)}/3 consecutive quizzes`,
    `${best.toFixed(1)}% / 100%`,
  ];
  const fractions = [
    Math.min(count, 1) / 1,
    Math.min(count, 5) / 5,
    Math.min(improvement, 10) / 10,
    Math.min(streak, 3) / 3,
    Math.min(best, 100) / 100,
  ];
  return DEFINITIONS.map(([name, requirement], index) => ({
    id: index + 1, name, requirement, progress: progress[index],
    fraction: fractions[index],
    unlockedAt: awards.get(index + 1) ?? null,
  }));
}

