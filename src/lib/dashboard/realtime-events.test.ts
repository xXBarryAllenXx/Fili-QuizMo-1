import { describe, expect, it } from "vitest";
import {
  DASHBOARD_DATA_CHANGED_EVENT,
  dashboardTablesFromEvent,
} from "./realtime-events";

describe("dashboard realtime events", () => {
  it("keeps known table names from a change event", () => {
    const event = new CustomEvent(DASHBOARD_DATA_CHANGED_EVENT, {
      detail: { tables: ["quizzes", "teachers", "not-a-table"] },
    });

    expect(dashboardTablesFromEvent(event)).toEqual([
      "quizzes",
      "teachers",
    ]);
  });

  it("ignores unrelated and malformed events", () => {
    expect(dashboardTablesFromEvent(new Event("unrelated"))).toEqual([]);

    const malformed = new CustomEvent(DASHBOARD_DATA_CHANGED_EVENT, {
      detail: { tables: "quizzes" },
    });

    expect(dashboardTablesFromEvent(malformed)).toEqual([]);
  });
});
