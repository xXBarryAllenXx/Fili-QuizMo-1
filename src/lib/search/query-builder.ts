import { getEntityConfig } from "./config";
import { SearchError } from "./errors";
import { assertEntityAllowed } from "./scope";
import type {
  SearchPlan,
  SearchPlanFilter,
  SearchQuery,
  SearchScope,
} from "./types";

export function escapeLikePattern(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

export function containsPattern(value: string): string {
  return `%${escapeLikePattern(value)}%`;
}

/**
 * PostgREST uses commas and parentheses as structural characters inside
 * `or=(...)` expressions. Values are quoted before being sent, but removing
 * these characters from free-text input is a cheap second layer of defence
 * against malformed filters.
 */
export function sanitizeOrSearchTerm(value: string): string {
  return value.replace(/[(),]/g, " ").replace(/\s+/g, " ").trim();
}

export function quotePostgrestValue(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * Builds a PostgREST `or` expression from columns that come from the
 * server-side configuration. User input only ever reaches the quoted pattern.
 */
export function buildPostgrestOrFilter(
  columns: readonly string[],
  pattern: string,
): string {
  return columns
    .map((column) => `${column}.ilike.${quotePostgrestValue(pattern)}`)
    .join(",");
}

export function buildSearchPlan(
  query: SearchQuery,
  scope: SearchScope,
): SearchPlan {
  assertEntityAllowed(scope.role, query.entity);

  const config = getEntityConfig(query.entity);
  const scopeValue =
    config.scopeId === "teacher"
      ? scope.teacherNumericId
      : scope.teacherId;

  if (
    scope.role === "teacher" &&
    (scopeValue === null || scopeValue === undefined || scopeValue === "")
  ) {
    throw new SearchError(
      403,
      "SCOPE_REQUIRED",
      "A teacher scope is required for this search.",
    );
  }

  const filters: SearchPlanFilter[] = [];

  // The permission scope is always the first filter. User-supplied filters
  // can only narrow this set; they can never replace or widen it.
  if (scope.role === "teacher" && scopeValue !== null && scopeValue !== undefined) {
    filters.push({
      column: config.scopeColumn,
      operator: "eq",
      value: String(scopeValue),
    });
  }

  if (
    query.accountStatus &&
    config.accountStatusColumn &&
    config.filters.includes("accountStatus")
  ) {
    filters.push({
      column: config.accountStatusColumn,
      operator: "eq",
      value: query.accountStatus,
    });
  }

  if (query.teacher && config.filters.includes("teacher")) {
    filters.push({
      column:
        config.table === "quizzes"
          ? "teachers.username"
          : "teacher_username",
      operator: "ilike",
      value: containsPattern(query.teacher),
    });
  }

  if (query.quiz && config.filters.includes("quiz")) {
    filters.push({
      column: "title",
      operator: "ilike",
      value: containsPattern(query.quiz),
    });
  }

  if (query.session && config.filters.includes("session")) {
    filters.push({
      column: "session_id",
      operator: "ilike",
      value: containsPattern(query.session),
    });
  }

  if (query.from) {
    filters.push({
      column: config.dateColumn,
      operator: "gte",
      value: `${query.from}T00:00:00.000Z`,
    });
  }

  if (query.to) {
    filters.push({
      column: config.dateColumn,
      operator: "lte",
      value: `${query.to}T23:59:59.999999Z`,
    });
  }

  const offset = (query.page - 1) * query.pageSize;
  const searchTerm = sanitizeOrSearchTerm(query.q);

  return {
    entity: query.entity,
    table: config.table,
    select: config.select.map((column) =>
      query.teacher && column === "teachers(username)"
        ? "teachers!inner(username)"
        : column,
    ),
    filters,
    search: searchTerm
      ? {
          columns: [...config.searchColumns],
          pattern: containsPattern(searchTerm),
          rawTerm: query.q,
        }
      : null,
    order: [
      {
        column: config.sortColumns[query.sort],
        ascending: query.dir === "asc",
      },
      {
        column: config.idColumn,
        ascending: true,
      },
    ],
    range: {
      from: offset,
      to: offset + query.pageSize - 1,
    },
    count: "exact",
  };
}

export function hasTeacherScope(
  plan: SearchPlan,
  scope: SearchScope,
): boolean {
  if (scope.role !== "teacher") {
    return true;
  }

  const firstFilter = plan.filters[0];
  const config = getEntityConfig(plan.entity);
  const scopeValue =
    config.scopeId === "teacher"
      ? scope.teacherNumericId
      : scope.teacherId;

  return Boolean(
    scopeValue !== null &&
      scopeValue !== undefined &&
      scopeValue !== "" &&
      firstFilter &&
      firstFilter.column === config.scopeColumn &&
      firstFilter.operator === "eq" &&
      firstFilter.value === String(scopeValue),
  );
}
