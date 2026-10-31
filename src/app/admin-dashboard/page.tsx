import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import AdminDashboardContent from "@/components/dashboard/admin-dashboard-content";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { getAdminDashboardData } from "@/lib/dashboard/data";
import { createClient } from "@/lib/supabase/server";

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={<LoadingScreen label="Verifying admin session..." fullScreen />}
    >
      <ProtectedAdminDashboard />
    </Suspense>
  );
}

async function ProtectedAdminDashboard() {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    redirect("/admin-login");
  }

  const { data: adminAccount, error: adminAccountError } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminAccountError || !adminAccount) {
    redirect("/admin-login?error=unauthorized");
  }

  const { data: assurance, error: assuranceError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (assuranceError) {
    throw assuranceError;
  }

  if (assurance.currentLevel !== "aal2") {
    redirect("/admin-login?mfa=required");
  }

  const data = await getAdminDashboardData(
    supabase,
    user.email?.trim() ?? "",
  );

  return <AdminDashboardContent data={data} />;
}
