import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { TeacherLoginForm } from "@/components/auth/teacher-login-form";

export default function TeacherLoginPage() {
  return (
    <AuthShell
      title="Teacher Login"
      subtitle="Sign in to manage quizzes, students, and scores."
      footer={
        <>
          New to Fili-QuizMo?{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <TeacherLoginForm />
      <div className="mt-6 border-t border-neutral-200 pt-6 text-center">
        <p className="text-sm text-neutral-500">
          Are you an administrator?
        </p>
        <ButtonLink
          href="/admin-login"
          variant="outline"
          className="mt-3 w-full"
        >
          Admin Login
        </ButtonLink>
      </div>
    </AuthShell>
  );
}
