"use client";

import { createClient } from "@/lib/supabase/client";
import type { DashboardAttempt } from "@/lib/dashboard/data";

/**
 * Retrieve every visible finished attempt of ONE quiz, identified by its unique
 * id (quiz_results.session_id), independently of dashboard summary caps.
 * Titles are never used to match: two quizzes can share one.
 */
export async function loadAllStudentAttempts(
  quizId: string,
  initial: readonly DashboardAttempt[],
  onBatch: (attempts: DashboardAttempt[]) => void,
  signal: AbortSignal,
): Promise<void> {
  const supabase = createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  signal.throwIfAborted();
  if (authError || !auth.user) throw new Error("Sign in to load student attempts.");

  const seen = new Map(
    initial
      .filter((attempt) => attempt.quizId === quizId)
      .map((attempt) => [attempt.id, attempt]),
  );
  let cursor: string | null = null;
  while (!signal.aborted) {
    // The security-invoker view retains the existing teacher/quiz RLS scope.
    let query = supabase
      .from("student_quiz_results")
      .select("attempt_id, session_id, participant_username, title, correct_count, total_questions, percentage, completed_at, attempt_number")
      .eq("session_id", quizId)
      .not("attempt_id", "is", null)
      .not("completed_at", "is", null)
      .order("attempt_id", { ascending: true })
      .limit(200);
    if (cursor) query = query.gt("attempt_id", cursor);
    const { data, error } = await query.abortSignal(signal);
    signal.throwIfAborted();
    if (error) throw new Error("Unable to load all student attempts. Please retry.");
    if (!data?.length) return;

    for (const row of data) {
      // Defence in depth: never accept a row from another quiz.
      if (!row.attempt_id || !row.completed_at || row.session_id !== quizId) continue;
      seen.set(row.attempt_id, {
        id: row.attempt_id,
        quizId,
        student: row.participant_username ?? "",
        quizTitle: row.title ?? "Untitled quiz",
        correct: row.correct_count,
        total: row.total_questions,
        percentage: row.percentage ?? 0,
        completedAt: row.completed_at,
        attemptNumber: row.attempt_number,
      });
    }
    const next = data[data.length - 1].attempt_id;
    if (!next || next === cursor) throw new Error("Unable to load all student attempts. Please retry.");
    cursor = next;
    onBatch([...seen.values()]);
    // Continue until empty, even if the server returned fewer rows than requested.
  }
}
