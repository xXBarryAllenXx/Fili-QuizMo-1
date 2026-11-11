"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AddStudentsModal } from "@/components/dashboard/add-students-modal";
import {
  ClassDetail,
  isClassTab,
  type ClassDetailActions,
} from "@/components/dashboard/class-detail";
import { CreateStudentModal } from "@/components/dashboard/create-student-modal";
import { StudentQuizzesModal } from "@/components/dashboard/student-quizzes-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PixelModal } from "@/components/ui/pixel-modal";
import {
  PixelBadge,
  PixelButton,
  PixelCard,
  PixelInput,
  Trash2,
} from "@/components/ui/pixel-primitives";
import {
  addStudents,
  createClass,
  deleteClass,
  listClasses,
  listSuggestions,
  MAX_CLASS_NAME,
  removeStudent,
  renameClass,
  type ClassStudent,
  type StudentSuggestion,
  type TeacherClass,
} from "@/lib/classes/client";
import type { ClassDashboardView } from "@/lib/dashboard/data";
import { SESSION_ENDED_EVENT } from "@/lib/auth/session-state";
import { classesHref } from "@/lib/dashboard/teacher-sections";
import { useUrlParams } from "@/lib/dashboard/use-url-params";

// The last class list that loaded. Opening Classes again shows it at once while
// a fresh copy loads in the background. Forgotten when the session ends.
let cachedLists: { classes: TeacherClass[]; suggestions: StudentSuggestion[] } | null =
  null;

if (typeof window !== "undefined") {
  window.addEventListener(SESSION_ENDED_EVENT, () => {
    cachedLists = null;
  });
}

type Feedback = { kind: "success" | "error"; text: string } | null;
type StudentTarget = { classItem: TeacherClass | null; student: ClassStudent };

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

async function deleteStudentAccount(userId: string): Promise<void> {
  const response = await fetch("/api/accounts", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "delete",
      accountRole: "student",
      accountId: userId,
    }),
    cache: "no-store",
  });

  if (response.ok) return;

  const body: unknown = await response.json().catch(() => null);
  const error =
    typeof body === "object" && body !== null
      ? (body as { error?: unknown }).error
      : null;
  const message =
    typeof error === "object" && error !== null
      ? (error as { message?: unknown }).message
      : error;

  throw new Error(
    typeof message === "string" ? message : "Unable to delete the account.",
  );
}

/**
 * The teacher's classes. The list shows each class at a glance; opening one
 * shows its students, the quizzes sent to it and its ranking, and is where
 * students are created, added, removed and looked up.
 */
export function ManageClasses({
  classViews,
  onOpenQuiz,
}: {
  classViews: readonly ClassDashboardView[];
  onOpenQuiz: (quizId: string, title: string) => void;
}) {
  const router = useRouter();
  const { searchParams, pushHref } = useUrlParams();
  const openClassId = searchParams.get("class");
  const rawTab = searchParams.get("tab");
  const tab = isClassTab(rawTab) ? rawTab : "students";

  const [classes, setClasses] = useState<TeacherClass[] | null>(
    () => cachedLists?.classes ?? null,
  );
  const [suggestions, setSuggestions] = useState<StudentSuggestion[]>(
    () => cachedLists?.suggestions ?? [],
  );
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [addTarget, setAddTarget] = useState<TeacherClass | null>(null);
  const [newStudentTarget, setNewStudentTarget] = useState<TeacherClass | null>(null);
  const [renameTarget, setRenameTarget] = useState<TeacherClass | null>(null);
  const [renameText, setRenameText] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<TeacherClass | null>(null);
  const [removeTarget, setRemoveTarget] = useState<StudentTarget | null>(null);
  const [accountTarget, setAccountTarget] = useState<StudentTarget | null>(null);
  const [viewTarget, setViewTarget] = useState<ClassStudent | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([listClasses(), listSuggestions().catch(() => [])])
      .then(([rows, suggested]) => {
        cachedLists = { classes: rows, suggestions: suggested };
        if (cancelled) return;
        setClasses(rows);
        setSuggestions(suggested);
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(
          error instanceof Error ? error.message : "Unable to load classes.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function reload() {
    setReloadKey((key) => key + 1);
    // The averages and quiz progress come from the server page.
    router.refresh();
  }

  async function runAction(
    action: () => Promise<void>,
    success: string,
    close: () => void,
  ) {
    setBusy(true);
    setFeedback(null);
    try {
      await action();
      setFeedback({ kind: "success", text: success });
      reload();
    } catch (error) {
      setFeedback({
        kind: "error",
        text: error instanceof Error ? error.message : "The request failed.",
      });
    } finally {
      setBusy(false);
      close();
    }
  }

  async function submitNew(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (creating || !trimmed) return;

    setCreating(true);
    setFeedback(null);
    try {
      await createClass(trimmed);
      setName("");
      setFeedback({ kind: "success", text: `Class "${trimmed}" created.` });
      reload();
    } catch (error) {
      setFeedback({
        kind: "error",
        text: error instanceof Error ? error.message : "Unable to create the class.",
      });
    } finally {
      setCreating(false);
    }
  }

  function submitRename(event: FormEvent) {
    event.preventDefault();
    if (!renameTarget || busy) return;

    const { classId, name: oldName } = renameTarget;
    const next = renameText.trim();
    if (!next || next === oldName) {
      setRenameTarget(null);
      return;
    }

    void runAction(
      () => renameClass(classId, next),
      `Class renamed to "${next}".`,
      () => setRenameTarget(null),
    );
  }

  const openClass = classes?.find((item) => item.classId === openClassId) ?? null;

  const inAnyClass = new Set(
    (classes ?? []).flatMap((item) => item.students.map((s) => s.userId)),
  );
  const unassigned = suggestions.filter((s) => !inAnyClass.has(s.userId));

  const dialogs = (
    <>
      {addTarget ? (
        <AddStudentsModal
          target={addTarget}
          onClose={() => setAddTarget(null)}
          onAdded={(added) => {
            setFeedback({
              kind: "success",
              text:
                added > 0
                  ? `${plural(added, "student")} added to ${addTarget.name}.`
                  : "Those students were already in the class.",
            });
            setAddTarget(null);
            reload();
          }}
        />
      ) : null}

      {newStudentTarget ? (
        <CreateStudentModal
          target={newStudentTarget}
          onClose={() => setNewStudentTarget(null)}
          onCreated={reload}
        />
      ) : null}

      {viewTarget ? (
        <StudentQuizzesModal
          key={viewTarget.userId}
          studentId={viewTarget.userId}
          username={viewTarget.username}
          onClose={() => setViewTarget(null)}
        />
      ) : null}

      {renameTarget ? (
        <PixelModal
          title="Rename class"
          onClose={() => {
            if (!busy) setRenameTarget(null);
          }}
          className="max-w-md"
        >
          <form onSubmit={submitRename} className="space-y-3 text-sm">
            <label htmlFor="rename-class-name" className="block font-semibold">
              Class name
            </label>
            <PixelInput
              id="rename-class-name"
              value={renameText}
              maxLength={MAX_CLASS_NAME}
              autoComplete="off"
              onChange={(event) => setRenameText(event.target.value)}
            />
            <div className="flex flex-wrap justify-end gap-2">
              <PixelButton
                type="button"
                variant="neutral"
                disabled={busy}
                onClick={() => setRenameTarget(null)}
                icon="X"
              >
                Cancel
              </PixelButton>
              <PixelButton type="submit" disabled={busy || !renameText.trim()} icon="Save">
                {busy ? "Saving..." : "Save"}
              </PixelButton>
            </div>
          </form>
        </PixelModal>
      ) : null}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete class"
        message={`Delete "${deleteTarget?.name ?? ""}"? Students stop seeing quizzes that were sent only to this class. Their accounts and past results are not affected.`}
        confirmLabel="Delete class"
        pending={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          const target = deleteTarget;
          void runAction(
            async () => {
              await deleteClass(target.classId);
              if (target.classId === openClassId) {
                pushHref(classesHref());
              }
            },
            `Class "${target.name}" deleted.`,
            () => setDeleteTarget(null),
          );
        }}
      />

      <ConfirmDialog
        open={removeTarget !== null}
        title="Remove student"
        message={`Remove ${removeTarget?.student.username ?? ""} from "${removeTarget?.classItem?.name ?? ""}"? They stop seeing quizzes that were sent only to this class. Their account stays.`}
        confirmLabel="Remove student"
        pending={busy}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (!removeTarget?.classItem) return;
          const { classItem, student } = removeTarget;
          void runAction(
            () => removeStudent(classItem.classId, student.userId),
            `${student.username} removed from ${classItem.name}.`,
            () => setRemoveTarget(null),
          );
        }}
      />

      <ConfirmDialog
        open={accountTarget !== null}
        title="Delete student account"
        message={`Delete the account of ${accountTarget?.student.username ?? ""}? It is permanently removed and cannot be restored. Their saved quiz results stay on record.`}
        confirmLabel="Delete account"
        pending={busy}
        onCancel={() => setAccountTarget(null)}
        onConfirm={() => {
          if (!accountTarget) return;
          const { student } = accountTarget;
          void runAction(
            () => deleteStudentAccount(student.userId),
            `${student.username}'s account was deleted.`,
            () => setAccountTarget(null),
          );
        }}
      />
    </>
  );

  const feedbackNote = feedback ? (
    <p
      role={feedback.kind === "error" ? "alert" : "status"}
      className={`border-2 p-3 text-sm ${
        feedback.kind === "error"
          ? "border-danger-dark bg-danger-surface text-danger-dark"
          : "border-primary-dark bg-primary/15 text-ink"
      }`}
    >
      {feedback.text}
    </p>
  ) : null;

  if (loadError && classes === null) {
    return (
      <div
        role="alert"
        className="border-2 border-danger-dark bg-danger-surface p-3 text-sm text-danger-dark"
      >
        <p>{loadError}</p>
        <PixelButton type="button" size="sm" className="mt-2" onClick={reload} icon="RefreshCw">
          Try again
        </PixelButton>
      </div>
    );
  }

  if (classes === null) {
    return (
      <p role="status" className="text-sm text-px-muted">
        Loading classes...
      </p>
    );
  }

  if (openClass) {
    const actions: ClassDetailActions = {
      onBack: () => pushHref(classesHref()),
      onTab: (next) =>
        pushHref(classesHref(openClass.classId, next === "students" ? null : next)),
      onAddStudents: () => setAddTarget(openClass),
      onCreateStudent: () => setNewStudentTarget(openClass),
      onRename: () => {
        setRenameText(openClass.name);
        setRenameTarget(openClass);
      },
      onDelete: () => setDeleteTarget(openClass),
      onViewStudent: setViewTarget,
      onRemoveStudent: (student) =>
        setRemoveTarget({ classItem: openClass, student }),
      onDeleteAccount: (student) =>
        setAccountTarget({ classItem: openClass, student }),
      onOpenQuiz,
    };

    return (
      <div className="space-y-2 sm:space-y-3">
        {feedbackNote}
        <ClassDetail
          classItem={openClass}
          view={classViews.find((item) => item.classId === openClass.classId)}
          tab={tab}
          actions={actions}
        />
        {dialogs}
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {feedbackNote}

      <form onSubmit={submitNew} aria-label="Create a class">
        <PixelCard>
          <label htmlFor="new-class-name" className="text-sm font-semibold">
            New class
          </label>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            <PixelInput
              id="new-class-name"
              value={name}
              maxLength={MAX_CLASS_NAME}
              placeholder="e.g. Grade 7 - Rizal"
              autoComplete="off"
              onChange={(event) => setName(event.target.value)}
            />
            <PixelButton type="submit" disabled={creating || !name.trim()} icon="CirclePlus">
              {creating ? "Creating..." : "Create class"}
            </PixelButton>
          </div>
        </PixelCard>
      </form>

      {classes.length === 0 ? (
        <PixelCard>
          <p className="text-sm">
            You have no classes yet. Create one above, then add or create your
            students inside it.
          </p>
        </PixelCard>
      ) : (
        <ul className="space-y-2 sm:space-y-3">
          {classes.map((item) => {
            const view = classViews.find((v) => v.classId === item.classId);
            const waiting = (view?.quizProgress ?? []).filter(
              (quiz) => quiz.notTaken.length > 0,
            ).length;

            return (
              <li key={item.classId}>
                <PixelCard>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <h3 className="break-words font-bold">{item.name}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
                        <PixelBadge>{plural(item.students.length, "student")}</PixelBadge>
                        {!(view && view.results.total > 0) ? (
                          <span className="text-neutral-600">No scores yet</span>
                        ) : null}
                        {waiting > 0 ? (
                          <PixelBadge variant="warning">
                            {plural(waiting, "quiz")} waiting on students
                          </PixelBadge>
                        ) : null}
                      </div>
                    </div>
                    <PixelButton
                      type="button"
                      size="sm"
                      aria-label={`Open ${item.name}`}
                      onClick={() => pushHref(classesHref(item.classId))}
                      className="w-full sm:w-auto"
                      icon="Eye"
                    >
                      Open
                    </PixelButton>
                  </div>
                </PixelCard>
              </li>
            );
          })}
        </ul>
      )}

      {unassigned.length > 0 ? (
        <PixelCard className="space-y-2">
          <div>
            <h3 className="font-bold">Not in a class yet</h3>
            <p className="text-xs text-neutral-600 sm:text-sm">
              Student accounts that are not in any of your classes.
            </p>
          </div>
          <ul className="divide-y-2 divide-ink/20 border-2 border-ink text-sm">
            {unassigned.map((student) => (
              <li
                key={student.userId}
                className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="break-all font-semibold">{student.username}</span>
                <div className="flex flex-wrap gap-1.5">
                  {classes.length > 0 ? (
                    <select
                      aria-label={`Add ${student.username} to a class`}
                      value=""
                      disabled={busy}
                      onChange={(event) => {
                        const target = classes.find(
                          (item) => item.classId === event.target.value,
                        );
                        if (!target) return;
                        void runAction(
                          async () => {
                            await addStudents(target.classId, [student.username]);
                          },
                          `${student.username} added to ${target.name}.`,
                          () => undefined,
                        );
                      }}
                      className="h-8 min-w-0 flex-1 px-2 text-xs sm:flex-none"
                    >
                      <option value="">Add to class…</option>
                      {classes.map((item) => (
                        <option key={item.classId} value={item.classId}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  <PixelButton
                    type="button"
                    size="sm"
                    aria-label={`View quizzes taken by ${student.username}`}
                    onClick={() => setViewTarget(student)}
                    icon="Eye"
                  >
                    View
                  </PixelButton>
                  <PixelButton
                    type="button"
                    size="sm"
                    variant="danger"
                    aria-label={`Delete the account of ${student.username}`}
                    title="Delete Account"
                    className="h-8! min-h-8! w-8 shrink-0 p-0!"
                    onClick={() =>
                      setAccountTarget({ classItem: null, student })
                    }
                  >
                    <Trash2 />
                  </PixelButton>
                </div>
              </li>
            ))}
          </ul>
        </PixelCard>
      ) : null}

      {dialogs}
    </div>
  );
}
