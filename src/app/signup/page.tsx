import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create an Account"
      subtitle="Sign up to start using Fili-QuizMo."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/teacher-login"
            className="font-semibold text-primary hover:underline"
          >
            Login
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
