"use client";

import { ClassRanking } from "@/components/dashboard/class-ranking";
import { StatCard, StatGrid } from "@/components/dashboard/compact-layout";
import {
  PixelBadge,
  PixelButton,
  PixelCard,
} from "@/components/ui/pixel-primitives";
import type { ClassStudent, TeacherClass } from "@/lib/classes/client";
import type { ClassDashboardView } from "@/lib/dashboard/data";
import { studentStatsByName } from "@/lib/dashboard/teacher-sections";

export type ClassTab = "students" | "quizzes" | "ranking";

export const CLASS_TABS: readonly { key: ClassTab; label: string }[] = [
  { key: "students", label: "Students" },
  { key: "quizzes", label: "Quizzes" },
  { key: "ranking", label: "Ranking" },
];

export function isClassTab(value: string | null): value is ClassTab {
  return CLASS_TABS.some((tab) => tab.key === value);
}

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeZone: "Asia/Manila",
});

function formatDate(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export type ClassDetailActions = {
  onBack: () => void;
  onTab: (tab: ClassTab) => void;
  onAddStudents: () => void;
  onCreateStudent: () => void;
  onRename: () => void;
  onDelete: () => void;
  onViewStudent: (student: ClassStudent) => void;
  onRemoveStudent: (student: ClassStudent) => void;
  onDeleteAccount: (student: ClassStudent) => void;
  /** Opens a quiz's results in the Quizzes section. */
  onOpenQuiz: (title: string) => void;
};

/**
 * One class: its students, the quizzes sent to it and how it ranks. Everything
 * a teacher does with a student (create, add, remove, view results) lives here.
 */
export function ClassDetail({
  classItem,
  view,
  tab,
  actions,
}: {
  classItem: TeacherClass;
  view: ClassDashboardView | undefined;
  tab: ClassTab;
  actions: ClassDetailActions;
}) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <div>
        <PixelButton type="button" size="sm" variant="neutral" onClick={actions.onBack}>
          ← All classes
        </PixelButton>
      </div>

      <PixelCard className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="min-w-0 break-words text-lg font-bold sm:text-xl">
            {classItem.name}
          </h2>
          <PixelBadge>{plural(classItem.students.length, "student")}</PixelBadge>
        </div>
        <div className="flex flex-wrap gap-2">
          <PixelButton type="button" size="sm" onClick={actions.onCreateStudent}>
            New student
          </PixelButton>
          <PixelButton type="button" size="sm" variant="accent" onClick={actions.onAddStudents}>
            Add students
          </PixelButton>
          <PixelButton type="button" size="sm" variant="neutral" onClick={actions.onRename}>
            Rename
          </PixelButton>
          <PixelButton type="button" size="sm" variant="danger" onClick={actions.onDelete}>
            Delete class
          </PixelButton>
        </div>
      </PixelCard>

      <div
        role="tablist"
        aria-label={`${classItem.name} sections`}
        className="flex gap-1.5 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {CLASS_TABS.map((item) => {
          const selected = item.key === tab;

          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              id={`class-tab-${item.key}`}
              aria-selected={selected}
              aria-controls="class-tab-panel"
              onClick={() => actions.onTab(item.key)}
              className={`flex-1 whitespace-nowrap border-2 border-ink px-3 py-1.5 text-xs font-bold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:flex-none sm:text-sm ${
                selected
                  ? "bg-primary shadow-[2px_2px_0_var(--color-ink)]"
                  : "bg-surface"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="class-tab-panel"
        aria-labelledby={`class-tab-${tab}`}
        className="space-y-2 sm:space-y-3"
      >
        {tab === "students" ? (
          <StudentsTab classItem={classItem} view={view} actions={actions} />
        ) : null}
        {tab === "quizzes" ? <QuizzesTab view={view} actions={actions} /> : null}
        {tab === "ranking" ? (
          <ClassRanking
            leaderboards={
              view?.leaderboards ?? {
                overall: { quiz: null, rankedBy: "average", entries: [] },
                byQuiz: [],
              }
            }
            className={classItem.name}
          />
        ) : null}
      </div>
    </div>
  );
}

function StudentsTab({
  classItem,
  view,
  actions,
}: {
  classItem: TeacherClass;
  view: ClassDashboardView | undefined;
  actions: ClassDetailActions;
}) {
  const stats = studentStatsByName(view);
  const students = [...classItem.students].sort((a, b) =>
    a.username.localeCompare(b.username, "en", { sensitivity: "base" }),
  );

  return (
    <>
      <StatGrid columns={3} phoneColumns={3}>
        <StatCard
          label="Average"
          value={view && view.results.total > 0 ? `${view.results.average}%` : "—"}
        />
        <StatCard label="Students" value={String(students.length)} />
        <StatCard label="Quizzes" value={String(view?.quizProgress.length ?? 0)} />
      </StatGrid>

      {students.length === 0 ? (
        <PixelCard>
          <p className="text-sm">
            No students in this class yet. Use <strong>New student</strong> to
            create an account, or <strong>Add students</strong> for accounts
            that already exist.
          </p>
        </PixelCard>
      ) : (
        <ul className="space-y-2">
          {students.map((student) => {
            const entry = stats.get(student.username.trim().toLowerCase());

            return (
              <li key={student.userId}>
                <PixelCard className="p-2.5! sm:p-3!">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-all font-semibold">{student.username}</p>
                      <p className="text-xs text-neutral-600 sm:text-sm">
                        {entry
                          ? `Average ${Math.round(entry.average * 10) / 10}% · ${plural(entry.attempts, "attempt")} · Last active ${formatDate(entry.lastCompletedAt)}`
                          : "No quizzes taken yet"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:justify-end">
                      <PixelButton
                        type="button"
                        size="sm"
                        aria-label={`View quizzes taken by ${student.username}`}
                        onClick={() => actions.onViewStudent(student)}
                      >
                        View
                      </PixelButton>
                      <PixelButton
                        type="button"
                        size="sm"
                        variant="outline"
                        aria-label={`Remove ${student.username} from ${classItem.name}`}
                        onClick={() => actions.onRemoveStudent(student)}
                      >
                        Remove
                      </PixelButton>
                      <PixelButton
                        type="button"
                        size="sm"
                        variant="danger"
                        aria-label={`Delete the account of ${student.username}`}
                        onClick={() => actions.onDeleteAccount(student)}
                      >
                        Delete account
                      </PixelButton>
                    </div>
                  </div>
                </PixelCard>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function QuizzesTab({
  view,
  actions,
}: {
  view: ClassDashboardView | undefined;
  actions: ClassDetailActions;
}) {
  const quizzes = view?.quizProgress ?? [];

  if (quizzes.length === 0) {
    return (
      <PixelCard>
        <p className="text-sm">
          No quizzes have been sent to this class yet. Publish a quiz to the
          class from the app and it will show up here.
        </p>
      </PixelCard>
    );
  }

  return (
    <ul className="space-y-2">
      {quizzes.map((quiz) => (
        <li key={quiz.sessionId}>
          <PixelCard className="p-2.5! sm:p-3!">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <p className="break-words font-semibold">{quiz.title}</p>
                <p className="text-xs text-neutral-600 sm:text-sm">
                  {quiz.takenCount} of {quiz.assignedCount} taken · Average{" "}
                  {quiz.average === null ? "—" : `${quiz.average}%`}
                </p>
                {quiz.notTaken.length === 0 ? (
                  <PixelBadge variant="success">Everyone finished</PixelBadge>
                ) : (
                  <p className="break-words text-xs sm:text-sm">
                    <span className="font-semibold">Not yet: </span>
                    {quiz.notTaken.join(", ")}
                  </p>
                )}
              </div>
              <PixelButton
                type="button"
                size="sm"
                variant="neutral"
                className="self-start"
                onClick={() => actions.onOpenQuiz(quiz.title)}
              >
                Results
              </PixelButton>
            </div>
          </PixelCard>
        </li>
      ))}
    </ul>
  );
}
