"use client";

import {
  SectionHeading,
  StatCard,
  StatGrid,
} from "@/components/dashboard/compact-layout";
import { PerformanceNotices } from "@/components/dashboard/performance-notices";
import { UnreadMessagesNotice } from "@/components/dashboard/unread-messages-notice";
import {
  PixelBadge,
  PixelButton,
  PixelCard,
} from "@/components/ui/pixel-primitives";
import type { TeacherDashboardData } from "@/lib/dashboard/data";
import type { PerformanceNotice } from "@/lib/dashboard/performance-notice";
import { formatRawScore } from "@/lib/dashboard/raw-score";
import {
  pendingQuizzes,
  type PendingQuiz,
} from "@/lib/dashboard/teacher-sections";

const RECENT_LIMIT = 5;
const PENDING_LIMIT = 5;

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeZone: "Asia/Manila",
});

function formatDate(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function scoreVariant(percentage: number): "success" | "warning" | "danger" {
  if (percentage >= 75) return "success";
  if (percentage >= 50) return "warning";
  return "danger";
}

function missingText(item: PendingQuiz): string {
  const shown = item.notTaken.slice(0, 3).join(", ");
  const more = item.notTaken.length - 3;

  return more > 0 ? `${shown} +${more} more` : shown;
}

/**
 * The teacher's landing page: what needs attention first (messages, low
 * scores, quizzes students have not taken), then the latest activity.
 */
export function TeacherOverview({
  data,
  notices,
  onReviewNotice,
  onOpenMessages,
  onOpenClass,
  onOpenAttempt,
  onGoToClasses,
}: {
  data: TeacherDashboardData;
  notices: PerformanceNotice[];
  onReviewNotice: (notice: PerformanceNotice) => void;
  onOpenMessages: (attemptId: string | null) => void;
  onOpenClass: (classId: string, tab: "quizzes") => void;
  onOpenAttempt: (attemptId: string) => void;
  onGoToClasses: () => void;
}) {
  const waiting = pendingQuizzes(data.classViews);
  const recent = data.assessmentAttempts.slice(0, RECENT_LIMIT);
  const hasClasses = data.classViews.length > 0;
  const classesDown = !data.classesAvailable;

  return (
    <div className="space-y-2 sm:space-y-3">
      <SectionHeading
        title="Overview"
        description="What needs your attention and what your students did lately."
      />

      <UnreadMessagesNotice viewer="teacher" onOpen={onOpenMessages} />
      <PerformanceNotices
        notices={notices}
        actionLabel="Review"
        onAction={onReviewNotice}
      />

      <StatGrid columns={4}>
        <StatCard
          label="Classes"
          value={classesDown ? "—" : String(data.classViews.length)}
        />
        <StatCard label="Students" value={String(data.studentCount)} />
        <StatCard
          label="Quizzes"
          value={String(data.quizzes.total)}
          hint={data.quizzes.draft > 0 ? `${data.quizzes.draft} in draft` : undefined}
        />
        <StatCard
          label="Average score"
          value={data.results.total > 0 ? `${data.results.average}%` : "—"}
        />
      </StatGrid>

      {classesDown ? (
        <p
          role="status"
          className="border-2 border-ink bg-accent/20 p-3 text-sm"
        >
          Your classes could not be loaded right now. Refresh the page in a
          moment to see them.
        </p>
      ) : null}

      {!hasClasses && !classesDown ? (
        <PixelCard className="space-y-2">
          <h3 className="font-bold">Start with a class</h3>
          <p className="text-sm">
            Create a class and add your students to it. Quizzes you send to the
            class, and how each student does, show up here.
          </p>
          <PixelButton type="button" size="sm" onClick={onGoToClasses}>
            Go to Classes
          </PixelButton>
        </PixelCard>
      ) : null}

      {hasClasses ? (
        <PixelCard as="section" aria-label="Waiting on students" className="space-y-2">
          <div>
            <h3 className="font-bold">Waiting on students</h3>
            <p className="text-xs text-neutral-600 sm:text-sm">
              Quizzes sent to a class that some students have not taken yet.
            </p>
          </div>
          {waiting.length === 0 ? (
            <p className="text-sm">
              {data.classViews.some((view) => view.quizProgress.length > 0)
                ? "Everyone has finished the quizzes you sent."
                : "No quizzes have been sent to a class yet. Publish one to a class from the app."}
            </p>
          ) : (
            <ul className="space-y-2">
              {waiting.slice(0, PENDING_LIMIT).map((item) => (
                <li
                  key={`${item.classId}-${item.sessionId}`}
                  className="flex flex-col gap-2 border-2 border-ink/30 p-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold">
                      {item.title}{" "}
                      <span className="font-normal text-neutral-600">
                        · {item.className}
                      </span>
                    </p>
                    <p className="break-words text-xs text-neutral-600 sm:text-sm">
                      {item.takenCount} of {item.assignedCount} taken · Not yet:{" "}
                      {missingText(item)}
                    </p>
                  </div>
                  <PixelButton
                    type="button"
                    size="sm"
                    variant="neutral"
                    aria-label={`Open ${item.className} quizzes`}
                    className="self-start sm:self-auto"
                    onClick={() => onOpenClass(item.classId, "quizzes")}
                  >
                    Open class
                  </PixelButton>
                </li>
              ))}
            </ul>
          )}
        </PixelCard>
      ) : null}

      <PixelCard as="section" aria-label="Recent activity" className="space-y-2">
        <div>
          <h3 className="font-bold">Recent activity</h3>
          <p className="text-xs text-neutral-600 sm:text-sm">
            The latest finished quizzes.
          </p>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm">
            No quiz has been finished yet. Scores will appear here as students
            complete quizzes.
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.map((attempt) => (
              <li
                key={attempt.id}
                className="flex items-center justify-between gap-2 border-2 border-ink/30 p-2"
              >
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold">
                    {attempt.student}
                  </p>
                  <p className="break-words text-xs text-neutral-600 sm:text-sm">
                    {attempt.quizTitle} · {formatDate(attempt.completedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <PixelBadge variant={scoreVariant(attempt.percentage)}>
                    {formatRawScore(attempt.correct, attempt.total) ??
                      `${Math.round(attempt.percentage)}%`}
                  </PixelBadge>
                  <PixelButton
                    type="button"
                    size="sm"
                    variant="neutral"
                    aria-label={`Review ${attempt.student}'s answers on ${attempt.quizTitle}`}
                    onClick={() => onOpenAttempt(attempt.id)}
                  >
                    Review
                  </PixelButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PixelCard>
    </div>
  );
}
