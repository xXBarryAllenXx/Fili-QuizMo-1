import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadAllStudentAttempts } from "./student-attempts";
import type { DashboardAttempt } from "./data";

const { getUser, from } = vi.hoisted(() => ({ getUser: vi.fn(), from: vi.fn() }));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { getUser }, from }),
}));

type Row = {
  attempt_id: string;
  session_id: string;
  participant_username: string;
  title: string;
  correct_count: number;
  total_questions: number;
  percentage: number;
  completed_at: string;
  attempt_number: number;
};

const makeRows = (quizId: string, count: number, title = "Quiz"): Row[] =>
  Array.from({ length: count }, (_, index) => ({
    attempt_id: `${quizId}-attempt-${String(index + 1).padStart(3, "0")}`,
    session_id: quizId,
    participant_username: `${quizId} Student ${index + 1}`,
    title,
    correct_count: index,
    total_questions: 20,
    percentage: index * 5,
    completed_at: "2026-11-11T00:00:00Z",
    attempt_number: 1,
  }));

const records = makeRows("quiz-a", 13);

/** A fake `student_quiz_results` view that honours .eq() and .gt(). */
function mockView(rows: Row[], pageSize = 4, seenFilters: Record<string, unknown>[] = []) {
  from.mockImplementation((view) => {
    expect(view).toBe("student_quiz_results");
    let cursor: string | null = null;
    const filters: Record<string, unknown> = {};
    const query = {
      select: () => query,
      not: () => query,
      order: () => query,
      limit: () => query,
      eq: (column: string, value: unknown) => { filters[column] = value; return query; },
      gt: (_column: string, value: string) => { cursor = value; return query; },
      abortSignal: async () => {
        seenFilters.push({ ...filters, cursor });
        return {
          data: rows
            .filter((row) => Object.entries(filters).every(([k, v]) => (row as Record<string, unknown>)[k] === v))
            .filter((row) => !cursor || row.attempt_id > cursor)
            .sort((a, b) => a.attempt_id.localeCompare(b.attempt_id))
            .slice(0, pageSize),
          error: null,
        };
      },
    };
    return query;
  });
}

const attempt = (id: string, quizId: string, title = "Quiz"): DashboardAttempt => ({
  id, quizId, student: "Old name", quizTitle: title, correct: 0,
  total: 20, percentage: 0, completedAt: records[0].completed_at, attemptNumber: 1,
});

beforeEach(() => {
  vi.clearAllMocks();
  getUser.mockResolvedValue({ data: { user: { id: "teacher" } }, error: null });
});

describe("automatic student attempt loading", () => {
  it("reads every backend batch, even below the requested size, with no duplicates", async () => {
    const seen: Record<string, unknown>[] = [];
    mockView(records, 4, seen);
    const batches: DashboardAttempt[][] = [];
    await loadAllStudentAttempts(
      "quiz-a",
      [attempt("quiz-a-attempt-001", "quiz-a")],
      (rows) => batches.push(rows),
      new AbortController().signal,
    );
    const loaded = batches[batches.length - 1];
    expect(loaded.map((row) => row.id)).toEqual(records.map((row) => row.attempt_id));
    expect(new Set(loaded.map((row) => row.id)).size).toBe(13);
    expect(loaded[0].student).toBe("quiz-a Student 1");
    expect(seen.map((entry) => entry.cursor)).toEqual([
      null, "quiz-a-attempt-004", "quiz-a-attempt-008", "quiz-a-attempt-012", "quiz-a-attempt-013",
    ]);
  });

  it("filters every request, including follow-up batches, by the quiz id", async () => {
    const seen: Record<string, unknown>[] = [];
    mockView([...makeRows("quiz-a", 9), ...makeRows("quiz-b", 5)], 4, seen);
    await loadAllStudentAttempts("quiz-b", [], vi.fn(), new AbortController().signal);
    expect(seen.length).toBeGreaterThan(1);
    for (const entry of seen) expect(entry.session_id).toBe("quiz-b");
  });

  it("keeps quizzes that share a title apart", async () => {
    mockView([...makeRows("quiz-a", 3, "Same title"), ...makeRows("quiz-b", 2, "Same title")]);
    const batches: DashboardAttempt[][] = [];
    await loadAllStudentAttempts("quiz-b", [], (rows) => batches.push(rows), new AbortController().signal);
    const loaded = batches[batches.length - 1];
    expect(loaded).toHaveLength(2);
    expect(loaded.every((row) => row.quizId === "quiz-b" && row.quizTitle === "Same title")).toBe(true);
  });

  it("drops seeded attempts and stray rows that belong to another quiz", async () => {
    // A view that (wrongly) ignores the filter must still not leak rows.
    from.mockImplementation(() => {
      const query = {
        select: () => query, not: () => query, order: () => query, limit: () => query,
        eq: () => query, gt: () => query,
        abortSignal: async () => ({ data: [...makeRows("quiz-a", 2), ...makeRows("quiz-b", 2)].slice(0, 4), error: null }),
      };
      return query;
    });
    const controller = new AbortController();
    const batches: DashboardAttempt[][] = [];
    await loadAllStudentAttempts(
      "quiz-b",
      [attempt("quiz-a-seed", "quiz-a"), attempt("quiz-b-seed", "quiz-b")],
      (rows) => {
        batches.push(rows);
        controller.abort();
      },
      controller.signal,
    ).catch(() => undefined);
    const loaded = batches[0];
    expect(loaded.every((row) => row.quizId === "quiz-b")).toBe(true);
    expect(loaded.map((row) => row.id)).toContain("quiz-b-seed");
    expect(loaded.map((row) => row.id)).not.toContain("quiz-a-seed");
  });

  it("rapid switching: an aborted quiz load never reports rows after being superseded", async () => {
    mockView([...makeRows("quiz-a", 12), ...makeRows("quiz-b", 12)], 4);
    const first = new AbortController();
    const second = new AbortController();
    const reportedByFirst: DashboardAttempt[][] = [];
    const reportedBySecond: DashboardAttempt[][] = [];

    const loadA = loadAllStudentAttempts("quiz-a", [], (rows) => {
      reportedByFirst.push(rows);
      first.abort(); // teacher switches to quiz B after the first batch
    }, first.signal).catch(() => undefined);
    const loadB = loadAllStudentAttempts("quiz-b", [], (rows) => reportedBySecond.push(rows), second.signal);
    await Promise.all([loadA, loadB]);

    expect(reportedByFirst).toHaveLength(1);
    expect(reportedByFirst[0].every((row) => row.quizId === "quiz-a")).toBe(true);
    const finalB = reportedBySecond[reportedBySecond.length - 1];
    expect(finalB).toHaveLength(12);
    expect(finalB.every((row) => row.quizId === "quiz-b")).toBe(true);
  });

  it("does not query attempts when signed out", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(loadAllStudentAttempts("quiz-a", [], vi.fn(), new AbortController().signal)).rejects.toThrow("Sign in");
    expect(from).not.toHaveBeenCalled();
  });

  it("stops loading when the section is unmounted", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(loadAllStudentAttempts("quiz-a", [], vi.fn(), controller.signal)).rejects.toMatchObject({ name: "AbortError" });
    expect(from).not.toHaveBeenCalled();
  });
});
