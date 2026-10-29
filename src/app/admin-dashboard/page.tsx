import { redirect } from "next/navigation";
import AdminDashboardContent from "@/components/dashboard/admin-dashboard-content";
import { createClient } from "@/lib/supabase/server";

export default function AdminDashboardPage() {
  return <ProtectedAdminDashboard />;
}

async function ProtectedAdminDashboard() {
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

  const { data: admin_accountsRow, error: admin_accountsError } = await supabase
          .from("admin_accounts")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

  if (admin_accountsError || !admin_accountsRow) {
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

  return <AdminDashboardContent />;
}
