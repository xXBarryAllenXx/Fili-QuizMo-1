import { redirect } from "next/navigation";
import TeacherDashboardContent from "@/components/dashboard/teacher-dashboard-content";
import { createClient } from "@/lib/supabase/server";

export default function TeacherDashboardPage() {
  return <ProtectedTeacherDashboard />;
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

  const { data: teacher_accountsRow, error: teacher_accountsError } = await supabase
            .from("teacher_accounts")
            .select("school_id")
            .eq("school_id", user.id)
            .maybeSingle();
  
    if (teacher_accountsError || !teacher_accountsRow) {
      redirect("/teacher-login?error=unauthorized");
    }
  

  return <TeacherDashboardContent />;
}
