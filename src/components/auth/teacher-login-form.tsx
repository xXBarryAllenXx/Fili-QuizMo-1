"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
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

      const { data, error: userError } = await supabase.auth.getUser();

      if (userError) {
        setErrorMessage(userError.message);
        return;
      }

      if (data.user?.app_metadata.role !== "teacher") {
        const { error: signOutError } = await supabase.auth.signOut();
        setErrorMessage(
          signOutError
            ? `This account is not authorized for teacher access. ${signOutError.message}`
            : "This account is not authorized for teacher access.",
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
      {errorMessage ? (
        <p role="alert" className="text-sm text-red-600">
          {errorMessage}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Please wait..." : "Sign In as Teacher"}
      </Button>
    </form>
  );
}
