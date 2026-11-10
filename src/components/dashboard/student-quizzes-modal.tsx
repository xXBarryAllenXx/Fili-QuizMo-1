"use client";

import { useEffect, useState } from "react";
import { PixelModal } from "@/components/ui/pixel-modal";
import { PixelBadge, PixelButton } from "@/components/ui/pixel-primitives";

/** Same fields the Assessment list shows for an attempt. */
export type StudentQuizAttempt = {
  attemptId: string;
  quizTitle: string;
  attemptNumber: number | null;
  correctCount: number | null;
  totalQuestions: number | null;
  percentage: number | null;
  completedAt: string | null;
  /** Seconds the student took on this attempt, null when not recorded. */
  durationSeconds: number | null;
};

export type StudentQuizzesPayload = {
  student: { id: string; username: string };
  scope: "own-quizzes" | "all-quizzes";
  truncated: boolean;
  quizzes: StudentQuizAttempt[];
};

// Date only, like the Assessment list.
const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeZone: "Asia/Manila",
});

export function formatAttemptDate(value: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export function formatDuration(seconds: number | null | undefined): string {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds < 0) {
    return "—";
  }

  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;

  return minutes === 0
    ? `${rest}s`
    : `${minutes}m ${String(rest).padStart(2, "0")}s`;
}

export function scoreVariant(
  percentage: number | null,
): "info" | "success" | "warning" | "danger" {
  if (percentage === null) return "info";
  if (percentage >= 75) return "success";
  if (percentage >= 50) return "warning";

  return "danger";
}

function isAttempt(value: unknown): value is StudentQuizAttempt {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { attemptId?: unknown }).attemptId === "string" &&
    typeof (value as { quizTitle?: unknown }).quizTitle === "string"
  );
}

/** Narrows the API response; anything unexpected is treated as a failed load. */
export function parseStudentQuizzes(body: unknown): StudentQuizzesPayload | null {
  if (typeof body !== "object" || body === null) return null;

  const { student, scope, truncated, quizzes } = body as Record<
    string,
    unknown
  >;

  if (
    typeof student !== "object" ||
    student === null ||
    typeof (student as { id?: unknown }).id !== "string" ||
    !Array.isArray(quizzes) ||
    !quizzes.every(isAttempt)
  ) {
    return null;
  }

  return {
    student: {
      id: (student as { id: string }).id,
      username:
        typeof (student as { username?: unknown }).username === "string"
          ? (student as { username: string }).username
          : "",
    },
    scope: scope === "all-quizzes" ? "all-quizzes" : "own-quizzes",
    truncated: truncated === true,
    quizzes,
  };
}

function apiMessage(body: unknown, fallback: string): string {
  if (typeof body === "object" && body !== null && "error" in body) {
    const error = (body as { error: unknown }).error;

    if (
      typeof error === "object" &&
      error !== null &&
      typeof (error as { message?: unknown }).message === "string"
    ) {
      return (error as { message: string }).message;
    }
  }

  return fallback;
}

export function StudentQuizzesList({
  payload,
}: {
  payload: StudentQuizzesPayload;
}) {
  const { quizzes, scope, truncated } = payload;

  if (quizzes.length === 0) {
    return (
      <p className="border-2 border-dashed border-ink p-4 text-center text-sm">
        {scope === "own-quizzes"
          ? "This student has not finished any of your quizzes yet."
          : "This student has not finished any quizzes yet."}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs">
        {scope === "own-quizzes"
          ? "Finished attempts on your quizzes, newest first."
          : "Finished attempts on all quizzes, newest first."}
      </p>
      {/* One card per attempt: nothing is cut off or scrolls sideways. */}
      <ul
        aria-label={`Quizzes taken by ${payload.student.username || "this student"}`}
        className="space-y-2"
      >
        {quizzes.map((quiz) => (
          <li
            key={quiz.attemptId}
            className="border-2 border-ink/30 bg-surface p-2 text-sm"
          >
            <p className="break-words font-semibold [overflow-wrap:anywhere]">
              {quiz.quizTitle}
            </p>
            <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs sm:grid-cols-4 sm:text-sm [&_dt]:text-neutral-600 [&_dd]:font-semibold">
              <div>
                <dt>Try</dt>
                <dd>{quiz.attemptNumber ?? "—"}</dd>
              </div>
              <div>
                <dt>Score</dt>
                <dd>
                  {quiz.correctCount !== null && quiz.totalQuestions !== null
                    ? `${quiz.correctCount}/${quiz.totalQuestions}`
                    : "—"}{" "}
                  {quiz.percentage !== null ? (
                    <PixelBadge variant={scoreVariant(quiz.percentage)}>
                      {Math.round(quiz.percentage)}%
                    </PixelBadge>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt>Finished</dt>
                <dd>{formatAttemptDate(quiz.completedAt)}</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>{formatDuration(quiz.durationSeconds)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      {truncated ? (
        <p className="text-xs">
          Showing the {quizzes.length} most recent attempts.
        </p>
      ) : null}
    </div>
  );
}

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; payload: StudentQuizzesPayload };

export function StudentQuizzesModal({
  studentId,
  username,
  onClose,
}: {
  studentId: string;
  username: string;
  onClose: () => void;
}) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [reloads, setReloads] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(
          `/api/student-quizzes?studentId=${encodeURIComponent(studentId)}`,
          { signal: controller.signal, cache: "no-store" },
        );
        const body: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          setState({
            kind: "error",
            message: apiMessage(
              body,
              "Unable to load this student's quizzes right now.",
            ),
          });
          return;
        }

        const payload = parseStudentQuizzes(body);
        setState(
          payload
            ? { kind: "ready", payload }
            : {
                kind: "error",
                message: "Unable to load this student's quizzes right now.",
              },
        );
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Student quizzes request failed.", error);
        setState({
          kind: "error",
          message: "Unable to reach the server. Check your connection.",
        });
      }
    }

    void load();

    return () => controller.abort();
  }, [studentId, reloads]);

  return (
    <PixelModal
      title={username ? `${username}'s quizzes` : "Student quizzes"}
      onClose={onClose}
      className="max-w-2xl"
    >
      <div className="space-y-3" aria-live="polite" aria-busy={state.kind === "loading"}>
        {state.kind === "loading" ? (
          <p role="status" className="text-sm">
            Loading quizzes...
          </p>
        ) : null}
        {state.kind === "error" ? (
          <div className="space-y-2">
            <p role="alert" className="text-sm">
              {state.message}
            </p>
            <PixelButton
              type="button"
              size="sm"
              onClick={() => {
                setState({ kind: "loading" });
                setReloads((count) => count + 1);
              }}
              icon="RefreshCw"
            >
              Try again
            </PixelButton>
          </div>
        ) : null}
        {state.kind === "ready" ? (
          <StudentQuizzesList payload={state.payload} />
        ) : null}
        <div className="flex justify-end pt-1">
          <PixelButton type="button" variant="neutral" onClick={onClose} icon="X">
            Close
          </PixelButton>
        </div>
      </div>
    </PixelModal>
  );
}
