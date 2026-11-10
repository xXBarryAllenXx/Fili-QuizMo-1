import { describe, expect, it } from "vitest";
import { upNextQuizzes } from "./assigned-quizzes-section";
import type { AssignedQuiz } from "@/lib/classes/client";

function quiz(overrides: Partial<AssignedQuiz>): AssignedQuiz {
  return {
    sessionId: "s",
    title: "Quiz",
    gameMode: "classic",
    teacherUsername: "teacher",
    totalQuestions: 10,
    isTimeAttack: false,
    timeAttackSeconds: 0,
    maxAttempts: 2,
    attemptsUsed: 0,
    attemptsRemaining: 2,
    completed: false,
    expiresAt: null,
    isExpired: false,
    assignedAt: null,
    ...overrides,
  };
}

describe("upNextQuizzes", () => {
  it("keeps only quizzes still to do", () => {
    const result = upNextQuizzes(
      [
        quiz({ sessionId: "todo" }),
        quiz({ sessionId: "done", completed: true }),
        quiz({ sessionId: "closed", isExpired: true }),
        quiz({ sessionId: "none-left", attemptsRemaining: 0 }),
      ],
      5,
    );
    expect(result.map((item) => item.sessionId)).toEqual(["todo"]);
  });

  it("orders by soonest deadline, with no-deadline quizzes last", () => {
    const result = upNextQuizzes(
      [
        quiz({ sessionId: "open-ended" }),
        quiz({ sessionId: "later", expiresAt: "2026-11-20T00:00:00Z" }),
        quiz({ sessionId: "sooner", expiresAt: "2026-11-12T00:00:00Z" }),
        quiz({ sessionId: "also-open-ended" }),
      ],
      5,
    );
    expect(result.map((item) => item.sessionId)).toEqual([
      "sooner",
      "later",
      "open-ended",
      "also-open-ended",
    ]);
  });

  it("limits the list and does not change the input order", () => {
    const input = [
      quiz({ sessionId: "b", expiresAt: "2026-11-20T00:00:00Z" }),
      quiz({ sessionId: "a", expiresAt: "2026-11-12T00:00:00Z" }),
    ];
    expect(upNextQuizzes(input, 1).map((item) => item.sessionId)).toEqual(["a"]);
    expect(input.map((item) => item.sessionId)).toEqual(["b", "a"]);
  });
});
