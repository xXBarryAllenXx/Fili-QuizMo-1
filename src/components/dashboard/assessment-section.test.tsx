import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { TeacherAssessmentSection } from "./assessment-section";
import type { DashboardAttempt } from "@/lib/dashboard/data";

describe("Student Attempts scrolling", () => {
  it("renders attempts from every former page with Review actions and no pagination", () => {
    const attempts: DashboardAttempt[] = Array.from({ length: 13 }, (_, index) => ({
      id: `attempt-${index}`, quizId: "quiz-a", student: `Student-${index}`, quizTitle: "Quiz",
      correct: index, total: 20, percentage: index * 5,
      completedAt: new Date(Date.UTC(2026, 10, index + 1)).toISOString(), attemptNumber: 1,
    }));
    const markup = renderToStaticMarkup(createElement(TeacherAssessmentSection, {
      quizId: "quiz-a", attempts, attemptId: null, onSelect: vi.fn(), onBack: vi.fn(),
    }));
    for (const attempt of attempts) expect(markup).toContain(`>${attempt.student}<`);
    expect(markup.match(/>Review<\/button>/g)).toHaveLength(13);
    expect(markup).not.toContain(">Next<");
    expect(markup).not.toContain(">Prev<");
    expect(markup).not.toContain("Page 1 of");
    expect(markup).toContain("overflow-y-auto");
    expect(markup.indexOf("Student attempts</h2>")).toBeLessThan(markup.indexOf('role="region"'));
    expect(markup.indexOf(">Student-12<")).toBeLessThan(markup.indexOf(">Student-0<"));
    expect(markup).toContain('id="assessment-quiz"');
    expect(markup).toContain('id="assessment-student"');
    expect(markup).toContain('id="assessment-sort"');
  });

  it("shows only the selected quiz's attempts, even when titles are identical", () => {
    const make = (id: string, quizId: string, student: string): DashboardAttempt => ({
      id, quizId, student, quizTitle: "Same title", correct: 5, total: 10,
      percentage: 50, completedAt: "2026-11-11T00:00:00Z", attemptNumber: 1,
    });
    const attempts = [
      make("a1", "quiz-a", "Alice-A"),
      make("a2", "quiz-a", "Ana-A"),
      make("b1", "quiz-b", "Bob-B"),
    ];
    const markupFor = (quizId: string) =>
      renderToStaticMarkup(createElement(TeacherAssessmentSection, {
        quizId, attempts, attemptId: null, onSelect: vi.fn(), onBack: vi.fn(),
      }));

    const a = markupFor("quiz-a");
    expect(a).toContain(">Alice-A<");
    expect(a).toContain(">Ana-A<");
    expect(a).not.toContain(">Bob-B<");

    const b = markupFor("quiz-b");
    expect(b).toContain(">Bob-B<");
    expect(b).not.toContain(">Alice-A<");
    expect(b).not.toContain(">Ana-A<");
  });
});
