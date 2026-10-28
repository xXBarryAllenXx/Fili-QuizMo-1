"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";

export function SignupForm() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/teacher-login");
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <FormField
        label="Full name"
        id="signup-name"
        name="name"
        type="text"
        placeholder="Your full name"
        autoComplete="name"
        required
      />
      <FormField
        label="Email address"
        id="signup-email"
        name="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
      <FormField
        label="Password"
        id="signup-password"
        name="password"
        type="password"
        placeholder="Create a password"
        autoComplete="new-password"
        required
      />
      <FormField
        label="Confirm password"
        id="signup-confirm-password"
        name="confirmPassword"
        type="password"
        placeholder="Confirm your password"
        autoComplete="new-password"
        required
      />
      <Button type="submit" className="w-full">
        Create Account
      </Button>
    </form>
  );
}
