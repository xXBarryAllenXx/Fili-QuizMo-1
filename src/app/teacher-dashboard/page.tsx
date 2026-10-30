import { Suspense } from "react";
import { redirect } from "next/navigation";
import TeacherDashboardContent from "@/components/dashboard/teacher-dashboard-content";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { getTeacherDashboardData } from "@/lib/dashboard/data";
import { createClient } from "@/lib/supabase/server";

export default function TeacherDashboardPage() {
  return (
    <Suspense
      fallback={
        <LoadingScreen label="Verifying teacher session..." fullScreen />
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

  const metadataRole =
    typeof user.app_metadata?.role === "string"
      ? user.app_metadata.role.trim().toLowerCase()
      : null;

  if (metadataRole && metadataRole !== "teacher") {
    redirect("/teacher-login?error=unauthorized");
  }

  // Older teacher accounts may not have app_metadata.role yet. In that case
  // fall back to checking whether this auth user owns any quiz sessions.

  if (!metadataRole) {
    const { data: teacherAccount, error: teacherError } = await supabase
      .from("teacher_accounts")
      .select("school_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (teacherError || !teacherAccount) {
      redirect("/teacher-login?error=unauthorized");
    }
  }

  const data = await getTeacherDashboardData(supabase, user);

  return <TeacherDashboardContent data={data} />;
}
