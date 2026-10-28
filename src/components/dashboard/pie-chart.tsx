"use client";

import { useEffect, useState } from "react";

const quizDistributions = [
  {
    quiz: "General Knowledge Quiz",
    average: 82,
    bands: [
      { label: "Excellent (90–100)", value: 35, color: "#0f1f3d" },
      { label: "Good (75–89)", value: 30, color: "#1d4ed8" },
      { label: "Needs Improvement (50–74)", value: 20, color: "#60a5fa" },
      { label: "At Risk (below 50)", value: 15, color: "#cbd5e1" },
    ],
  },
  {
    quiz: "Science Fundamentals",
    average: 78,
    bands: [
      { label: "Excellent (90–100)", value: 28, color: "#0f1f3d" },
      { label: "Good (75–89)", value: 34, color: "#1d4ed8" },
      { label: "Needs Improvement (50–74)", value: 24, color: "#60a5fa" },
      { label: "At Risk (below 50)", value: 14, color: "#cbd5e1" },
    ],
  },
  {
    quiz: "Math Essentials",
    average: 71,
    bands: [
      { label: "Excellent (90–100)", value: 22, color: "#0f1f3d" },
      { label: "Good (75–89)", value: 28, color: "#1d4ed8" },
      { label: "Needs Improvement (50–74)", value: 32, color: "#60a5fa" },
      { label: "At Risk (below 50)", value: 18, color: "#cbd5e1" },
    ],
  },
  {
    quiz: "English Vocabulary",
    average: 86,
    bands: [
      { label: "Excellent (90–100)", value: 40, color: "#0f1f3d" },
      { label: "Good (75–89)", value: 32, color: "#1d4ed8" },
      { label: "Needs Improvement (50–74)", value: 18, color: "#60a5fa" },
      { label: "At Risk (below 50)", value: 10, color: "#cbd5e1" },
    ],
  },
];

export function PieChart() {
  const [mounted, setMounted] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const distribution = quizDistributions[selectedQuiz];
  let offset = 0;

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="score-quiz-select"
          className="block text-sm font-medium text-neutral-600"
        >
          Quiz
        </label>
        <select
          id="score-quiz-select"
          value={selectedQuiz}
          onChange={(event) => setSelectedQuiz(Number(event.target.value))}
          className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {quizDistributions.map((item, index) => (
            <option key={item.quiz} value={index}>
              {item.quiz}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
        <div className="relative h-48 w-48 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            {distribution.bands.map((item) => {
              const currentOffset = offset;
              offset += item.value;

              return (
                <circle
                  key={item.label}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="20"
                  pathLength="100"
                  strokeDasharray={
                    mounted ? `${item.value} ${100 - item.value}` : "0 100"
                  }
                  strokeDashoffset={-currentOffset}
                  style={{
                    transition:
                      "stroke-dasharray 1s ease-out, stroke-dashoffset 1s ease-out",
                  }}
                />
              );
            })}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">
              {distribution.average}%
            </span>
            <span className="text-xs text-neutral-500">Average</span>
          </div>
        </div>

        <ul className="space-y-3">
          {distribution.bands.map((item) => (
            <li key={item.label} className="flex items-center gap-3 text-sm">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-neutral-600">{item.label}</span>
              <span className="ml-auto font-semibold text-foreground">
                {item.value}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
