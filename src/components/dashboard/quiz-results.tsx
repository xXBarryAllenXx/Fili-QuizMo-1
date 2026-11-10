"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { TeacherAssessmentSection } from "@/components/dashboard/assessment-section";
import {
  ChartPanel,
  StatCard,
  StatGrid,
} from "@/components/dashboard/compact-layout";
import { PixelLoader } from "@/components/ui/pixel-loader";
import { PixelButton, PixelCard } from "@/components/ui/pixel-primitives";
import type { DashboardAttempt } from "@/lib/dashboard/data";
import { buildScoreDistribution } from "@/lib/dashboard/score-bands";

const PieChart = dynamic(
  () =>
    import("@/components/dashboard/pie-chart").then((module) => module.PieChart),
  { loading: () => <PixelLoader label="Loading score chart..." /> },
);

/**
 * The results of one quiz: headline numbers, how the scores are spread, and
 * every student's attempts with the answer review and messages.
 */
export function QuizResults({
  title,
  attempts,
  attemptId,
  onBack,
  onSelectAttempt,
  onBackToQuiz,
}: {
  title: string;
  /** Every finished attempt on this teacher's quizzes. */
  attempts: DashboardAttempt[];
  attemptId: string | null;
  /** Back to the quiz list. */
  onBack: () => void;
  onSelectAttempt: (attemptId: string) => void;
  /** Back from one attempt's review to this quiz's results. */
  onBackToQuiz: () => void;
}) {
  const quizAttempts = useMemo(
    () => attempts.filter((attempt) => attempt.quizTitle === title),
    [attempts, title],
  );

  const summary = useMemo(() => {
    const students = new Set(
      quizAttempts.map((attempt) => attempt.student.trim().toLowerCase()),
    );
    const average =
      quizAttempts.length === 0
        ? null
        : Math.round(
            (quizAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) /
              quizAttempts.length) *
              10,
          ) / 10;

    return {
      students: students.size,
      average,
      distribution: buildScoreDistribution(
        title,
        quizAttempts.map((attempt) => attempt.percentage),
      ),
    };
  }, [quizAttempts, title]);

  // One attempt open: the answer review, with the quiz's attempts behind it.
  if (attemptId) {
    return (
      <div className="space-y-2 sm:space-y-3">
        <TeacherAssessmentSection
          attempts={quizAttempts}
          attemptId={attemptId}
          onSelect={onSelectAttempt}
          onBack={onBackToQuiz}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      <div>
        <PixelButton type="button" size="sm" variant="neutral" onClick={onBack}>
          ← All quizzes
        </PixelButton>
      </div>

      <div>
        <h2 className="break-words text-lg font-bold text-foreground sm:text-xl">
          {title}
        </h2>
        <p className="mt-0.5 text-xs text-px-muted sm:text-sm">
          Results, scores and answers for this quiz.
        </p>
      </div>

      {quizAttempts.length === 0 ? (
        <PixelCard>
          <p className="text-sm">
            Nobody has finished this quiz yet. Results will appear here as
            students complete it.
          </p>
        </PixelCard>
      ) : (
        <>
          <StatGrid columns={3} phoneColumns={3}>
            <StatCard
              label="Average"
              value={summary.average === null ? "—" : `${summary.average}%`}
            />
            <StatCard label="Students" value={String(summary.students)} />
            <StatCard label="Attempts" value={String(quizAttempts.length)} />
          </StatGrid>

          <ChartPanel
            title="Score Distribution"
            caption="How the attempts on this quiz are spread across the score bands."
          >
            <PieChart
              distributions={summary.distribution ? [summary.distribution] : []}
            />
          </ChartPanel>

          <TeacherAssessmentSection
            attempts={quizAttempts}
            attemptId={null}
            onSelect={onSelectAttempt}
            onBack={onBackToQuiz}
          />
        </>
      )}
    </div>
  );
}
