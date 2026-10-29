import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
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
    </AuthShell>
  );
}
