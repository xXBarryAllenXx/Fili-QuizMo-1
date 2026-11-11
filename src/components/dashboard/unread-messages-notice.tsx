"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PixelButton } from "@/components/ui/pixel-primitives";
import { SESSION_ENDED_EVENT } from "@/lib/auth/session-state";
import {
  parseUnreadSummary,
  unreadNotice,
  type UnreadSummary,
} from "@/lib/dashboard/unread-messages";

// Checks closer together than this reuse the last answer. Returning to a tab
// fires both "focus" and "visibilitychange", and opening Overview again mounts
// the notice again; none of that needs a new request.
const MIN_GAP_MS = 20_000;
const POLL_MS = 60_000;

let lastCheck: { at: number; summary: UnreadSummary } | null = null;
let inFlight = false;

if (typeof window !== "undefined") {
  window.addEventListener(SESSION_ENDED_EVENT, () => {
    lastCheck = null;
  });
}

/** Forget the last answer so the next check asks the server (e.g. after reading). */
export function invalidateUnreadMessages(): void {
  lastCheck = null;
}

/**
 * Runs `refresh` when the person comes back to this tab or window, and every
 * `everyMs` while it is open and visible, so a dashboard that was left open
 * still picks up messages that arrived in the meantime.
 */
export function useRefreshOnReturn(refresh: () => void, everyMs = POLL_MS) {
  useEffect(() => {
    const run = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("focus", run);
    document.addEventListener("visibilitychange", run);
    const timer = window.setInterval(run, everyMs);

    return () => {
      window.removeEventListener("focus", run);
      document.removeEventListener("visibilitychange", run);
      window.clearInterval(timer);
    };
  }, [refresh, everyMs]);
}

/**
 * One slim line on the dashboard when someone has written to you since you last
 * opened that quiz's messages. It checks when the page is shown and again when
 * you return to it or every minute (never more than once every 20 seconds), stays until the messages are opened, and
 * shows nothing when there is nothing new (or when the check fails, so it never
 * gets in the way).
 */
export function UnreadMessagesNotice({
  viewer,
  onOpen,
}: {
  viewer: "student" | "teacher";
  /** attemptId opens that review; null opens the list of quizzes. */
  onOpen: (attemptId: string | null) => void;
}) {
  const [summary, setSummary] = useState<UnreadSummary | null>(
    () => lastCheck?.summary ?? null,
  );
  const latestRequest = useRef(0);

  const load = useCallback(() => {
    if (inFlight || (lastCheck && Date.now() - lastCheck.at < MIN_GAP_MS)) {
      return;
    }

    const request = ++latestRequest.current;
    inFlight = true;

    fetch("/api/assessment/messages", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;

        const body: unknown = await response.json();

        // An older, slower answer must not replace a newer one.
        if (request !== latestRequest.current) return;

        if (typeof body === "object" && body !== null && "unread" in body) {
          const parsed = parseUnreadSummary(body.unread);
          lastCheck = { at: Date.now(), summary: parsed };
          setSummary(parsed);
        }
      })
      .catch(() => {
        /* the notice is optional */
      })
      .finally(() => {
        inFlight = false;
      });
  }, []);

  // Not aborted on unmount: the answer is tiny and is kept for the next visit.
  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => load(), [load]);
  useRefreshOnReturn(refresh);

  const notice = useMemo(
    () => (summary ? unreadNotice(summary, viewer) : null),
    [summary, viewer],
  );

  if (!notice) return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-2 border-ink bg-surface px-2.5 py-1.5 text-xs text-ink sm:text-sm"
    >
      <span
        aria-hidden="true"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center border-2 border-ink bg-accent-dark text-sm font-bold"
      >
        ✉
      </span>
      <p className="min-w-0 flex-1 basis-40 break-words">
        <strong>New message!</strong> {notice.message}
      </p>
      <PixelButton
        type="button"
        size="sm"
        variant="primary"
        className="shrink-0 whitespace-nowrap"
        onClick={() => onOpen(notice.attemptId)}
        icon="MessageSquare"
      >
        Read
      </PixelButton>
    </div>
  );
}
