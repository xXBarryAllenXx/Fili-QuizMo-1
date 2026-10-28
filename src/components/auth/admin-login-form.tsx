"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";

export function AdminLoginForm() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/admin-dashboard");
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <FormField
        label="Admin email"
        id="admin-email"
        name="email"
        type="email"
        placeholder="admin@example.com"
        autoComplete="email"
        required
      />
      <FormField
        label="Password"
        id="admin-password"
        name="password"
        type="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        required
      />
      <Button type="submit" className="w-full">
        Sign In as Admin
      </Button>
    </form>
  );
}
