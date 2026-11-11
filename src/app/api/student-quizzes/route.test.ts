import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchError } from "@/lib/search/errors";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  resolveSearchContext: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

vi.mock("@/lib/search/auth", () => ({
  resolveSearchContext: mocks.resolveSearchContext,
}));

import { GET } from "./route";

const STUDENT_ID = "3F2504E0-4F89-41D3-9A0C-0305E82C3301";
const url = (id: string) =>
  `http://localhost/api/student-quizzes?studentId=${id}`;

type Result = { data: unknown; error: { message: string } | null };

/** A tiny stand-in for the Supabase query builder that records the calls made. */
function fakeSupabase(options: {
  profile?: Result;
  sessions?: Result;
  results?: Result;
  durations?: Result;
  teachers?: Result;
}) {
  const calls: Array<[string, ...unknown[]]> = [];
  const empty: Result = { data: [], error: null };
  const results: Record<string, Result> = {
    account_profiles: options.profile ?? {
      data: { user_id: STUDENT_ID.toLowerCase(), username: "Maria" },
      error: null,
    },
    quiz_sessions: options.sessions ?? {
      data: [{ session_id: "session-1", teacher_id: "teacher-1" }],
      error: null,
    },
    student_quiz_results: options.results ?? empty,
    teacher_student_scores: options.durations ?? empty,
    teachers: options.teachers ?? {
      data: [{ user_id: "teacher-1" }],
      error: null,
    },
  };

  function builder(table: string, result: Result) {
    const chain: Record<string, unknown> = {};
    for (const method of ["select", "eq", "ilike", "in", "order", "limit"]) {
      chain[method] = (...args: unknown[]) => {
        calls.push([`${table}.${method}`, ...args]);
        return chain;
      };
    }
    chain.maybeSingle = () => Promise.resolve(result);
    chain.then = (resolve: (value: Result) => unknown) =>
      Promise.resolve(result).then(resolve);
    return chain;
  }

  return {
    calls,
    client: {
      auth: {
        getUser: () =>
          Promise.resolve({ data: { user: { id: "teacher-1" } }, error: null }),
        mfa: {
          getAuthenticatorAssuranceLevel: () =>
            Promise.resolve({ data: { currentLevel: "aal2" }, error: null }),
        },
      },
      from: (table: string) => builder(table, results[table] ?? empty),
    },
  };
}

/** A row of the student_quiz_results view, as the dashboard reads it. */
function row(index: number) {
  return {
    attempt_id: `attempt-${index}`,
    session_id: "session-1",
    title: ` Quiz ${index} `,
    participant_username: "Maria",
    attempt_number: 1,
    correct_count: 4,
    total_questions: 5,
    percentage: 80,
    completed_at: `2026-11-0${index + 1}T01:05:00Z`,
  };
}

describe("student quizzes route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.resolveSearchContext.mockResolvedValue({ role: "teacher" });
  });

  it.each(["", "not-a-uuid", "1; drop table quizzes"])(
    "rejects an invalid student id %j before touching the database",
    async (id) => {
      const response = await GET(new Request(url(encodeURIComponent(id))));

      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        error: { code: "INVALID_STUDENT" },
      });
      expect(mocks.createClient).not.toHaveBeenCalled();
    },
  );

  it("passes through authentication and role errors", async () => {
    mocks.createClient.mockResolvedValue(fakeSupabase({}).client);
    mocks.resolveSearchContext.mockRejectedValue(
      new SearchError(401, "UNAUTHENTICATED", "Sign in to search records."),
    );

    const response = await GET(new Request(url(STUDENT_ID)));

    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("returns 404 when the student is not visible to this teacher", async () => {
    const { client, calls } = fakeSupabase({
      profile: { data: null, error: null },
    });
    mocks.createClient.mockResolvedValue(client);

    const response = await GET(new Request(url(STUDENT_ID)));

    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({
      error: { code: "STUDENT_NOT_FOUND" },
    });
    expect(calls.some(([name]) => name.startsWith("student_quiz_results"))).toBe(
      false,
    );
  });

  it("returns the student's finished quizzes, newest first", async () => {
    const { client, calls } = fakeSupabase({
      results: { data: [row(1), row(2)], error: null },
      durations: {
        data: [{ attempt_id: "attempt-2", duration_seconds: 300 }],
        error: null,
      },
    });
    mocks.createClient.mockResolvedValue(client);

    const response = await GET(new Request(url(STUDENT_ID)));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      student: { id: STUDENT_ID.toLowerCase(), username: "Maria" },
      scope: "own-quizzes",
      truncated: false,
    });
    expect(
      body.quizzes.map((quiz: { attemptId: string }) => quiz.attemptId),
    ).toEqual(["attempt-2", "attempt-1"]);
    expect(body.quizzes[0]).toMatchObject({
      attemptId: "attempt-2",
      attemptNumber: 1,
      correctCount: 4,
      totalQuestions: 5,
      percentage: 80,
      durationSeconds: 300,
    });
    expect(body.quizzes[1].durationSeconds).toBeNull();
    expect(JSON.stringify(body)).not.toMatch(/correct_?answer|email/i);
    // A teacher only sees attempts on quizzes they own.
    expect(calls).toContainEqual(["quiz_sessions.eq", "teacher_id", "teacher-1"]);
    expect(calls).toContainEqual(["account_profiles.eq", "role", "student"]);
    expect(calls).toContainEqual([
      "student_quiz_results.order",
      "completed_at",
      { ascending: false },
    ]);
  });

  it("only includes attempts by the matching student name", async () => {
    mocks.createClient.mockResolvedValue(
      fakeSupabase({
        results: {
          data: [row(1), { ...row(2), participant_username: "Maria Clara" }],
          error: null,
        },
      }).client,
    );

    const body = await (await GET(new Request(url(STUDENT_ID)))).json();

    expect(body.quizzes).toHaveLength(1);
    expect(body.quizzes[0].attemptId).toBe("attempt-1");
  });

  it("reports the wider scope for an admin", async () => {
    mocks.resolveSearchContext.mockResolvedValue({ role: "admin" });
    mocks.createClient.mockResolvedValue(fakeSupabase({}).client);

    const body = await (await GET(new Request(url(STUDENT_ID)))).json();

    expect(body.scope).toBe("all-quizzes");
    expect(body.quizzes).toEqual([]);
  });

  it("says when the result list was cut off at the database limit", async () => {
    const rows = Array.from({ length: 1000 }, (_, index) => ({
      ...row(1),
      attempt_id: `attempt-${index}`,
    }));
    mocks.createClient.mockResolvedValue(
      fakeSupabase({ results: { data: rows, error: null } }).client,
    );

    const body = await (await GET(new Request(url(STUDENT_ID)))).json();

    expect(body.truncated).toBe(true);
  });

  it("tolerates missing numbers in a row", async () => {
    mocks.createClient.mockResolvedValue(
      fakeSupabase({
        results: {
          data: [{ ...row(1), percentage: null, correct_count: null }],
          error: null,
        },
      }).client,
    );

    const body = await (await GET(new Request(url(STUDENT_ID)))).json();

    expect(body.quizzes[0]).toMatchObject({
      durationSeconds: null,
      correctCount: null,
    });
  });

  it("hides database error details", async () => {
    mocks.createClient.mockResolvedValue(
      fakeSupabase({
        results: { data: null, error: { message: "secret relation detail" } },
      }).client,
    );

    const response = await GET(new Request(url(STUDENT_ID)));

    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("secret");
  });

  it("hides profile lookup failures too", async () => {
    mocks.createClient.mockResolvedValue(
      fakeSupabase({
        profile: { data: null, error: { message: "secret profile detail" } },
      }).client,
    );

    const response = await GET(new Request(url(STUDENT_ID)));

    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("secret");
  });

  it("turns unexpected failures into a safe 500", async () => {
    mocks.createClient.mockRejectedValue(new Error("secret connection string"));

    const response = await GET(new Request(url(STUDENT_ID)));

    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("secret");
  });
});
