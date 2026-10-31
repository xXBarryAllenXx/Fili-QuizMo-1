import { getEntityConfig } from "./config";
import { SearchError } from "./errors";
import {
  buildSearchPlan,
  hasTeacherScope,
} from "./query-builder";
import type {
  ParticipantSearchItem,
  QuizSearchItem,
  SearchEntity,
  SearchItem,
  SearchQuery,
  SearchRepository,
  SearchResponse,
  SearchRow,
  SearchScope,
  TeacherSearchItem,
} from "./types";

function textValue(row: SearchRow, key: string): string {
  const value = row[key];

  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function nestedValue(
  row: SearchRow,
  relation: string,
  key: string,
): unknown {
  const value = row[relation];

  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === "object"
      ? (first as Record<string, unknown>)[key]
      : undefined;
  }

  if (value && typeof value === "object") {
    return (value as Record<string, unknown>)[key];
  }

  return undefined;
}

function nestedTextValue(
  row: SearchRow,
  relation: string,
  key: string,
): string {
  const value = nestedValue(row, relation, key);

  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function nestedCount(row: SearchRow, relation: string): number | null {
  return toNumber(nestedValue(row, relation, "count"));
}

function toNumber(value: unknown): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(parsed) ? parsed : null;
}

function numberValue(
  row: SearchRow,
  key: string,
  fallback = 0,
): number {
  return toNumber(row[key]) ?? fallback;
}

function nullableNumberValue(
  row: SearchRow,
  key: string,
): number | null {
  return toNumber(row[key]);
}

function usernameFromEmail(email: string): string {
  return email.split("@")[0]?.trim() ?? "";
}

export function mapSearchItem(
  entity: SearchEntity,
  row: SearchRow,
): SearchItem {
  if (entity === "quizzes") {
    const item: QuizSearchItem = {
      entity: "quizzes",
      id: textValue(row, "session_id"),
      title: textValue(row, "title"),
      status: textValue(row, "status"),
      shareCode: textValue(row, "share_code"),
      questionCount: numberValue(row, "requested_question_count"),
      teacherId: textValue(row, "teacher_id"),
      teacherUsername: nestedTextValue(row, "teachers", "username"),
      createdAt: textValue(row, "created_at"),
    };

    return item;
  }

  if (entity === "participants") {
    const totalQuestions = numberValue(row, "total_questions");
    const answeredCount = numberValue(row, "answered_count");
    const completed =
      totalQuestions > 0 && answeredCount >= totalQuestions;

    const item: ParticipantSearchItem = {
      entity: "participants",
      id: textValue(row, "attempt_id"),
      username: textValue(row, "participant_username"),
      status: completed ? "completed" : "in_progress",
      score: nullableNumberValue(row, "percentage"),
      quizTitle: textValue(row, "title"),
      sessionId: textValue(row, "session_id"),
      sessionCode: textValue(row, "share_code"),
      teacherId: textValue(row, "teacher_id"),
      teacherUsername: textValue(row, "teacher_username"),
      joinedAt: textValue(row, "recorded_at"),
    };

    return item;
  }

  const email = textValue(row, "email");
  const item: TeacherSearchItem = {
    entity: "teachers",
    id: textValue(row, "id"),
    username:
      textValue(row, "username") || usernameFromEmail(email),
    email,
    accountStatus: textValue(row, "status"),
    quizCount: nestedCount(row, "quizzes"),
    createdAt: textValue(row, "created_at"),
  };

  return item;
}

export async function executeSearch(input: {
  context: SearchScope;
  query: SearchQuery;
  repository: SearchRepository;
}): Promise<SearchResponse> {
  const plan = buildSearchPlan(input.query, input.context);

  if (!hasTeacherScope(plan, input.context)) {
    throw new SearchError(
      500,
      "SCOPE_INVARIANT_FAILED",
      "Search was stopped because its permission scope was invalid.",
    );
  }

  const { rows, total } = await input.repository.search(plan);
  const config = getEntityConfig(input.query.entity);
  const totalPages = Math.max(
    1,
    Math.ceil(total / input.query.pageSize),
  );

  return {
    items: rows.map((row) => mapSearchItem(input.query.entity, row)),
    pagination: {
      page: input.query.page,
      pageSize: input.query.pageSize,
      total,
      totalPages,
    },
    meta: {
      entity: input.query.entity,
      role: input.context.role,
      scope:
        input.context.role === "teacher"
          ? "own-records"
          : "all-records",
      dataSource: input.repository.dataSource,
      filters: {
        q: input.query.q,
        accountStatus: input.query.accountStatus,
        teacher: input.query.teacher,
        quiz: input.query.quiz,
        session: input.query.session,
        from: input.query.from,
        to: input.query.to,
      },
      sort: input.query.sort,
      dir: input.query.dir,
      searchableFields: [...config.searchableFields],
    },
  };
}
