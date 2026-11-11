import { createClient } from "@/lib/supabase/server";
import { isInvalidSession } from "@/lib/auth/session-errors";
import { buildAssessment } from "@/lib/dashboard/assessment";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

type PointsRpc = {
  rpc(
    fn: "quiz_attempt_points",
    args: { p_attempt_id: string },
  ): PromiseLike<{
    data: { question_id: string; points: number }[] | null;
    error: { message: string } | null;
  }>;
};

/**
 * Adds each question's points to the review payload so a weighted score can be
 * explained. Best effort: when the lookup is unavailable (for example the
 * database function is not installed yet) the review still loads, with every
 * question counted as 1 point as before.
 */
async function withQuestionPoints(
  supabase: unknown,
  payload: unknown,
  attemptId: string,
): Promise<unknown> {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !Array.isArray((payload as { questions?: unknown }).questions)
  ) {
    return payload;
  }

  try {
    const { data, error } = await (supabase as PointsRpc).rpc(
      "quiz_attempt_points",
      { p_attempt_id: attemptId },
    );
    if (error || !data) return payload;

    const pointsById = new Map(data.map((row) => [String(row.question_id), row.points]));
    const questions = (payload as { questions: unknown[] }).questions.map(
      (question) => {
        if (typeof question !== "object" || question === null) return question;
        const id = String((question as { question_id?: unknown }).question_id ?? "");
        const points = pointsById.get(id);
        return points === undefined ? question : { ...question, points };
      },
    );

    return { ...(payload as object), questions };
  } catch {
    return payload;
  }
}

/**
 * GET /api/assessment?attemptId=<uuid>
 *
 * Review of one finished quiz attempt: each question with its choices, the
 * correct answer and the student's answer. Who may see it (the student it
 * belongs to, the teacher who owns the quiz, or an admin with a verified
 * multi-factor session) is decided inside the student_assessment() database
 * function, so the correct answers are never readable any other way.
 */
export async function GET(request: Request): Promise<Response> {
  const attemptId = new URL(request.url).searchParams.get("attemptId") ?? "";

  if (!UUID_PATTERN.test(attemptId)) {
    return errorResponse(400, "INVALID_ATTEMPT", "Choose a valid quiz attempt.");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError && !isInvalidSession(authError)) {
    return errorResponse(
      503,
      "AUTH_CHECK_FAILED",
      "Unable to verify your sign-in session.",
    );
  }

  if (!user) {
    return errorResponse(401, "UNAUTHENTICATED", "Sign in to see your answers.");
  }

  // student_assessment is not in the generated database types yet. This typed
  // wrapper keeps it compiling; once you regenerate the types it can be a plain
  // supabase.rpc("student_assessment", { p_attempt_id: attemptId }) call.
  const { data, error } = await (
    supabase as unknown as {
      rpc(
        fn: "student_assessment",
        args: { p_attempt_id: string },
      ): PromiseLike<{
        data: unknown;
        error: { code?: string; message: string } | null;
      }>;
    }
  ).rpc("student_assessment", { p_attempt_id: attemptId });

  if (error) {
    switch (error.code) {
      case "28000":
        return errorResponse(
          401,
          "UNAUTHENTICATED",
          "Sign in to see your answers.",
        );
      case "P0002":
        return errorResponse(
          404,
          "ATTEMPT_NOT_FOUND",
          "We could not find that quiz attempt.",
        );
      default:
        console.error("Assessment load failed.", error.message);
        return errorResponse(
          503,
          "ASSESSMENT_FAILED",
          "Unable to load your answers right now.",
        );
    }
  }

  const assessment = buildAssessment(await withQuestionPoints(supabase, data, attemptId));

  if (!assessment) {
    console.error("Assessment payload was not in the expected shape.");
    return errorResponse(
      503,
      "ASSESSMENT_FAILED",
      "Unable to load your answers right now.",
    );
  }

  return Response.json(
    { assessment },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
