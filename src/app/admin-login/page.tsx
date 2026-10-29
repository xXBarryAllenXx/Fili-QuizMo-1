import Link from "next/link";
import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { AuthShell } from "@/components/auth/auth-shell";
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
            Teacher Login
          </Link>
        </>
      }
    >
      <AdminLoginForm />
    </AuthShell>
  );
}
