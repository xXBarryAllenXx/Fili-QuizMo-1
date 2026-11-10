"use client";

import { useEffect, useState } from "react";
import { createSessionRequestController, releaseSessionRequestController } from "@/lib/auth/session-state";
import { parseAssignedQuizzes } from "@/lib/classes/client";
import { readStudentResponse } from "@/lib/classes/student-request";
import type { AssignedQuiz } from "@/lib/classes/client";

/** Loads the quizzes the signed-in student's teachers have sent them. */
export function useAssignedQuizzes() {
  const [quizzes, setQuizzes] = useState<AssignedQuiz[] | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = createSessionRequestController();
    async function load() {
      try {
        const response = await fetch("/api/assigned-quizzes", {
          cache: "no-store", signal: controller.signal,
        });
        const data = parseAssignedQuizzes(await readStudentResponse(response));
        if (!controller.signal.aborted) setQuizzes(data);
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Quizzes could not be loaded. Please retry.");
      } finally {
        releaseSessionRequestController(controller);
      }
    }
    void load();
    return () => { controller.abort(); releaseSessionRequestController(controller); };
  }, [attempt]);

  function retry() {
    setError("");
    setAttempt((value) => value + 1);
  }

  return { quizzes, error, retry };
}
