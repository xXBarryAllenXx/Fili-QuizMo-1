import { describe, expect, it } from "vitest";
import { submittedQueryFor } from "./submit-search";

describe("submittedQueryFor", () => {
  it("does not search while typing, whatever the draft holds", () => {
    for (const key of ["a", "Backspace", "Tab", " ", "ArrowLeft"]) {
      expect(submittedQueryFor(key, false, "mari", "")).toBeNull();
    }
  });

  it("searches once on Enter with the typed text", () => {
    expect(submittedQueryFor("Enter", false, "  maria ", "")).toBe("maria");
  });

  it("does not repeat a search for the query already applied", () => {
    expect(submittedQueryFor("Enter", false, "maria", "maria")).toBeNull();
    expect(submittedQueryFor("Enter", false, "maria ", "maria")).toBeNull();
  });

  it("lets an applied query be edited and searched again", () => {
    expect(submittedQueryFor("Enter", false, "maria santos", "maria")).toBe("maria santos");
  });

  it("restores the unfiltered results when Enter is pressed on an empty box", () => {
    expect(submittedQueryFor("Enter", false, "", "maria")).toBe("");
    expect(submittedQueryFor("Enter", false, "   ", "maria")).toBe("");
  });

  it("does nothing on Enter for an empty box with nothing applied", () => {
    expect(submittedQueryFor("Enter", false, "", "")).toBeNull();
  });

  it("ignores Enter that confirms an IME composition", () => {
    expect(submittedQueryFor("Enter", true, "ma", "")).toBeNull();
  });
});
