"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";

export function TeacherLoginForm() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/teacher-dashboard");
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
      <Button type="submit" className="w-full">
        Sign In as Teacher
      </Button>
    </form>
  );
}
