const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Attempts per request, and how many are read at the same time. */
const MAX_ATTEMPTS = 100;
const CONCURRENCY = 8;

type Summary = {
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
  weighted?: boolean;
};

function errorResponse(
  status: number,
  code: string,
  message: string,
): Response {
  return Response.json(
    { error: { code, message } },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}

function readSummary(body: unknown): Summary | null {
  if (typeof body !== "object" || body === null || !("assessment" in body)) {
    return null;
  }

  const assessment = body.assessment;
  if (
    typeof assessment !== "object" ||
    assessment === null ||
    !("summary" in assessment)
  ) {
    return null;
  }

  const summary = assessment.summary as Partial<Summary> | null;
  if (
    !summary ||
    typeof summary.correct !== "number" ||
    typeof summary.wrong !== "number" ||
    typeof summary.skipped !== "number" ||
    typeof summary.total !== "number"
  ) {
    return null;
  }

  return {
    correct: summary.correct,
    wrong: summary.wrong,
    skipped: summary.skipped,
    total: summary.total,
    weighted: summary.weighted === true,
  };
}

/**
 * GET /api/assessment/summary?attemptIds=<uuid>,<uuid>,...
 *
 * The right / wrong / skipped counts of several attempts at once, for the
 * cards above the student's Assessment list.
 *
 * Each attempt is read from GET /api/assessment, the same endpoint the review
 * page uses, with the caller's own session. That is on purpose: whatever that
 * endpoint decides (who may see the attempt, how points are counted, how wrong
 * and skipped are worked out) applies here too, so the cards and the review can
 * never show different numbers. Attempts it refuses or cannot load are left out.
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const ids = [
    ...new Set(
      (url.searchParams.get("attemptIds") ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ];

  if (
    ids.length === 0 ||
    ids.length > MAX_ATTEMPTS ||
    !ids.every((id) => UUID_PATTERN.test(id))
  ) {
    return errorResponse(400, "INVALID_ATTEMPT", "Choose valid quiz attempts.");
  }

  // The caller's own sign-in, passed on so the review endpoint applies its
  // usual checks for this person.
  const cookie = request.headers.get("cookie");
  const headers: HeadersInit = cookie ? { cookie } : {};
  const summaries: Record<string, Summary> = {};
  let next = 0;

  async function worker(): Promise<void> {
    while (next < ids.length) {
      const id = ids[next++];

      try {
        const response = await fetch(
          new URL(
            `/api/assessment?attemptId=${encodeURIComponent(id)}`,
            url.origin,
          ),
          { headers, cache: "no-store", signal: request.signal },
        );
        if (!response.ok) continue;

        const summary = readSummary(await response.json());
        if (summary) summaries[id] = summary;
      } catch {
        /* this attempt is left out; the page shows "—" instead of a wrong number */
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, ids.length) }, worker),
  );

  return Response.json(
    { summaries },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
