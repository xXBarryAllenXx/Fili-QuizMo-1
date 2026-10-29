import { Suspense } from "react";
import { redirect } from "next/navigation";
import TeacherDashboardContent from "@/components/dashboard/teacher-dashboard-content";
import { createClient } from "@/lib/supabase/server";

export default function TeacherDashboardPage() {
  return (
    <Suspense
      fallback={
        <p className="p-8 text-sm text-neutral-600">
          Verifying teacher session...
        </p>
      }
    >
      <ProtectedTeacherDashboard />
    </Suspense>
  );
}

async function ProtectedTeacherDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    redirect("/teacher-login");
  }

  if (user.app_metadata.role !== "teacher") {
    redirect("/teacher-login?error=unauthorized");
  }

  return <TeacherDashboardContent />;
}
