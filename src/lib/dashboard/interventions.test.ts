import { describe, expect, it } from "vitest";
import { activeAlerts, type InterventionRecord } from "./interventions";
import {
  lowScoreAttempts,
  teacherNotices,
  type NoticeRow,
} from "./performance-notice";

const NOW = Date.parse("2026-11-12T00:00:00Z");

const row = (
  id: string,
  student: string,
  percentage: number,
  completedAt: string,
): NoticeRow => ({
  id,
  student,
  studentId: `acct-${student}`,
  quizId: "quiz-1",
  title: "Quiz",
  percentage,
  correct: 2,
  total: 10,
  completedAt,
});

const record = (
  attemptId: string,
  status: InterventionRecord["status"],
): InterventionRecord => ({
  attemptId,
  studentId: "acct-ana",
  quizId: "quiz-1",
  teacherId: "t1",
  status,
  note: "Reviewed answers",
  studentName: "ana",
  quizTitle: "Quiz",
  percentage: 20,
  correct: 2,
  total: 10,
  createdAt: "2026-11-10T00:00:00Z",
  addressedAt: status === "addressed" ? "2026-11-11T00:00:00Z" : null,
});

describe("intervention alerts", () => {
  const low = row("a1", "ana", 20, "2026-11-10T00:00:00Z");

  it("a low score is a Needs Attention alert", () => {
    const alerts = activeAlerts(lowScoreAttempts([low], NOW), []);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].status).toBe("needs_attention");
  });

  it("a started intervention is In Progress and still counts", () => {
    const alerts = activeAlerts(lowScoreAttempts([low], NOW), [
      record("a1", "in_progress"),
    ]);
    expect(alerts.map((a) => a.status)).toEqual(["in_progress"]);
    expect(teacherNotices([low], NOW, new Set())[0].tone).toBe("warning");
  });

  it("an addressed alert leaves the active list and the count", () => {
    const alerts = activeAlerts(lowScoreAttempts([low], NOW), [
      record("a1", "addressed"),
    ]);
    expect(alerts).toHaveLength(0);
    expect(teacherNotices([low], NOW, new Set(["a1"]))).toEqual([]);
  });

  it("a new low attempt is a new alert and does not reopen the old one", () => {
    const next = row("a2", "ana", 10, "2026-11-11T00:00:00Z");
    const alerts = activeAlerts(lowScoreAttempts([low, next], NOW), [
      record("a1", "addressed"),
    ]);
    expect(alerts.map((a) => a.attemptId)).toEqual(["a2"]);
  });

  it("the same attempt never produces two alerts", () => {
    const alerts = activeAlerts(lowScoreAttempts([low, low], NOW), []);
    expect(alerts).toHaveLength(1);
  });

  it("keeps two students with the same name separate", () => {
    const first = { ...row("s1", "sam", 20, "2026-11-10T00:00:00Z"), studentId: "acct-1" };
    const second = { ...row("s2", "sam", 30, "2026-11-10T00:00:00Z"), studentId: "acct-2" };

    const alerts = activeAlerts(lowScoreAttempts([first, second], NOW), []);

    expect(alerts.map((a) => a.attemptId).sort()).toEqual(["s1", "s2"]);
    expect(alerts.map((a) => a.studentId).sort()).toEqual(["acct-1", "acct-2"]);
    expect(teacherNotices([first, second], NOW)[0].title).toBe(
      "2 students need help:",
    );
  });

  it("keeps one student together even if the display name differs", () => {
    const older = { ...row("n1", "Sam", 20, "2026-11-09T00:00:00Z"), studentId: "acct-1" };
    const newer = { ...row("n2", "Samuel", 80, "2026-11-10T00:00:00Z"), studentId: "acct-1" };

    // Their latest attempt is good, so there is nothing to alert.
    expect(lowScoreAttempts([older, newer], NOW)).toEqual([]);
  });

  it("falls back to the name when an attempt has no student id", () => {
    const a = { ...row("g1", "Guest", 20, "2026-11-09T00:00:00Z"), studentId: null };
    const b = { ...row("g2", "guest", 25, "2026-11-10T00:00:00Z"), studentId: null };

    expect(lowScoreAttempts([a, b], NOW).map((r) => r.id)).toEqual(["g2"]);
  });

  it("keeps the existing threshold (50%) unchanged", () => {
    expect(lowScoreAttempts([row("b", "bo", 50, "2026-11-10T00:00:00Z")], NOW)).toEqual([]);
    expect(lowScoreAttempts([row("c", "cy", 49, "2026-11-10T00:00:00Z")], NOW)).toHaveLength(1);
  });
});
