import { describe, expect, it } from "vitest";
import { buildAssessment } from "./assessment";

const choices = ["isa", "dalawa", "tatlo", "apat"];

function payload(
  items: { answer: string | null; points?: number }[],
  attempt: { correct: number; total: number; answered: number },
) {
  return {
    attempt: {
      attempt_id: "a1",
      quiz_title: "Quiz",
      attempt_number: 1,
      completed_at: "2026-11-10T00:00:00Z",
      percentage: (attempt.correct / attempt.total) * 100,
      correct_count: attempt.correct,
      total_questions: attempt.total,
      answered_count: attempt.answered,
    },
    questions: items.map((item, index) => ({
      question_id: `q${index + 1}`,
      question_text: `Tanong ${index + 1}`,
      choices,
      correct_answer: "isa",
      user_answer: item.answer,
      ...(item.points === undefined ? {} : { points: item.points }),
    })),
    feedback: [],
  };
}

describe("assessment of a weighted quiz", () => {
  // Items 1-2 are worth 1 point, items 3-4 are worth 2: 6 points possible.
  const items = [
    { answer: "isa", points: 1 }, // right, 1
    { answer: "dalawa", points: 1 }, // wrong, 1
    { answer: "isa", points: 2 }, // right, 2
    { answer: null, points: 2 }, // skipped, 2
  ];

  it("explains the recorded points instead of flagging a mismatch", () => {
    const assessment = buildAssessment(
      payload(items, { correct: 3, total: 6, answered: 3 }),
    );

    expect(assessment).not.toBeNull();
    expect(assessment!.consistent).toBe(true);
    expect(assessment!.summary).toEqual({
      correct: 3,
      wrong: 1,
      skipped: 2,
      total: 6,
      weighted: true,
    });
    expect(assessment!.questions.map((q) => q.points)).toEqual([1, 1, 2, 2]);
  });

  it("still flags a score that does not match the questions", () => {
    const assessment = buildAssessment(
      payload(items, { correct: 5, total: 6, answered: 3 }),
    );

    expect(assessment!.consistent).toBe(false);
  });
});

describe("assessment of a normal quiz", () => {
  const items = [{ answer: "isa" }, { answer: "dalawa" }, { answer: null }];

  it("is unchanged when no question has points", () => {
    const assessment = buildAssessment(
      payload(items, { correct: 1, total: 3, answered: 2 }),
    );

    expect(assessment!.consistent).toBe(true);
    expect(assessment!.summary).toEqual({
      correct: 1,
      wrong: 1,
      skipped: 1,
      total: 3,
      weighted: false,
    });
  });

  it("treats questions worth 1 point each as a normal quiz", () => {
    const assessment = buildAssessment(
      payload(
        items.map((item) => ({ ...item, points: 1 })),
        { correct: 1, total: 3, answered: 2 },
      ),
    );

    expect(assessment!.summary.weighted).toBe(false);
    expect(assessment!.consistent).toBe(true);
  });
});
