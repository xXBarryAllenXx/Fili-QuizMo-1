import { describe, expect, it } from "vitest";
import { nextAchievement, parseAchievements } from "./achievements";

const progress = { awards: [], distinctQuizzes: 8, bestImprovement: 12.25, streak: 4, bestPercentage: 100 };

describe("mobile achievement parity", () => {
  it("uses five mobile badges and their progress, without inventing awards", () => {
    const badges = parseAchievements(progress);
    expect(badges.map((badge) => badge.name)).toEqual([
      "Unang Hakbang", "Masipag na Mag-aaral", "Patuloy na Pag-unlad",
      "Tuloy-tuloy na Tagumpay", "Ganap na Tagumpay",
    ]);
    expect(badges.map((badge) => badge.progress)).toEqual([
      "1/1 distinct quiz", "5/5 distinct quizzes", "12.3/10 percentage points",
      "3/3 consecutive quizzes", "100.0% / 100%",
    ]);
    expect(badges.every((badge) => badge.unlockedAt === null)).toBe(true);
  });

  it("keeps saved unlocks even when current progress is below the threshold", () => {
    const unlockedAt = "2026-11-09T08:00:00Z";
    const badges = parseAchievements({ ...progress, streak: 0, awards: [{ badge: 4, unlockedAt }] });
    expect(badges[3].unlockedAt).toBe(unlockedAt);
    expect(badges[0].unlockedAt).toBeNull();
  });

  it("reports how close each badge is, never above 1", () => {
    const badges = parseAchievements({ ...progress, distinctQuizzes: 2, bestImprovement: 5, streak: 1, bestPercentage: 50 });
    expect(badges.map((badge) => badge.fraction)).toEqual([1, 0.4, 0.5, 1 / 3, 0.5]);
    expect(parseAchievements(progress).every((badge) => badge.fraction === 1)).toBe(true);
  });

  it("picks the closest locked badge as the next one", () => {
    const badges = parseAchievements({ awards: [{ badge: 1, unlockedAt: "2026-11-09T08:00:00Z" }], distinctQuizzes: 2, bestImprovement: 5, streak: 1, bestPercentage: 50 });
    expect(nextAchievement(badges)?.name).toBe("Patuloy na Pag-unlad");
  });

  it("has no next badge once everything is unlocked", () => {
    const awards = [1, 2, 3, 4, 5].map((badge) => ({ badge, unlockedAt: "2026-11-09T08:00:00Z" }));
    expect(nextAchievement(parseAchievements({ ...progress, awards }))).toBeNull();
  });

  it.each([null, {}, { ...progress, awards: null }, { ...progress, bestPercentage: "100" },
    { ...progress, awards: [{ badge: 1, unlockedAt: "bad-date" }] },
  ])("rejects invalid data instead of showing false locked states", (value) => {
    expect(() => parseAchievements(value)).toThrow();
  });
});
