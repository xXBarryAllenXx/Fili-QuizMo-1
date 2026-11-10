"use client";

import { useState } from "react";
import { ChartPanel } from "@/components/dashboard/compact-layout";
import { PixelCard } from "@/components/ui/pixel-primitives";
import {
  MAX_POINTS_PER_QUIZ,
  POINTS,
  quizPoints,
  type LeaderboardData,
} from "@/lib/dashboard/leaderboard";

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeZone: "Asia/Manila",
});

function formatDate(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function ordinal(rank: number): string {
  if (rank % 100 >= 11 && rank % 100 <= 13) return `${rank}th`;
  if (rank % 10 === 1) return `${rank}st`;
  if (rank % 10 === 2) return `${rank}nd`;
  if (rank % 10 === 3) return `${rank}rd`;
  return `${rank}th`;
}

const medalClass: Record<number, string> = {
  1: "bg-accent text-ink",
  2: "bg-neutral-300 text-ink",
  3: "bg-accent-dark text-ink",
};

function RankChip({ rank }: { rank: number }) {
  return (
    <span
      className={`inline-block min-w-10 border-2 sm:min-w-12 border-ink px-2 py-0.5 text-center text-xs font-bold ${
        medalClass[rank] ?? "bg-surface text-ink"
      }`}
    >
      {ordinal(rank)}
    </span>
  );
}

function ScoreBar({ value, label }: { value: number; label?: string | null }) {
  const width = Math.min(100, Math.max(0, value));
  const tone =
    value >= 75 ? "bg-primary" : value >= 50 ? "bg-accent" : "bg-danger";

  return (
    <div className="flex items-center gap-2">
      <div
        aria-hidden="true"
        className="h-2.5 w-14 shrink-0 border-2 border-ink bg-surface sm:h-3 sm:w-20"
      >
        <div className={`h-full ${tone}`} style={{ width: `${width}%` }} />
      </div>
      <span
        className="font-semibold text-foreground"
        title={`${Math.round(value * 10) / 10}%`}
      >
        {label ?? `${Math.round(value * 10) / 10}%`}
      </span>
    </div>
  );
}

// Leaderboard table: tight cells on phones, with the extra columns tucked
// away until there is room (secondary score + attempts from sm, date from md).
const LB_CELL = "py-1.5 pr-2 sm:py-2 sm:pr-3";
const LB_HIDE_SM = "hidden sm:table-cell";
const LB_HIDE_MD = "hidden md:table-cell";

/**
 * The ranking of one class: every student in it, overall or for a single quiz.
 * Classes are small, so the whole class is listed.
 */
export function ClassRanking({
  leaderboards,
  className,
}: {
  leaderboards: LeaderboardData;
  className: string;
}) {
  const { overall, byQuiz } = leaderboards;
  const boards = [overall, ...byQuiz];
  const [selected, setSelected] = useState(0);
  const board = boards[selected] ?? overall;
  const primaryLabel = board.rankedBy === "best" ? "Best score" : "Average";
  const secondaryLabel = board.rankedBy === "best" ? "Average" : "Best score";

  return (
    <div className="space-y-2 sm:space-y-3">
      {overall.entries.length === 0 ? (
        <PixelCard>
          <p className="text-sm text-neutral-600">
            {`No quiz results from students in ${className} yet. Rankings will appear once they finish a quiz.`}
          </p>
        </PixelCard>
      ) : (
        <>
          <div>
            <label
              htmlFor="leaderboard-quiz"
              className="block text-xs font-medium text-foreground sm:text-sm"
            >
              Show ranking for
            </label>
            <select
              id="leaderboard-quiz"
              value={selected}
              onChange={(event) => setSelected(Number(event.target.value))}
              className="mt-1 h-9 w-full max-w-xs px-3 text-sm sm:h-10"
            >
              {boards.map((option, index) => (
                <option key={option.quiz ?? "overall"} value={index}>
                  {option.quiz ?? "Overall (all quizzes)"}
                </option>
              ))}
            </select>
          </div>

          <ChartPanel
            title={board.quiz ?? "Overall ranking"}
            caption={
              board.rankedBy === "best"
                ? "Ranked by best score on this quiz. Whole class."
                : "Ranked by average score across all quizzes. Whole class."
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <caption className="sr-only">
                  {board.quiz ?? "Overall"} leaderboard
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className={LB_CELL}>Rank</th>
                    <th scope="col" className={LB_CELL}>Student</th>
                    <th scope="col" className={LB_CELL}>{primaryLabel}</th>
                    <th scope="col" className={LB_CELL}>Points</th>
                    <th scope="col" className={`${LB_CELL} ${LB_HIDE_SM}`}>
                      {secondaryLabel}
                    </th>
                    <th scope="col" className={`${LB_CELL} ${LB_HIDE_SM}`}>
                      Attempts
                    </th>
                    <th
                      scope="col"
                      className={`py-1.5 sm:py-2 ${LB_HIDE_MD}`}
                    >
                      Last active
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {board.entries.map((entry) => (
                    <tr key={entry.student}>
                      <td className={LB_CELL}>
                        <RankChip rank={entry.rank} />
                      </td>
                      <td className={`${LB_CELL} font-semibold text-foreground`}>
                        {entry.student}
                      </td>
                      <td className={LB_CELL}>
                        <ScoreBar
                          value={
                            board.rankedBy === "best"
                              ? entry.best
                              : entry.average
                          }
                          label={
                            board.rankedBy === "best" ? entry.bestRaw : null
                          }
                        />
                      </td>
                      <td className={`${LB_CELL} font-bold text-foreground`}>
                        {entry.points}
                      </td>
                      <td className={`${LB_CELL} ${LB_HIDE_SM}`}>
                        {board.rankedBy === "best"
                          ? `${Math.round(entry.average * 10) / 10}%`
                          : (entry.bestRaw ??
                            `${Math.round(entry.best * 10) / 10}%`)}
                      </td>
                      <td className={`${LB_CELL} ${LB_HIDE_SM}`}>
                        {entry.attempts}
                      </td>
                      <td className={`py-1.5 sm:py-2 ${LB_HIDE_MD}`}>
                        {formatDate(entry.lastCompletedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PointsMethod />
          </ChartPanel>
        </>
      )}
    </div>
  );
}

/** One box of the points equation: a big value with a short caption. */
function PointsTerm({
  value,
  label,
  tone = "bg-surface",
}: {
  value: string;
  label: string;
  tone?: string;
}) {
  return (
    <div
      className={`min-w-0 flex-1 basis-24 border-2 border-ink px-2 py-1 text-center ${tone}`}
    >
      <p className="text-sm font-bold leading-tight text-ink sm:text-base">
        {value}
      </p>
      <p className="text-[11px] leading-tight text-neutral-700 sm:text-xs">
        {label}
      </p>
    </div>
  );
}

function PointsOperator({ symbol }: { symbol: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex w-4 shrink-0 items-center justify-center text-base font-bold text-ink"
    >
      {symbol}
    </span>
  );
}

/** "8/10 → 8 + 2 = 10 points", built from the same rule the table uses. */
function pointsExample(percentage: number, raw: string): string {
  const parts = [
    Math.round(percentage / POINTS.scoreDivisor),
    POINTS.completion,
    ...(percentage >= 100 ? [POINTS.perfect] : []),
  ];

  return `${raw} → ${parts.join(" + ")} = ${quizPoints(percentage)} points`;
}

/**
 * The points rule, always visible under the table: each quiz is
 * (score part) + (finished) + (perfect bonus), drawn as a small equation so it
 * reads at a glance. Every number comes from POINTS in leaderboard.ts.
 */
function PointsMethod() {
  return (
    <section
      aria-label="How points are calculated"
      className="mt-3 space-y-2 border-2 border-ink bg-neutral-100 p-2.5"
    >
      <h4 className="text-sm font-bold text-foreground">
        How points work{" "}
        <span className="font-normal text-neutral-600">(for each quiz)</span>
      </h4>

      <div className="flex flex-wrap items-stretch gap-1.5">
        <PointsTerm
          value={`0–${100 / POINTS.scoreDivisor}`}
          label={`Best score ÷ ${POINTS.scoreDivisor}`}
        />
        <PointsOperator symbol="+" />
        <PointsTerm value={`+${POINTS.completion}`} label="Finished the quiz" />
        <PointsOperator symbol="+" />
        <PointsTerm
          value={`+${POINTS.perfect}`}
          label="Perfect score (100%)"
          tone="bg-primary"
        />
        <PointsOperator symbol="=" />
        <PointsTerm
          value={`Up to ${MAX_POINTS_PER_QUIZ}`}
          label="Per quiz"
          tone="bg-accent"
        />
      </div>

      <p className="text-xs text-foreground sm:text-sm">
        <strong>Examples:</strong> {pointsExample(80, "8/10")} ·{" "}
        {pointsExample(100, "10/10")} · {pointsExample(30, "3/10")}
      </p>

      <p className="text-xs text-neutral-600 sm:text-sm">
        Only the best try on each quiz counts, so retakes add no extra points.
        The overall board adds up every quiz. Rank order still follows the
        score shown.
      </p>
    </section>
  );
}
