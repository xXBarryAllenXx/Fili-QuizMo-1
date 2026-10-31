import type {
  SearchPlan,
  SearchRepository,
  SearchRow,
} from "./types";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function likeRegExp(pattern: string): RegExp {
  let source = "^";

  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];

    if (character === "\\") {
      index += 1;
      source += escapeRegExp(pattern[index] ?? "");
    } else if (character === "%") {
      source += ".*";
    } else if (character === "_") {
      source += ".";
    } else {
      source += escapeRegExp(character);
    }
  }

  return new RegExp(`${source}$`, "i");
}

function columnValue(row: SearchRow, column: string): unknown {
  if (!column.includes(".")) {
    return row[column];
  }

  let value: unknown = row;

  for (const part of column.split(".")) {
    if (Array.isArray(value)) {
      value = value[0];
    }

    if (!value || typeof value !== "object") {
      return undefined;
    }

    value = (value as Record<string, unknown>)[part];
  }

  return value;
}

function matchesFilter(
  row: SearchRow,
  filter: SearchPlan["filters"][number],
): boolean {
  const rawValue = columnValue(row, filter.column);
  const value = rawValue === null || rawValue === undefined
    ? ""
    : String(rawValue);

  switch (filter.operator) {
    case "eq":
      return value === filter.value;
    case "ilike":
      return likeRegExp(filter.value).test(value);
    case "gte":
      return value >= filter.value;
    case "lte":
      return value <= filter.value;
  }
}

function compareValues(left: unknown, right: unknown): number {
  if (left === null || left === undefined) {
    return right === null || right === undefined ? 0 : 1;
  }

  if (right === null || right === undefined) {
    return -1;
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right), "en", {
    numeric: true,
    sensitivity: "base",
  });
}

export function applyPlanToRows(
  rows: readonly SearchRow[],
  plan: SearchPlan,
): { rows: SearchRow[]; total: number } {
  const searchRegex = plan.search
    ? likeRegExp(plan.search.pattern)
    : null;

  const filtered = rows.filter((row) => {
    if (!plan.filters.every((filter) => matchesFilter(row, filter))) {
      return false;
    }

    if (!plan.search || !searchRegex) {
      return true;
    }

    return plan.search.columns.some((column) =>
      searchRegex.test(String(columnValue(row, column) ?? "")),
    );
  });

  const sorted = filtered.slice().sort((left, right) => {
    for (const order of plan.order) {
      const comparison = compareValues(
        columnValue(left, order.column),
        columnValue(right, order.column),
      );

      if (comparison !== 0) {
        return order.ascending ? comparison : -comparison;
      }
    }

    return 0;
  });

  return {
    rows: sorted.slice(plan.range.from, plan.range.to + 1),
    total: filtered.length,
  };
}

export class MockSearchRepository implements SearchRepository {
  readonly dataSource = "mock" as const;

  constructor(
    private readonly rows: Record<
      SearchPlan["entity"],
      readonly SearchRow[]
    >,
  ) {}

  async search(plan: SearchPlan) {
    return applyPlanToRows(this.rows[plan.entity] ?? [], plan);
  }
}
