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

// Leaderboard table: every column is always there. On a phone the table
// scrolls inside its own box (sideways for the columns, up and down for long
// lists), with the header row and the Rank + Student columns pinned so a
// score never loses its name. The sticky cells need a solid background.
const LB_CELL = "whitespace-nowrap py-1.5 pr-3 sm:py-2";
// Header cells stick to the top (z-[2]); the two name columns also stick to
// the left, and their header cells sit above everything (z-[3]).
const LB_HEAD = "sticky top-0 z-[2] border-b-2 border-ink bg-neutral-100";
const LB_RANK = "sticky left-0 w-16 min-w-16 pl-2";
const LB_STUDENT = "sticky left-16 border-r border-neutral-300 pl-1";

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
            <div
              role="region"
              aria-label={`${board.quiz ?? "Overall"} leaderboard (scrolls)`}
              tabIndex={0}
              className="max-h-[60vh] overflow-auto overscroll-x-contain border-2 border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:max-h-[75vh] [-webkit-overflow-scrolling:touch]"
            >
              <table className="w-max min-w-full border-separate border-spacing-0 text-left text-xs sm:text-sm">
                <caption className="sr-only">
                  {board.quiz ?? "Overall"} leaderboard
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className={`${LB_CELL} ${LB_HEAD} ${LB_RANK} z-[3]`}
                    >
                      Rank
                    </th>
                    <th
                      scope="col"
                      className={`${LB_CELL} ${LB_HEAD} ${LB_STUDENT} z-[3]`}
                    >
                      Student
                    </th>
                    <th scope="col" className={`${LB_CELL} ${LB_HEAD} pl-3`}>
                      {primaryLabel}
                    </th>
                    <th scope="col" className={`${LB_CELL} ${LB_HEAD}`}>
                      Points
                    </th>
                    <th scope="col" className={`${LB_CELL} ${LB_HEAD}`}>
                      {secondaryLabel}
                    </th>
                    <th scope="col" className={`${LB_CELL} ${LB_HEAD}`}>
                      Attempts
                    </th>
                    <th scope="col" className={`${LB_CELL} ${LB_HEAD}`}>
                      Last active
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {board.entries.map((entry) => (
                    <tr key={entry.student}>
                      <td
                        className={`${LB_CELL} ${LB_RANK} z-[1] border-t border-neutral-200 bg-surface`}
                      >
                        <RankChip rank={entry.rank} />
                      </td>
                      <td
                        title={entry.student}
                        className={`${LB_CELL} ${LB_STUDENT} z-[1] border-t border-neutral-200 bg-surface font-semibold text-foreground`}
                      >
                        <span className="block max-w-40 truncate sm:max-w-56">
                          {entry.student}
                        </span>
                      </td>
                      <td className={`${LB_CELL} border-t border-neutral-200 pl-3`}>
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
                      <td
                        className={`${LB_CELL} border-t border-neutral-200 font-bold text-foreground`}
                      >
                        {entry.points}
                      </td>
                      <td className={`${LB_CELL} border-t border-neutral-200`}>
                        {board.rankedBy === "best"
                          ? `${Math.round(entry.average * 10) / 10}%`
                          : (entry.bestRaw ??
                            `${Math.round(entry.best * 10) / 10}%`)}
                      </td>
                      <td className={`${LB_CELL} border-t border-neutral-200`}>
                        {entry.attempts}
                      </td>
                      <td className={`${LB_CELL} border-t border-neutral-200`}>
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
