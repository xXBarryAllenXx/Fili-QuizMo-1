"use client";

import { useEffect, useState } from "react";
import { parseAchievements, type Achievement } from "@/lib/dashboard/achievements";
import { readStudentResponse } from "@/lib/classes/student-request";
import {
  createSessionRequestController,
  releaseSessionRequestController,
} from "@/lib/auth/session-state";

/** Loads the signed-in student's saved awards and progress. */
export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = createSessionRequestController();
    async function load() {
      try {
        const response = await fetch("/api/student-achievements", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = parseAchievements(await readStudentResponse(response));
        if (!controller.signal.aborted) setAchievements(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error instanceof Error ? error.message : "Achievements could not sync. Please retry.");
        }
      } finally {
        releaseSessionRequestController(controller);
      }
    }
    void load();
    return () => {
      controller.abort();
      releaseSessionRequestController(controller);
    };
  }, [attempt]);

  function retry() {
    setError("");
    setAttempt((value) => value + 1);
  }

  return { achievements, error, retry };
}
