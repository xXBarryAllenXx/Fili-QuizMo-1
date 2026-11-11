"use client";

import { useState } from "react";
import { ActionIcon, type ActionIconName } from "@/components/ui/action-icon";
import { PixelBadge, PixelButton, PixelCard } from "@/components/ui/pixel-primitives";
import type {
  InterventionAlert,
  InterventionRecord,
} from "@/lib/dashboard/interventions";
import { formatRawScore } from "@/lib/dashboard/raw-score";

const STATUS = {
  needs_attention: { label: "Needs Attention", variant: "danger", icon: "AlertTriangle" },
  in_progress: { label: "In Progress", variant: "warning", icon: "Clock" },
  addressed: { label: "Addressed", variant: "success", icon: "CheckCircle" },
} as const satisfies Record<
  string,
  { label: string; variant: "danger" | "warning" | "success"; icon: ActionIconName }
>;

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeZone: "Asia/Manila",
});

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function scoreText(
  correct: number | null,
  total: number | null,
  percentage: number | null,
): string {
  return (
    formatRawScore(correct, total) ??
    (percentage === null ? "—" : `${Math.round(percentage)}%`)
  );
}

export function StatusBadge({ status }: { status: keyof typeof STATUS }) {
  const { label, variant, icon } = STATUS[status];

  return (
    <PixelBadge variant={variant} className="gap-1 whitespace-nowrap">
      <ActionIcon name={icon} size={12} />
      {label}
    </PixelBadge>
  );
}

function AlertRow({
  alert,
  onStart,
  onAddress,
}: {
  alert: InterventionAlert;
  onStart: (alert: InterventionAlert, note: string) => Promise<void>;
  onAddress: (alert: InterventionAlert, note: string) => Promise<void>;
}) {
  const [note, setNote] = useState(alert.note);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputId = `intervention-note-${alert.attemptId}`;

  async function run(action: typeof onStart) {
    setBusy(true);
    setError("");
    try {
      await action(alert, note);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  function address() {
    if (note.trim() === "") {
      setError("Describe the action you took before marking this addressed.");
      return;
    }
    void run(onAddress);
  }

  return (
    <li className="space-y-1.5 border-2 border-ink bg-surface p-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="min-w-0 flex-1 basis-40 break-words text-sm">
          <strong>{alert.studentName}</strong> · {alert.quizTitle} ·{" "}
          {scoreText(alert.correct, alert.total, alert.percentage)}
        </span>
        <StatusBadge status={alert.status} />
      </div>

      <label htmlFor={inputId} className="sr-only">
        Action taken for {alert.studentName}
      </label>
      <textarea
        id={inputId}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={2}
        maxLength={1000}
        disabled={busy}
        placeholder="Action taken, e.g. discussed wrong answers, assigned remedial exercises…"
        className="pixel-input w-full border-2 border-ink bg-surface px-2 py-1.5 text-sm text-ink placeholder:text-ink/60 focus-visible:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
      />

      <div className="flex flex-wrap gap-1.5">
        {alert.status === "needs_attention" ? (
          <PixelButton
            type="button"
            size="sm"
            variant="neutral"
            icon="ClipboardList"
            disabled={busy}
            onClick={() => void run(onStart)}
          >
            Start Intervention
          </PixelButton>
        ) : null}
        <PixelButton
          type="button"
          size="sm"
          icon="CheckCheck"
          disabled={busy}
          onClick={address}
        >
          Mark Addressed
        </PixelButton>
      </div>

      {error ? (
        <p role="alert" className="text-xs text-danger-dark">
          {error}
        </p>
      ) : null}
    </li>
  );
}

/**
 * Active low-score alerts (Needs Attention / In Progress) with the teacher's
 * intervention actions, and a compact history of addressed alerts.
 * Marking an alert addressed does not claim the student has improved.
 */
export function InterventionPanel({
  alerts,
  history,
  loadError,
  onStart,
  onAddress,
}: {
  alerts: InterventionAlert[];
  history: InterventionRecord[];
  loadError: string;
  onStart: (alert: InterventionAlert, note: string) => Promise<void>;
  onAddress: (alert: InterventionAlert, note: string) => Promise<void>;
}) {
  const [showHistory, setShowHistory] = useState(false);
  const hasHistory = history.length > 0;

  if (alerts.length === 0 && !hasHistory && !loadError) return null;

  return (
    <PixelCard as="section" aria-label="Student interventions" className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold">
          Interventions{" "}
          <span className="text-xs font-normal text-neutral-600">
            ({alerts.length} active)
          </span>
        </h3>
        {hasHistory ? (
          <PixelButton
            type="button"
            size="sm"
            variant="neutral"
            icon="History"
            aria-expanded={showHistory}
            onClick={() => setShowHistory((open) => !open)}
          >
            Intervention History ({history.length})
          </PixelButton>
        ) : null}
      </div>

      {loadError ? (
        <p role="alert" className="text-xs text-danger-dark">
          Saved interventions could not be loaded: {loadError}
        </p>
      ) : null}

      {alerts.length === 0 ? (
        <p className="text-sm">No active alerts. Addressed ones are in the history.</p>
      ) : (
        <ul className="space-y-1.5">
          {alerts.map((alert) => (
            <AlertRow
              // Re-created when saved data arrives, so the saved note shows.
              key={`${alert.attemptId}:${alert.status}:${alert.note}`}
              alert={alert}
              onStart={onStart}
              onAddress={onAddress}
            />
          ))}
        </ul>
      )}

      {showHistory ? (
        <ul aria-label="Intervention history" className="space-y-1.5 border-t-2 border-ink pt-2">
          {history.map((record) => (
            <li
              key={record.attemptId}
              className="space-y-0.5 border-2 border-ink bg-surface p-2 text-sm"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="min-w-0 flex-1 basis-40 break-words">
                  <strong>{record.studentName}</strong> · {record.quizTitle} ·{" "}
                  {scoreText(record.correct, record.total, record.percentage)}
                </span>
                <StatusBadge status="addressed" />
              </div>
              <p className="break-words">{record.note}</p>
              <p className="text-xs text-neutral-600">
                Recorded {formatDate(record.createdAt)} · Addressed{" "}
                {formatDate(record.addressedAt)}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </PixelCard>
  );
}
