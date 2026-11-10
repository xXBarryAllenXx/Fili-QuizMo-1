/**
 * Decides what a key press in a search box should submit.
 *
 * Typing only edits the draft; a search runs on Enter alone. Returns the query
 * to submit, or null when nothing should run: any other key, an IME
 * composition, or the query that is already applied (no duplicate request).
 * An empty draft returns "", which restores the unfiltered results.
 */
export function submittedQueryFor(
  key: string,
  composing: boolean,
  draft: string,
  applied: string,
): string | null {
  if (key !== "Enter" || composing) return null;
  const next = draft.trim();
  return next === applied ? null : next;
}
