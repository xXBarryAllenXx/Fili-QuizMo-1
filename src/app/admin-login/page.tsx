import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Admin Login | Fili-QuizMo",
};

export default function AdminLoginPage() {
  return (
    <AuthShell
      title="Admin Login"
      subtitle="Sign in to manage quizzes, teacher data, and accounts."
      footer={
        <>
          Need the teacher portal?{" "}
          <Link
            href="/teacher-login"
            className="font-semibold text-primary hover:underline"
          >
            Login
          </Link>
        </>
      }
    >
      <AdminLoginForm />
    </AuthShell>
  );
}
