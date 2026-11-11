import { describe, expect, it } from "vitest";
import { PASSWORD_RULES, validatePassword } from "./password-policy";

const failedIds = (password: string, identity: string[] = []) =>
  validatePassword(password, identity)
    .results.filter((result) => !result.passed)
    .map((result) => result.id);

describe("password policy", () => {
  it("accepts 8+ characters with a lowercase letter and a number", () => {
    const validation = validatePassword("sunflower7", [
      "maria@example.com",
      "maria",
    ]);

    expect(validation.valid).toBe(true);
  });

  it("accepts a long passphrase of 15+ characters with no number", () => {
    expect(validatePassword("purple monkey walks home").valid).toBe(true);
  });

  it("rejects a short password that lacks a number", () => {
    expect(validatePassword("sunflower").valid).toBe(false);
    expect(failedIds("sunflower")).toEqual(
      expect.arrayContaining(["long", "mix"]),
    );
  });

  it("rejects a very common password", () => {
    expect(validatePassword("password").valid).toBe(false);
    expect(failedIds("password")).toContain("common");
  });

  it("rejects a password containing the email or username", () => {
    const validation = validatePassword("maria1234!", [
      "maria@example.com",
      "maria",
    ]);
    const identity = validation.results.find(
      (result) => result.id === "identity",
    );

    expect(identity?.passed).toBe(false);
    expect(validation.valid).toBe(false);
  });

  it("enforces the 72-byte limit", () => {
    expect(validatePassword("a1" + "x".repeat(70)).valid).toBe(true);
    expect(validatePassword("a1" + "x".repeat(71)).valid).toBe(false);
  });

  it("exposes every rule shown in the UI", () => {
    expect(PASSWORD_RULES.map((rule) => rule.id)).toEqual([
      "long",
      "mix",
      "max-length",
      "common",
    ]);
  });
});
