"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  DashboardShell,
  type DashboardNavItem,
} from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { SearchFilter } from "@/components/dashboard/search-filter";
import { defaultSearchQuery } from "@/lib/search/url-state";
import { logoutAndRedirect } from "@/lib/session/session-hygiene";
import type {
  AdminDashboardData,
  AdminDashboardStats,
} from "@/lib/dashboard/types";


const navItems: DashboardNavItem[] = [
  { key: "quizzes", label: "Manage Quizzes" },
  { key: "teacher-accounts", label: "Manage Teacher Accounts" },
  { key: "participants", label: "Manage Participants" },
];

export default function AdminDashboardContent({
  data,
}: {
  data: AdminDashboardData;
}) {
  const searchParams = useSearchParams();
  const entity = searchParams.get("entity");
  const searchActiveKey =
    entity === "teachers"
      ? "teacher-accounts"
      : entity === "participants"
        ? "participants"
        : "quizzes";
  const [manualActiveKey, setManualActiveKey] = useState<string | null>(null);
  const activeKey = manualActiveKey ?? searchActiveKey;
  const [logoutError, setLogoutError] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function clearManualSection() {
      setManualActiveKey(null);
    }

    window.addEventListener("popstate", clearManualSection);
    return () => window.removeEventListener("popstate", clearManualSection);
  }, []);

  function navigateToSection(key: string) {
    setManualActiveKey(
      key === "teacher-accounts" ||
        key === "participants" ||
        key === "quizzes"
        ? null
        : key,
    );
    if (
      key !== "teacher-accounts" &&
      key !== "participants" &&
      key !== "quizzes"
    ) {
      return;
    }

    const entity =
      key === "teacher-accounts"
        ? "teachers"
        : key === "participants"
          ? "participants"
          : "quizzes";
    const query = defaultSearchQuery("admin", entity);
    const params = new URLSearchParams();
    params.set("entity", query.entity);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  async function handleLogout() {
    setLogoutError("");

    try {
      await logoutAndRedirect(router, "/admin-login");
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Unable to log out.",
      );
    }
  }

  return (
    <DashboardShell
      role="Admin"
      navItems={navItems}
      activeKey={activeKey}
      onNavigate={navigateToSection}
      onLogout={handleLogout}
    >
      {logoutError ? (
        <p role="alert" className="mb-6 text-sm text-red-600">
          Unable to log out: {logoutError}
        </p>
      ) : null}
      {data.errors.length > 0 ? (
        <div
          role="alert"
          className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-800"
        >
          <p className="font-semibold">
            Some dashboard data could not be loaded.
          </p>
          <ul className="mt-1 list-disc pl-5">
            {data.errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {activeKey === "quizzes" && (
        <ManageQuizzesSection stats={data.stats} />
      )}
      {activeKey === "teacher-accounts" && <TeacherAccountsSection />}
      {activeKey === "participants" && <ParticipantsSection />}
      {activeKey === "settings" && (
        <AdminSettingsSection email={data.email} />
      )}
    </DashboardShell>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function ManageQuizzesSection({ stats }: { stats: AdminDashboardStats }) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Manage Quizzes"
        description="Review, edit, and control quiz content across the platform."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Quizzes" value={String(stats.totalQuizzes)} />
        <StatCard label="Ready Sessions" value={String(stats.readyQuizzes)} />
        <StatCard label="Quiz Results" value={String(stats.totalResults)} />
      </div>

      <SearchFilter role="admin" entity="quizzes" />
    </div>
  );
}

function TeacherAccountsSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Manage Teacher Accounts"
        description="Activate, deactivate, and manage teacher login access."
      />

      <SearchFilter role="admin" entity="teachers" />
    </div>
  );
}

function ParticipantsSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Manage Participants"
        description="Search quiz participants, session IDs, and completion status."
      />
      <SearchFilter role="admin" entity="participants" />
    </div>
  );
}

function AdminSettingsSection({ email }: { email: string }) {
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Settings"
        description="Update your admin profile and platform preferences."
      />

      <div className="max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <FormField
            label="Display name"
            id="admin-display-name"
            name="displayName"
            type="text"
            defaultValue="Admin"
            required
          />
          <FormField
            label="Email address"
            id="admin-settings-email"
            name="email"
            type="email"
            defaultValue={email || "admin@example.com"}
            required
          />
          <label className="flex items-center gap-3 text-sm text-neutral-600">
            <input
              type="checkbox"
              name="notifications"
              defaultChecked
              className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
            />
            Notify me about new teacher account requests
          </label>
          <div className="flex items-center gap-3">
            <Button type="submit">Save Changes</Button>
            {saved ? (
              <span className="text-sm font-medium text-green-600">
                Settings saved.
              </span>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
