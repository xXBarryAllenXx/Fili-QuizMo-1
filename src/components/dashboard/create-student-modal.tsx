"use client";

import { useState, type FormEvent } from "react";
import { PixelModal } from "@/components/ui/pixel-modal";
import {
  PasswordRequirements,
  PASSWORD_REQUIREMENTS_ID,
} from "@/components/ui/password-requirements";
import { PixelButton, PixelInput } from "@/components/ui/pixel-primitives";
import { addStudents, type TeacherClass } from "@/lib/classes/client";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validatePassword,
} from "@/lib/password-policy";

type Created = { username: string; password: string | null; inClass: boolean };

function apiError(body: unknown): string | null {
  if (typeof body !== "object" || body === null || !("error" in body)) {
    return null;
  }

  const error = (body as { error: unknown }).error;
  if (typeof error === "string") return error;
  if (
    typeof error === "object" &&
    error !== null &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return null;
}

/**
 * Creates a student account and puts the student straight into a class. When
 * it works, the modal shows the username and one-time password so the teacher
 * can hand them over.
 */
export function CreateStudentModal({
  target,
  onClose,
  onCreated,
}: {
  target: TeacherClass;
  onClose: () => void;
  /** Called once the account exists, so the class list can reload. */
  onCreated: () => void;
}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<Created | null>(null);
  const [copied, setCopied] = useState(false);

  function close() {
    if (!saving) onClose();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const name = username.trim();
    if (password && !validatePassword(password, [email, name]).valid) {
      setError("The temporary password does not meet all of the requirements.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          accountRole: "student",
          username: name,
          email: email.trim(),
          ...(password ? { password } : {}),
        }),
        cache: "no-store",
      });
      const result: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(apiError(result) ?? "Unable to create the account.");
      }

      const temporary =
        typeof result === "object" &&
        result !== null &&
        typeof (result as { temporary_password?: unknown }).temporary_password ===
          "string"
          ? (result as { temporary_password: string }).temporary_password
          : null;

      // The account exists now; adding it to the class is a second step that
      // can fail on its own, and the teacher can retry that from the class.
      let inClass = true;
      try {
        await addStudents(target.classId, [name]);
      } catch {
        inClass = false;
      }

      setCreated({ username: name, password: temporary ?? (password || null), inClass });
      onCreated();
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Unable to create the account.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function copyPassword() {
    if (!created?.password) return;

    try {
      await navigator.clipboard.writeText(created.password);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (created) {
    return (
      <PixelModal title="Student created" onClose={onClose} className="max-w-md">
        <div className="space-y-3 text-sm">
          <p>
            <strong>{created.username}</strong>{" "}
            {created.inClass
              ? `was added to ${target.name}.`
              : `has an account, but could not be added to ${target.name}. Use "Add students" to try again.`}
          </p>
          {created.password ? (
            <div className="border-2 border-ink bg-accent/20 p-3">
              <p className="text-xs">
                One-time password. Share it securely; it is not shown again.
              </p>
              <p className="mt-1 break-all font-mono text-base font-bold">
                {created.password}
              </p>
              <PixelButton
                type="button"
                size="sm"
                variant="neutral"
                className="mt-2"
                onClick={() => void copyPassword()}
              >
                {copied ? "Copied" : "Copy password"}
              </PixelButton>
            </div>
          ) : null}
          <div className="flex justify-end">
            <PixelButton type="button" onClick={onClose}>
              Done
            </PixelButton>
          </div>
        </div>
      </PixelModal>
    );
  }

  return (
    <PixelModal
      title={`New student in ${target.name}`}
      onClose={close}
      className="max-w-md"
    >
      <form className="space-y-3" onSubmit={(event) => void submit(event)}>
        <label htmlFor="new-student-username" className="block text-sm font-semibold">
          Name / username
          <PixelInput
            id="new-student-username"
            autoComplete="off"
            minLength={3}
            maxLength={15}
            pattern="[A-Za-z][A-Za-z0-9_]{2,14}"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>
        <label htmlFor="new-student-email" className="block text-sm font-semibold">
          Email
          <PixelInput
            id="new-student-email"
            type="email"
            autoComplete="off"
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <div>
          <label htmlFor="new-student-password" className="block text-sm font-semibold">
            Temporary password
          </label>
          <PixelInput
            id="new-student-password"
            type="password"
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={PASSWORD_MAX_LENGTH}
            aria-describedby={`new-student-password-help ${PASSWORD_REQUIREMENTS_ID}`}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <span id="new-student-password-help" className="mt-1 block text-xs">
            Leave blank to generate a one-time password.
          </span>
          <PasswordRequirements
            password={password}
            email={email}
            username={username}
            context="create"
            className="mt-1"
          />
        </div>
        {error ? (
          <p role="alert" className="text-sm text-danger-dark">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <PixelButton type="button" variant="danger" onClick={close} disabled={saving}>
            Cancel
          </PixelButton>
          <PixelButton type="submit" disabled={saving} aria-busy={saving}>
            {saving ? "Creating..." : "Create student"}
          </PixelButton>
        </div>
      </form>
    </PixelModal>
  );
}
