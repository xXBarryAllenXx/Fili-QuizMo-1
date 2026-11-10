// lib/dashboard/teacher-sections.ts
// Pure helpers for the teacher dashboard: which section a URL belongs to, and
// the small summaries the Overview and Classes sections are built from.

import type { ClassDashboardView } from "@/lib/dashboard/data";
import type { LeaderboardEntry } from "@/lib/dashboard/leaderboard";

export const TEACHER_BASE_PATH = "/teacher-dashboard";

export const TEACHER_SECTIONS = {
  overview: { slug: "overview" },
  classes: { slug: "classes" },
  quizzes: { slug: "quizzes" },
  settings: { slug: "settings" },
} as const;

export type TeacherSectionKey = keyof typeof TEACHER_SECTIONS;

export function isTeacherSectionKey(key: string): key is TeacherSectionKey {
  return key in TEACHER_SECTIONS;
}

// Slugs from the earlier six-section dashboard keep working.
const LEGACY_SLUGS: Record<string, TeacherSectionKey> = {
  students: "classes",
  leaderboard: "classes",
  scores: "quizzes",
  assessment: "quizzes",
};

/** /teacher-dashboard/classes -> "classes". Old slugs and ?entity= links still work. */
export function teacherSectionFromUrl(
  pathname: string,
  entity: string | null,
): TeacherSectionKey {
  const segment = pathname.startsWith(TEACHER_BASE_PATH)
    ? pathname.slice(TEACHER_BASE_PATH.length).split("/").filter(Boolean)[0]
    : undefined;

  if (segment) {
    const current = (Object.keys(TEACHER_SECTIONS) as TeacherSectionKey[]).find(
      (key) => TEACHER_SECTIONS[key].slug === segment,
    );
    if (current) return current;
    if (segment in LEGACY_SLUGS) return LEGACY_SLUGS[segment];
  }

  if (entity === "student_accounts") return "classes";
  if (entity === "students" || entity === "quizzes") return "quizzes";
  return "overview";
}

export function teacherSectionHref(
  key: TeacherSectionKey,
  params: Readonly<Record<string, string | null | undefined>> = {},
): string {
  const query = new URLSearchParams();
  for (const [name, value] of Object.entries(params)) {
    if (value) query.set(name, value);
  }
  const text = query.toString();

  return `${TEACHER_BASE_PATH}/${TEACHER_SECTIONS[key].slug}${text ? `?${text}` : ""}`;
}

// The export button and the tables read `entity` from the URL: a class list
// exports student accounts, an open class or quiz exports student scores.
/** The Classes section: the class list, or one open class on a tab. */
export function classesHref(
  classId: string | null = null,
  tab: string | null = null,
): string {
  return teacherSectionHref("classes", {
    entity: classId ? "students" : "student_accounts",
    class: classId,
    tab,
  });
}

/** The Quizzes section: the list, one quiz's results, or one attempt's answers. */
export function quizzesHref(
  /** The quiz's unique id (never its title: titles can repeat). */
  quizId: string | null = null,
  attemptId: string | null = null,
  /**
   * Display name for the heading. It is also the export's title filter (the
   * shared `quiz` search param), never used to match attempts.
   */
  title: string | null = null,
): string {
  return teacherSectionHref("quizzes", {
    entity: quizId || attemptId ? "students" : "quizzes",
    quizId,
    quiz: quizId ? title : null,
    attempt: attemptId,
  });
}

export type PendingQuiz = {
  classId: string;
  className: string;
  sessionId: string;
  title: string;
  assignedCount: number;
  takenCount: number;
  notTaken: string[];
};

/** Quizzes sent to a class that some students have not taken yet, most missing first. */
export function pendingQuizzes(
  classViews: readonly ClassDashboardView[],
): PendingQuiz[] {
  return classViews
    .flatMap((view) =>
      view.quizProgress
        .filter((quiz) => quiz.notTaken.length > 0)
        .map((quiz) => ({
          classId: view.classId,
          className: view.name,
          sessionId: quiz.sessionId,
          title: quiz.title,
          assignedCount: quiz.assignedCount,
          takenCount: quiz.takenCount,
          notTaken: quiz.notTaken,
        })),
    )
    .sort(
      (left, right) =>
        right.notTaken.length - left.notTaken.length ||
        left.className.localeCompare(right.className),
    );
}

/** A class's per-student figures by lower-cased username. */
export function studentStatsByName(
  view: ClassDashboardView | undefined,
): Map<string, LeaderboardEntry> {
  const stats = new Map<string, LeaderboardEntry>();

  for (const entry of view?.leaderboards.overall.entries ?? []) {
    stats.set(entry.student.trim().toLowerCase(), entry);
  }

  return stats;
}
