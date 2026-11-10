"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PixelBadge,
  PixelButton,
  PixelCard,
} from "@/components/ui/pixel-primitives";
import {
  formatDeadline,
  upNextQuizzes,
} from "@/components/dashboard/assigned-quizzes-section";
import { useAssignedQuizzes } from "@/lib/dashboard/use-assigned-quizzes";

/** How many quizzes the overview lists; the rest are on the My Quizzes tab. */
const UP_NEXT_SHOWN = 3;
const DUE_SOON_MS = 48 * 60 * 60 * 1000;

/** The overview's to-do list: quizzes the student still has to take. */
export function UpNextSection({ onViewAll }: { onViewAll: () => void }) {
  const { quizzes, error, retry } = useAssignedQuizzes();
  // Read once when the section opens; "due soon" does not need to tick.
  const [now] = useState(() => Date.now());
  const upNext = quizzes ? upNextQuizzes(quizzes, UP_NEXT_SHOWN) : [];

  return (
    <section aria-labelledby="student-todo-title" className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h3
          id="student-todo-title"
          className="min-w-0 text-base font-semibold text-foreground"
        >
          To do
        </h3>
        <Button
          type="button"
          variant="accent"
          size="sm"
          className="shrink-0 whitespace-nowrap"
          onClick={onViewAll}
        >
          View all
        </Button>
      </div>

      {error ? (
        <PixelCard>
          <p role="alert" className="text-sm">{error}</p>
          <PixelButton className="mt-3" onClick={retry}>Retry</PixelButton>
        </PixelCard>
      ) : quizzes === null ? (
        <p role="status" className="text-sm">Loading your quizzes...</p>
      ) : upNext.length === 0 ? (
        <PixelCard>
          <p className="text-sm">
            You&apos;re all caught up. New quizzes from your teacher will show up
            here.
          </p>
        </PixelCard>
      ) : (
        <>
          <ul className="space-y-2">
            {upNext.map((quiz) => {
              const deadline = quiz.expiresAt ? Date.parse(quiz.expiresAt) : NaN;
              const dueSoon =
                !Number.isNaN(deadline) && deadline - now <= DUE_SOON_MS;

              return (
                <li key={quiz.sessionId}>
                  <PixelCard className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="break-words font-bold">{quiz.title}</h4>
                      <p className="text-xs text-px-muted">
                        {quiz.teacherUsername ? `From ${quiz.teacherUsername} · ` : ""}
                        {quiz.expiresAt
                          ? `Due ${formatDeadline(quiz.expiresAt)}`
                          : "No deadline"}
                        {quiz.maxAttempts === null
                          ? ""
                          : ` · ${quiz.attemptsRemaining ?? quiz.maxAttempts} attempt${quiz.attemptsRemaining === 1 ? "" : "s"} left`}
                      </p>
                    </div>
                    {dueSoon ? (
                      <PixelBadge variant="warning">Due soon</PixelBadge>
                    ) : null}
                  </PixelCard>
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-px-muted">
            Open the Fili-QuizMo app to take your quizzes.
          </p>
        </>
      )}
    </section>
  );
}
