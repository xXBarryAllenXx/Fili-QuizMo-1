export const DASHBOARD_DATA_CHANGED_EVENT = "dashboard-data-changed";

export const DASHBOARD_REALTIME_TABLES = [
  "quizzes",
  "quiz_results",
  "teachers",
] as const;

export type DashboardRealtimeTable =
  (typeof DASHBOARD_REALTIME_TABLES)[number];

function isDashboardRealtimeTable(
  value: unknown,
): value is DashboardRealtimeTable {
  return (
    typeof value === "string" &&
    (DASHBOARD_REALTIME_TABLES as readonly string[]).includes(value)
  );
}

export function notifyDashboardDataChanged(
  tables: readonly DashboardRealtimeTable[],
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(DASHBOARD_DATA_CHANGED_EVENT, {
      detail: { tables },
    }),
  );
}

export function dashboardTablesFromEvent(
  event: Event,
): DashboardRealtimeTable[] {
  if (
    typeof CustomEvent === "undefined" ||
    !(event instanceof CustomEvent)
  ) {
    return [];
  }

  const detail: unknown = event.detail;

  if (!detail || typeof detail !== "object" || !("tables" in detail)) {
    return [];
  }

  const tables = (detail as { tables?: unknown }).tables;

  if (!Array.isArray(tables)) {
    return [];
  }

  return tables.filter(isDashboardRealtimeTable);
}
