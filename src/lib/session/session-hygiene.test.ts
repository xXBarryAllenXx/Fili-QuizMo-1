import { describe, expect, it } from "vitest";
import { getDashboardResetUrl } from "./dashboard-url";

describe("getDashboardResetUrl", () => {
  it("keeps the active dashboard section and removes transient filters", () => {
    const url = new URL(
      "https://example.test/teacher-dashboard?entity=participants&q=private&status=completed&sort=name",
    );

    expect(getDashboardResetUrl(url)).toBe(
      "/teacher-dashboard?entity=participants",
    );
  });

  it("does not change clean dashboard or non-dashboard URLs", () => {
    expect(
      getDashboardResetUrl(
        new URL("https://example.test/admin-dashboard?entity=quizzes"),
      ),
    ).toBeNull();
    expect(
      getDashboardResetUrl(
        new URL("https://example.test/?q=keep-on-public-pages"),
      ),
    ).toBeNull();
  });
});
