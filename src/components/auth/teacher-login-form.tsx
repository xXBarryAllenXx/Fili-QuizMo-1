"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";

export function TeacherLoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
      });

      if (signInError) {
        setErrorMessage("Invalid email or password.");
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        setErrorMessage(userError?.message ?? "Unable to fetch teacher account.");
        return;
      }

      const { data: teacher_accountsRow, error: teacher_accountsError } = await supabase
        .from("teacher_accounts")
        .select("school_id")
        .eq("school_id", userData.user.id)
        .maybeSingle();

      if (teacher_accountsError || !teacher_accountsRow) {
        const { error: signOutError } = await supabase.auth.signOut();
        setErrorMessage(
          signOutError
            ? `This account is not authorized for teacher access. ${signOutError.message}`
            : "This account is not authorized for teacher access."
        );
        return;
      }

      router.replace("/teacher-dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign in securely.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <FormField
        label="Email address"
        id="teacher-email"
        name="email"
        type="email"
        placeholder="teacher@example.com"
        autoComplete="email"
        required
      />
      <FormField
        label="Password"
        id="teacher-password"
        name="password"
        type="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        required
      />
      <div className="-mt-2 text-right">
        <Link
          href="/change-password"
          className="text-xs font-semibold text-secondary hover:underline focus-visible:outline"
        >
          Forgot password?
        </Link>
      </div>
      {errorMessage ? (
        <p role="alert" className="text-sm text-red-600">
          {errorMessage}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Spinner className="h-4 w-4" />
            Signing in...
          </span>
        ) : (
          "Sign In as Teacher"
        )}
      </Button>
    </form>
  );
}
