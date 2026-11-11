// lib/dashboard/interventions.ts
// Teacher intervention tracking for low-score alerts.
//
// "Needs Attention" is the absence of a saved row; a row exists once the
// teacher starts (in_progress) or completes (addressed) an intervention. Alerts
// are keyed by the unique quiz attempt id, so a new low score is a new alert,
// an addressed alert is never reopened, and one attempt never alerts twice.

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";
import { studentKey as groupKey, type NoticeRow } from "@/lib/dashboard/performance-notice";

export type InterventionRecord = {
  attemptId: string;
  studentId: string;
  quizId: string;
  teacherId: string;
  status: "in_progress" | "addressed";
  note: string;
  studentName: string;
  quizTitle: string;
  percentage: number | null;
  correct: number | null;
  total: number | null;
  createdAt: string;
  addressedAt: string | null;
};

export type InterventionAlert = {
  attemptId: string;
  studentId: string;
  quizId: string;
  studentName: string;
  quizTitle: string;
  percentage: number;
  correct: number | null;
  total: number | null;
  status: "needs_attention" | "in_progress";
  note: string;
};

type Row = Pick<
  Database["public"]["Tables"]["student_interventions"]["Row"],
  | "attempt_id"
  | "student_id"
  | "quiz_id"
  | "teacher_id"
  | "status"
  | "note"
  | "student_name"
  | "quiz_title"
  | "percentage"
  | "correct_count"
  | "total_questions"
  | "created_at"
  | "addressed_at"
>;

const TABLE = "student_interventions" as const;
const COLUMNS =
  "attempt_id, student_id, quiz_id, teacher_id, status, note, student_name, quiz_title, percentage, correct_count, total_questions, created_at, addressed_at";

/** Stored student id: the account id, else the lower-cased username. */
export function studentKey(
  row: Pick<NoticeRow, "studentId" | "student">,
): string {
  return row.studentId || groupKey(row) || "unknown";
}

export function toRecord(row: Row): InterventionRecord {
  return {
    attemptId: row.attempt_id,
    studentId: row.student_id,
    quizId: row.quiz_id,
    teacherId: row.teacher_id,
    status: row.status === "addressed" ? "addressed" : "in_progress",
    note: row.note ?? "",
    studentName: row.student_name,
    quizTitle: row.quiz_title,
    percentage: row.percentage === null ? null : Number(row.percentage),
    correct: row.correct_count,
    total: row.total_questions,
    createdAt: row.created_at,
    addressedAt: row.addressed_at,
  };
}

/**
 * Alerts shown in the active list: qualifying low attempts that are not
 * addressed, plus any intervention still in progress. Needs Attention first.
 */
export function activeAlerts(
  low: readonly (NoticeRow & { percentage: number })[],
  records: readonly InterventionRecord[],
): InterventionAlert[] {
  const byAttempt = new Map(records.map((record) => [record.attemptId, record]));
  const seen = new Set<string>();
  const alerts: InterventionAlert[] = [];

  for (const row of low) {
    if (!row.id || !row.quizId || seen.has(row.id)) continue;
    seen.add(row.id);

    const record = byAttempt.get(row.id);
    if (record?.status === "addressed") continue;

    alerts.push({
      attemptId: row.id,
      studentId: studentKey(row),
      quizId: row.quizId,
      studentName: row.student ?? "Student",
      quizTitle: row.title ?? "Quiz",
      percentage: row.percentage,
      correct: row.correct,
      total: row.total,
      status: record ? "in_progress" : "needs_attention",
      note: record?.note ?? "",
    });
  }

  // An intervention that began stays visible even if the student has since
  // taken another quiz.
  for (const record of records) {
    if (record.status !== "in_progress" || seen.has(record.attemptId)) continue;

    alerts.push({
      attemptId: record.attemptId,
      studentId: record.studentId,
      quizId: record.quizId,
      studentName: record.studentName,
      quizTitle: record.quizTitle,
      percentage: record.percentage ?? 0,
      correct: record.correct,
      total: record.total,
      status: "in_progress",
      note: record.note,
    });
  }

  return alerts.sort(
    (left, right) =>
      Number(left.status === "in_progress") -
      Number(right.status === "in_progress"),
  );
}

function snapshot(alert: InterventionAlert, teacherId: string) {
  return {
    attempt_id: alert.attemptId,
    student_id: alert.studentId,
    quiz_id: alert.quizId,
    teacher_id: teacherId,
    student_name: alert.studentName,
    quiz_title: alert.quizTitle,
    percentage: alert.percentage,
    correct_count: alert.correct,
    total_questions: alert.total,
  };
}

async function currentTeacherId(): Promise<string> {
  const { data } = await createClient().auth.getUser();
  if (!data.user) throw new Error("Please sign in again.");
  return data.user.id;
}

function db() {
  return createClient();
}

/** Creates the row once; repeating it never duplicates or reopens anything. */
async function ensureRow(alert: InterventionAlert, teacherId: string, note: string) {
  const { error } = await db()
    .from(TABLE)
    .upsert(
      { ...snapshot(alert, teacherId), status: "in_progress", note },
      { onConflict: "attempt_id", ignoreDuplicates: true },
    );
  if (error) throw new Error(error.message);
}

export async function loadInterventions(): Promise<InterventionRecord[]> {
  const { data, error } = await db().from(TABLE).select(COLUMNS);
  if (error) throw new Error(error.message);
  return (data ?? []).map(toRecord);
}

/** Needs Attention -> In Progress. */
export async function startIntervention(
  alert: InterventionAlert,
  note: string,
): Promise<void> {
  const teacherId = await currentTeacherId();
  await ensureRow(alert, teacherId, note.trim());

  const { error } = await db()
    .from(TABLE)
    .update({ note: note.trim() })
    .eq("attempt_id", alert.attemptId)
    .eq("teacher_id", teacherId);
  if (error) throw new Error(error.message);
}

/** Saves the note, stamps the completion date and closes the alert. */
export async function markAddressed(
  alert: InterventionAlert,
  note: string,
): Promise<void> {
  const text = note.trim();
  if (text === "") throw new Error("Describe the action you took first.");

  const teacherId = await currentTeacherId();
  await ensureRow(alert, teacherId, text);

  const { error } = await db()
    .from(TABLE)
    .update({ status: "addressed", note: text })
    .eq("attempt_id", alert.attemptId)
    .eq("teacher_id", teacherId);
  if (error) throw new Error(error.message);
}
