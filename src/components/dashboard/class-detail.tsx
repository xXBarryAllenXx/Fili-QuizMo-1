"use client";

import { ClassRanking } from "@/components/dashboard/class-ranking";
import { ActionIcon, navigationIcon } from "@/components/ui/action-icon";
import { StatCard, StatGrid } from "@/components/dashboard/compact-layout";
import {
  PixelBadge,
  PixelButton,
  PixelCard,
  Trash2,
} from "@/components/ui/pixel-primitives";
import type { ClassStudent, TeacherClass } from "@/lib/classes/client";
import type { ClassDashboardView } from "@/lib/dashboard/data";
import { studentStatsByName } from "@/lib/dashboard/teacher-sections";

export type ClassTab = "students" | "quizzes" | "ranking";

const CLASS_ACTION_BUTTON = "min-h-8! gap-1.5! px-2! py-1! text-[9px]!";

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
  onOpenQuiz: (quizId: string, title: string) => void;
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
        <PixelButton type="button" size="sm" variant="neutral" onClick={actions.onBack} icon="ArrowLeft">
          All classes
        </PixelButton>
      </div>

      <PixelCard className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-[1_1_16rem] flex-wrap items-center gap-2">
          <h2 className="min-w-0 break-words text-lg font-bold sm:text-xl">
            {classItem.name}
          </h2>
          <PixelBadge>{plural(classItem.students.length, "student")}</PixelBadge>
        </div>
        <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-1.5">
          <PixelButton type="button" size="sm" className={CLASS_ACTION_BUTTON} onClick={actions.onCreateStudent}>
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M19 8v6m-3-3h6" />
            </svg>
            New student
          </PixelButton>
          <PixelButton type="button" size="sm" variant="accent" className={CLASS_ACTION_BUTTON} onClick={actions.onAddStudents}>
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            Add students
          </PixelButton>
          <PixelButton type="button" size="sm" variant="neutral" className={CLASS_ACTION_BUTTON} onClick={actions.onRename}>
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="m16 3 5 5-12 12-6 1 1-6Zm-2 2 5 5" />
            </svg>
            Rename
          </PixelButton>
          <PixelButton type="button" size="sm" variant="danger" className={CLASS_ACTION_BUTTON} onClick={actions.onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
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
              className={`inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap border-2 border-ink px-3 py-1.5 text-xs font-bold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:flex-none sm:text-sm ${
                selected
                  ? "bg-primary shadow-[2px_2px_0_var(--color-ink)]"
                  : "bg-surface"
              }`}
            >
              <ActionIcon name={navigationIcon(item.key)} size={14} />
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
                        icon="Eye"
                      >
                        View
                      </PixelButton>
                      <PixelButton
                        type="button"
                        size="sm"
                        variant="outline"
                        aria-label={`Remove ${student.username} from ${classItem.name}`}
                        onClick={() => actions.onRemoveStudent(student)}
                        icon="UserMinus"
                      >
                        Remove
                      </PixelButton>
                      <PixelButton
                        type="button"
                        size="sm"
                        variant="danger"
                        aria-label={`Delete the account of ${student.username}`}
                        title="Delete Account"
                        className="h-8! min-h-8! w-8 shrink-0 p-0!"
                        onClick={() => actions.onDeleteAccount(student)}
                      >
                        <Trash2 />
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
                onClick={() => actions.onOpenQuiz(quiz.sessionId, quiz.title)}
                icon="ChartColumn"
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
