import { Suspense } from "react";
import { redirect } from "next/navigation";
import AdminDashboardContent from "@/components/dashboard/admin-dashboard-content";
import { createClient } from "@/lib/supabase/server";

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <p className="p-8 text-sm text-neutral-600">
          Verifying admin session...
        </p>
      }
    >
      <ProtectedAdminDashboard />
    </Suspense>
  );
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

  const { data: adminRow, error: adminError } = await supabase
          .from("admin")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

  if (adminError || !adminRow) {
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
