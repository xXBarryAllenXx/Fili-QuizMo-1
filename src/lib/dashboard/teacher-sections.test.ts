import { describe, expect, it } from "vitest";
import type { ClassDashboardView } from "./data";
import {
  classesHref,
  pendingQuizzes,
  quizzesHref,
  studentStatsByName,
  teacherSectionFromUrl,
  teacherSectionHref,
} from "./teacher-sections";

function view(
  classId: string,
  name: string,
  notTaken: string[][],
): ClassDashboardView {
  return {
    classId,
    name,
    studentCount: 4,
    quizProgress: notTaken.map((missing, index) => ({
      sessionId: `${classId}-q${index}`,
      title: `Quiz ${index}`,
      assignedCount: 4,
      takenCount: 4 - missing.length,
      average: null,
      notTaken: missing,
    })),
    results: { total: 0, average: 0 },
    distributions: [],
    leaderboards: {
      overall: {
        quiz: null,
        rankedBy: "average",
        entries: [
          {
            rank: 1,
            student: "Maria_S",
            average: 80,
            best: 90,
            bestRaw: null,
            attempts: 2,
            lastCompletedAt: "2026-11-01T00:00:00Z",
            points: 12,
          },
        ],
      },
      byQuiz: [],
    },
  };
}

describe("teacherSectionFromUrl", () => {
  it("opens the overview by default", () => {
    expect(teacherSectionFromUrl("/teacher-dashboard", null)).toBe("overview");
    expect(teacherSectionFromUrl("/teacher-dashboard/overview", null)).toBe(
      "overview",
    );
  });

  it("knows the three sections and settings", () => {
    expect(teacherSectionFromUrl("/teacher-dashboard/classes", null)).toBe(
      "classes",
    );
    expect(teacherSectionFromUrl("/teacher-dashboard/quizzes", null)).toBe(
      "quizzes",
    );
    expect(teacherSectionFromUrl("/teacher-dashboard/settings", null)).toBe(
      "settings",
    );
  });

  it("maps the old section links onto the new ones", () => {
    expect(teacherSectionFromUrl("/teacher-dashboard/students", null)).toBe(
      "classes",
    );
    expect(teacherSectionFromUrl("/teacher-dashboard/leaderboard", null)).toBe(
      "classes",
    );
    expect(teacherSectionFromUrl("/teacher-dashboard/scores", null)).toBe(
      "quizzes",
    );
    expect(teacherSectionFromUrl("/teacher-dashboard/assessment", null)).toBe(
      "quizzes",
    );
  });

  it("falls back to the old ?entity= links", () => {
    expect(teacherSectionFromUrl("/teacher-dashboard", "student_accounts")).toBe(
      "classes",
    );
    expect(teacherSectionFromUrl("/teacher-dashboard", "students")).toBe(
      "quizzes",
    );
  });
});

describe("teacherSectionHref", () => {
  it("builds a link and skips empty parameters", () => {
    expect(teacherSectionHref("classes")).toBe("/teacher-dashboard/classes");
    expect(
      teacherSectionHref("classes", { class: "c1", tab: "ranking", x: null }),
    ).toBe("/teacher-dashboard/classes?class=c1&tab=ranking");
  });
});

describe("classesHref and quizzesHref", () => {
  it("export the right list for each page", () => {
    expect(classesHref()).toBe(
      "/teacher-dashboard/classes?entity=student_accounts",
    );
    expect(classesHref("c1", "ranking")).toBe(
      "/teacher-dashboard/classes?entity=students&class=c1&tab=ranking",
    );
    expect(quizzesHref()).toBe("/teacher-dashboard/quizzes?entity=quizzes");
    expect(quizzesHref("s1", null, "Quiz A")).toBe(
      "/teacher-dashboard/quizzes?entity=students&quizId=s1&quiz=Quiz+A",
    );
    // Same title, different quiz: the id is what tells them apart.
    expect(quizzesHref("s2", null, "Quiz A")).not.toBe(
      quizzesHref("s1", null, "Quiz A"),
    );
    expect(quizzesHref(null, "a1")).toBe(
      "/teacher-dashboard/quizzes?entity=students&attempt=a1",
    );
  });
});

describe("pendingQuizzes", () => {
  it("lists only unfinished quizzes, most missing first", () => {
    const pending = pendingQuizzes([
      view("c1", "Rizal", [[], ["a"]]),
      view("c2", "Bonifacio", [["b", "c", "d"]]),
    ]);

    expect(pending.map((item) => [item.className, item.notTaken.length])).toEqual([
      ["Bonifacio", 3],
      ["Rizal", 1],
    ]);
  });

  it("is empty when everyone finished", () => {
    expect(pendingQuizzes([view("c1", "Rizal", [[]])])).toEqual([]);
  });
});

describe("studentStatsByName", () => {
  it("finds a student's figures ignoring case", () => {
    const stats = studentStatsByName(view("c1", "Rizal", []));

    expect(stats.get("maria_s")?.average).toBe(80);
    expect(stats.get("juan")).toBeUndefined();
  });

  it("is empty without a class", () => {
    expect(studentStatsByName(undefined).size).toBe(0);
  });
});
