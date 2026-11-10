// lib/dashboard/leaderboard.ts
// Pure helpers: rank students from quiz_results rows. Scores are 0-100 percentages.
// Ranking still uses the percentage; `bestRaw` is only for display (e.g. "8/10").
// `points` is a separate, display-only column (see POINTS below for the rule).

import { formatRawScore } from "./raw-score";

/**
 * How points are earned. Every number here is shown to teachers on the
 * leaderboard, so change them here and the explanation stays in step.
 *
 * Per quiz a student has taken (only their BEST attempt on that quiz counts,
 * so retaking over and over cannot pile up points). A quiz is one quiz
 * session, not one title: two different quizzes that happen to share a title
 * are worth points separately:
 *   best score % / 10, rounded   -> 0 to 10 points for how well they did
 *   + completion                  -> for finishing the quiz at all
 *   + perfect                     -> extra for a 100% score
 * A student's points are the sum over the quizzes on that board, so the
 * overall board adds up every quiz and a single-quiz board is at most
 * MAX_POINTS_PER_QUIZ.
 */
export const POINTS = {
  scoreDivisor: 10,
  completion: 2,
  perfect: 3,
} as const;

export const MAX_POINTS_PER_QUIZ =
  100 / POINTS.scoreDivisor + POINTS.completion + POINTS.perfect;

/** Points one quiz is worth, from the student's best percentage on it. */
export function quizPoints(bestPercentage: number): number {
  const clamped = Math.min(100, Math.max(0, bestPercentage));

  return (
    Math.round(clamped / POINTS.scoreDivisor) +
    POINTS.completion +
    (clamped >= 100 ? POINTS.perfect : 0)
  );
}

export type LeaderboardEntry = {
  rank: number;
  student: string;
  /** Average % across the attempts counted on this board. */
  average: number;
  /** Highest single-attempt %. */
  best: number;
  /** Raw score of the best attempt, e.g. "8/10". null if counts are missing. */
  bestRaw: string | null;
  attempts: number;
  lastCompletedAt: string;
  /** Points earned on this board. See POINTS for the rule. */
  points: number;
};

export type Leaderboard = {
  /** null = all quizzes combined. */
  quiz: string | null;
  /** Overall board ranks by average; a single-quiz board ranks by best attempt. */
  rankedBy: "average" | "best";
  entries: LeaderboardEntry[];
};

export type LeaderboardData = {
  overall: Leaderboard;
  byQuiz: Leaderboard[];
};

type ResultLike = {
  /** Identifies the quiz. Falls back to the title only when it is missing. */
  session_id?: string | null;
  title: string;
  participant_username: string;
  percentage: number | string;
  correct_count?: number | string | null;
  total_questions?: number | string | null;
  completed_at: string;
};

const MAX_ENTRIES = 10;
const MAX_QUIZZES = 6;

const round1 = (n: number) => Math.round(n * 10) / 10;

/** One quiz = one session. Rows without a session id fall back to the title. */
function quizKey(row: ResultLike): string {
  return row.session_id ? `session:${row.session_id}` : `title:${row.title}`;
}

function toScore(value: number | string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function rankStudents(
  rows: readonly ResultLike[],
  rankedBy: "average" | "best",
  limit = MAX_ENTRIES,
): LeaderboardEntry[] {
  const byStudent = new Map<
    string,
    {
      student: string;
      scores: number[];
      lastTime: number;
      lastIso: string;
      bestScore: number;
      bestRaw: string | null;
      /** Best percentage per quiz (session), for points. */
      bestByQuiz: Map<string, number>;
    }
  >();

  for (const row of rows) {
    const name = row.participant_username?.trim();
    if (!name) continue;

    const key = name.toLowerCase();
    const entry = byStudent.get(key) ?? {
      student: name,
      scores: [],
      lastTime: 0,
      lastIso: row.completed_at,
      bestScore: Number.NEGATIVE_INFINITY,
      bestRaw: null,
      bestByQuiz: new Map<string, number>(),
    };
    const time = Date.parse(row.completed_at) || 0;
    const score = toScore(row.percentage);
    const raw = formatRawScore(row.correct_count, row.total_questions);

    // Keep the raw score of the highest-percentage attempt (first one on a tie).
    if (score > entry.bestScore || (score === entry.bestScore && !entry.bestRaw)) {
      entry.bestScore = score;
      entry.bestRaw = raw;
    }

    const quiz = quizKey(row);
    entry.bestByQuiz.set(
      quiz,
      Math.max(entry.bestByQuiz.get(quiz) ?? 0, score),
    );

    entry.scores.push(score);
    if (time >= entry.lastTime) {
      entry.lastTime = time;
      entry.lastIso = row.completed_at;
    }
    byStudent.set(key, entry);
  }

  const stats = [...byStudent.values()].map((entry) => ({
    student: entry.student,
    average: round1(
      entry.scores.reduce((sum, score) => sum + score, 0) / entry.scores.length,
    ),
    best: Math.max(...entry.scores),
    bestRaw: entry.bestRaw,
    attempts: entry.scores.length,
    lastCompletedAt: entry.lastIso,
    points: [...entry.bestByQuiz.values()].reduce(
      (sum, best) => sum + quizPoints(best),
      0,
    ),
  }));

  const primary = (s: (typeof stats)[number]) =>
    rankedBy === "best" ? s.best : s.average;
  const secondary = (s: (typeof stats)[number]) =>
    rankedBy === "best" ? s.average : s.best;

  stats.sort(
    (a, b) =>
      primary(b) - primary(a) ||
      secondary(b) - secondary(a) ||
      b.attempts - a.attempts ||
      a.student.localeCompare(b.student),
  );

  const ranked: LeaderboardEntry[] = [];
  stats.slice(0, limit).forEach((current, index) => {
    const previous = ranked[index - 1];
    const tied =
      previous !== undefined &&
      primary(previous) === primary(current) &&
      secondary(previous) === secondary(current) &&
      previous.attempts === current.attempts;

    ranked.push({ rank: tied ? previous.rank : index + 1, ...current });
  });

  return ranked;
}

export function buildLeaderboards(
  rows: readonly ResultLike[],
  /** Students shown per board. Classes are small, so they ask for more. */
  limit = MAX_ENTRIES,
): LeaderboardData {
  const byQuizKey = new Map<
    string,
    { title: string; rows: ResultLike[]; latest: number }
  >();

  for (const row of rows) {
    const key = quizKey(row);
    const group = byQuizKey.get(key) ?? {
      title: row.title,
      rows: [],
      latest: 0,
    };
    group.rows.push(row);
    group.latest = Math.max(group.latest, Date.parse(row.completed_at) || 0);
    byQuizKey.set(key, group);
  }

  const groups = [...byQuizKey.values()]
    .sort((left, right) => right.latest - left.latest)
    .slice(0, MAX_QUIZZES);

  // Different quizzes can share a title; number them so the picker can tell
  // them apart (most recently active first).
  const titleCount = new Map<string, number>();
  for (const group of groups) {
    titleCount.set(group.title, (titleCount.get(group.title) ?? 0) + 1);
  }
  const seen = new Map<string, number>();

  const byQuiz = groups
    .map((group): Leaderboard => {
      const position = (seen.get(group.title) ?? 0) + 1;
      seen.set(group.title, position);

      return {
        quiz:
          (titleCount.get(group.title) ?? 1) > 1
            ? `${group.title} (${position})`
            : group.title,
        rankedBy: "best",
        entries: rankStudents(group.rows, "best", limit),
      };
    })
    .filter((board) => board.entries.length > 0);

  return {
    overall: {
      quiz: null,
      rankedBy: "average",
      entries: rankStudents(rows, "average", limit),
    },
    byQuiz,
  };
}
