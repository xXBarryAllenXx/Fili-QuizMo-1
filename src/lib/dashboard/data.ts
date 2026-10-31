import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type {
  AdminDashboardData,
  ScoreBand,
  ScoreDistribution,
  TeacherDashboardData,
  TeacherResult,
} from "./types";

type DashboardClient = SupabaseClient<Database>;

const SCORE_BANDS: readonly {
  label: string;
  minimum: number;
  color: string;
}[] = [
  { label: "Excellent (90–100)", minimum: 90, color: "#0f1f3d" },
  { label: "Good (75–89)", minimum: 75, color: "#1d4ed8" },
  { label: "Needs Improvement (50–74)", minimum: 50, color: "#60a5fa" },
  { label: "At Risk (below 50)", minimum: 0, color: "#cbd5e1" },
];

function errorMessage(label: string, message: string): string {
  return `${label} could not be loaded: ${message}`;
}

function percentValues(counts: number[]): number[] {
  const total = counts.reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return counts.map(() => 0);
  }

  const values = counts.map((count) => Math.round((count / total) * 100));
  const difference =
    100 - values.reduce((sum, value) => sum + value, 0);

  if (difference !== 0 && values.length > 0) {
    const largestIndex = values.indexOf(Math.max(...values));
    values[largestIndex] += difference;
  }

  return values;
}

export function buildScoreDistributions(
  results: readonly TeacherResult[],
): ScoreDistribution[] {
  const grouped = new Map<string, TeacherResult[]>();

  for (const result of results) {
    const key = result.title || "Untitled quiz";
    const existing = grouped.get(key);

    if (existing) {
      existing.push(result);
    } else {
      grouped.set(key, [result]);
    }
  }

  return Array.from(grouped.entries()).map(([quiz, quizResults]) => {
    // Bands are ordered highest-first, so each score belongs to the first
    // band whose minimum it reaches.
    const bandCounts = SCORE_BANDS.map((band, index) => {
      const nextMinimum = SCORE_BANDS[index - 1]?.minimum;

      return quizResults.filter(
        (result) =>
          result.percentage >= band.minimum &&
          (nextMinimum === undefined || result.percentage < nextMinimum),
      ).length;
    });

    const values = percentValues(bandCounts);
    const average =
      quizResults.reduce((sum, result) => sum + result.percentage, 0) /
      Math.max(quizResults.length, 1);

    const bands: ScoreBand[] = SCORE_BANDS.map((band, index) => ({
      label: band.label,
      value: values[index],
      color: band.color,
    }));

    return {
      quiz,
      average: Math.round(average),
      bands,
    };
  });
}

export async function getAdminDashboardData(
  client: DashboardClient,
  email: string,
): Promise<AdminDashboardData> {
  const [quizzes, readyQuizzes, results] = await Promise.all([
    client
      .from("quizzes")
      .select("session_id", { count: "exact", head: true }),
    client
      .from("quizzes")
      .select("session_id", { count: "exact", head: true })
      .eq("status", "ready"),
    client
      .from("quiz_results")
      .select("attempt_id", { count: "exact", head: true }),
  ]);

  const errors: string[] = [];

  if (quizzes.error) {
    errors.push(errorMessage("Quizzes", quizzes.error.message));
  }
  if (readyQuizzes.error) {
    errors.push(
      errorMessage("Ready quizzes", readyQuizzes.error.message),
    );
  }
  if (results.error) {
    errors.push(errorMessage("Quiz results", results.error.message));
  }

  return {
    email,
    stats: {
      totalQuizzes: quizzes.count ?? 0,
      readyQuizzes: readyQuizzes.count ?? 0,
      totalResults: results.count ?? 0,
    },
    errors,
  };
}

function usernameFromEmail(email: string | null | undefined): string {
  const localPart = email?.split("@")[0]?.trim();

  return localPart || "Teacher";
}

export async function getTeacherDashboardData(
  client: DashboardClient,
  user: { id: string; email?: string | null },
): Promise<TeacherDashboardData> {
  const errors: string[] = [];
  const email = user.email?.trim() ?? "";

  const { data: teacherAccount, error: teacherError } = await client
    .from("teachers")
    .select("id, username")
    .eq("user_id", user.id)
    .maybeSingle();

  if (teacherError) {
    errors.push(errorMessage("Your teacher account", teacherError.message));
  }

  const teacherNumericId = teacherAccount?.id ?? null;
  let quizRows: Array<{
    session_id: string;
    title: string | null;
    status: string;
    share_code: string | null;
    requested_question_count: number | null;
    created_at: string;
  }> = [];

  if (teacherNumericId !== null) {
    const { data, error } = await client
      .from("quizzes")
      .select(
        "session_id, title, status, share_code, requested_question_count, created_at",
      )
      .eq("teacher_id", teacherNumericId)
      .order("created_at", { ascending: false });

    if (error) {
      errors.push(errorMessage("Your quizzes", error.message));
    } else {
      quizRows = data ?? [];
    }
  }

  const sessions = quizRows;
  const questionCounts = new Map<string, number>();

  if (sessions.length > 0) {
    const { data: questionRows, error: questionError } = await client
      .from("quiz_questions")
      .select("session_id")
      .in(
        "session_id",
        sessions.map((session) => session.session_id),
      );

    if (questionError) {
      errors.push(
        errorMessage("Quiz questions", questionError.message),
      );
    } else {
      for (const question of questionRows ?? []) {
        questionCounts.set(
          question.session_id,
          (questionCounts.get(question.session_id) ?? 0) + 1,
        );
      }
    }
  }

  const { data: resultRows, error: resultError } = await client
    .from("quiz_results")
    .select(
      "attempt_id, session_id, title, participant_username, correct_count, total_questions, answered_count, percentage, final_score, share_code, completed_at, recorded_at, teacher_username",
    )
    .eq("teacher_id", user.id)
    .order("recorded_at", { ascending: false });

  if (resultError) {
    errors.push(errorMessage("Quiz results", resultError.message));
  }

  const quizzes = sessions.map((session) => ({
    sessionId: session.session_id,
    title: session.title?.trim() || "Untitled quiz",
    status: session.status,
    shareCode: session.share_code,
    questionCount:
      questionCounts.get(session.session_id) ??
      session.requested_question_count ??
      0,
    createdAt: session.created_at,
  }));

  const results: TeacherResult[] = (resultRows ?? []).map((result) => ({
    attemptId: result.attempt_id,
    sessionId: result.session_id,
    title: result.title?.trim() || "Untitled quiz",
    participantUsername: result.participant_username,
    correctCount: result.correct_count,
    totalQuestions: result.total_questions,
    answeredCount: result.answered_count,
    percentage: Number(result.percentage),
    finalScore: result.final_score,
    shareCode: result.share_code,
    status:
      result.total_questions > 0 &&
      result.answered_count >= result.total_questions
        ? "completed"
        : "in_progress",
    completedAt: result.completed_at,
    recordedAt: result.recorded_at,
  }));

  const username =
    teacherAccount?.username?.trim() ||
    resultRows?.find((result) => result.teacher_username)?.teacher_username ||
    usernameFromEmail(email);

  const completedResults = results.filter(
    (result) => result.status === "completed",
  ).length;
  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce((sum, result) => sum + result.percentage, 0) /
            results.length,
        )
      : 0;

  return {
    teacherId: user.id,
    teacherNumericId,
    username,
    email,
    stats: {
      totalQuizzes: quizzes.length,
      totalResults: results.length,
      completedResults,
      averageScore,
    },
    quizzes,
    results,
    distributions: buildScoreDistributions(results),
    errors,
  };
}
