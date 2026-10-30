import { describe, expect, it } from "vitest";
import { MockSearchRepository } from "./mock-repository";
import { createSearchScope } from "./scope";
import { executeSearch } from "./service";
import { defaultSearchQuery } from "./url-state";
import { parseSearchQuery } from "./validation";
import type { SearchEntity, SearchRow } from "./types";

const rows: Record<SearchEntity, SearchRow[]> = {
  students: [],
  quizzes: [
    {
      session_id: "quiz-a",
      teacher_id: "teacher-a",
      teacher_username: "msantos",
      title: "Own Quiz",
      status: "ready",
      share_code: "AAA111",
      requested_question_count: 5,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    {
      session_id: "quiz-b",
      teacher_id: "teacher-b",
      teacher_username: "jdelacruz",
      title: "Other Quiz",
      status: "ready",
      share_code: "BBB222",
      requested_question_count: 8,
      created_at: "2026-01-02T00:00:00.000Z",
    },
  ],
  participants: [
    {
      attempt_id: "attempt-a",
      session_id: "quiz-a",
      teacher_id: "teacher-a",
      teacher_username: "msantos",
      title: "Own Quiz",
      share_code: "AAA111",
      participant_username: "own_student",
      correct_count: 4,
      total_questions: 5,
      answered_count: 5,
      percentage: 80,
      final_score: "4/5",
      started_at: "2026-01-01T00:00:00.000Z",
      completed_at: "2026-01-01T00:05:00.000Z",
      recorded_at: "2026-01-01T00:05:00.000Z",
    },
    {
      attempt_id: "attempt-b",
      session_id: "quiz-b",
      teacher_id: "teacher-b",
      teacher_username: "jdelacruz",
      title: "Other Quiz",
      share_code: "BBB222",
      participant_username: "other_student",
      correct_count: 6,
      total_questions: 8,
      answered_count: 8,
      percentage: 75,
      final_score: "6/8",
      started_at: "2026-01-02T00:00:00.000Z",
      completed_at: "2026-01-02T00:05:00.000Z",
      recorded_at: "2026-01-02T00:05:00.000Z",
    },
  ],
  teachers: [],
};

describe("search service role scoping", () => {
  it("only returns quizzes owned by the authenticated teacher", async () => {
    const context = createSearchScope({
      role: "teacher",
      userId: "teacher-a",
    });
    const response = await executeSearch({
      context,
      query: defaultSearchQuery("teacher", "quizzes"),
      repository: new MockSearchRepository(rows),
    });

    expect(response.items.map((item) => item.id)).toEqual(["quiz-a"]);
    expect(response.meta.scope).toBe("own-records");
  });

  it("does not widen participant results when a teacher edits the scope parameter", async () => {
    const context = createSearchScope({
      role: "teacher",
      userId: "teacher-a",
    });
    const query = parseSearchQuery(
      new URLSearchParams(
        "entity=participants&teacher_id=teacher-b",
      ),
      "teacher",
    );
    const response = await executeSearch({
      context,
      query,
      repository: new MockSearchRepository(rows),
    });

    expect(response.items.map((item) => item.id)).toEqual(["attempt-a"]);
  });

  it("derives participant status from answered and total questions", async () => {
    const context = createSearchScope({
      role: "teacher",
      userId: "teacher-a",
    });
    const response = await executeSearch({
      context,
      query: defaultSearchQuery("teacher", "participants"),
      repository: new MockSearchRepository(rows),
    });

    const [participant] = response.items;

    expect(participant).toMatchObject({
      entity: "participants",
      status: "completed",
      score: 80,
      quizTitle: "Own Quiz",
      sessionCode: "AAA111",
    });
  });

  it("allows an admin to search across teachers", async () => {
    const response = await executeSearch({
      context: createSearchScope({ role: "admin", userId: "admin-id" }),
      query: defaultSearchQuery("admin", "quizzes"),
      repository: new MockSearchRepository(rows),
    });

    expect(response.items.map((item) => item.id).sort()).toEqual([
      "quiz-a",
      "quiz-b",
    ]);
    expect(response.meta.scope).toBe("all-records");
  });
});
