"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  DashboardShell,
  type DashboardNavItem,
} from "@/components/dashboard/dashboard-shell";
import { PieChart } from "@/components/dashboard/pie-chart";
import { Button } from "@/components/ui/button";
import { SearchFilter } from "@/components/dashboard/search-filter";
import { FormField } from "@/components/ui/form-field";
import { useDashboardRealtime } from "@/lib/dashboard/use-dashboard-realtime";
import { defaultSearchQuery } from "@/lib/search/url-state";
import { logoutAndRedirect } from "@/lib/session/session-hygiene";
import type { TeacherDashboardData } from "@/lib/dashboard/types";

const navItems: DashboardNavItem[] = [
  { key: "quizzes", label: "View Quizzes" },
  { key: "participants", label: "Manage Participants" },
  { key: "scores", label: "View Scores" },
  { key: "settings", label: "Settings" },
];

function resultStatusLabel(status: "completed" | "in_progress"): string {
  return status === "completed" ? "Completed" : "In progress";
}

export default function TeacherDashboardContent({
  data,
}: {
  data: TeacherDashboardData;
}) {
  const searchParams = useSearchParams();
  const entity = searchParams.get("entity");
  const searchActiveKey =
    entity === "participants" ? "participants" : "quizzes";
  const [manualActiveKey, setManualActiveKey] = useState<string | null>(null);
  const activeKey = manualActiveKey ?? searchActiveKey;
  const [logoutError, setLogoutError] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useDashboardRealtime({
    role: "teacher",
    teacherNumericId: data.teacherNumericId,
    teacherAuthId: data.teacherId,
  });

  useEffect(() => {
    function clearManualSection() {
      setManualActiveKey(null);
    }

    window.addEventListener("popstate", clearManualSection);
    return () => window.removeEventListener("popstate", clearManualSection);
  }, []);

  function navigateToSection(key: string) {
    setManualActiveKey(
      key === "participants" || key === "quizzes" ? null : key,
    );
    if (key !== "participants" && key !== "quizzes") {
      return;
    }

    const entity = key === "participants" ? "participants" : "quizzes";
    const params = new URLSearchParams();
    const query = defaultSearchQuery("teacher", entity);
    params.set("entity", query.entity);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  async function handleLogout() {
    setLogoutError("");

    try {
      await logoutAndRedirect(router, "/");
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Unable to log out.",
      );
    }
  }

  return (
    <DashboardShell
      role="Teacher"
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
      {activeKey === "quizzes" && <QuizzesSection data={data} />}
      {activeKey === "participants" && <ParticipantsSection />}
      {activeKey === "scores" && <ScoresSection data={data} />}
      {activeKey === "settings" && <SettingsSection data={data} />}
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

function QuizzesSection({ data }: { data: TeacherDashboardData }) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="View Quizzes"
        description={`Signed in as ${data.username}. Review your quiz library and overall class performance.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Quizzes"
          value={String(data.stats.totalQuizzes)}
        />
        <StatCard
          label="Quiz Results"
          value={String(data.stats.totalResults)}
        />
        <StatCard
          label="Average Score"
          value={`${data.stats.averageScore}%`}
        />
      </div>

      <SearchFilter role="teacher" entity="quizzes" />

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground">
          Student Score Distribution
        </h3>
        <p className="mt-1 text-sm text-neutral-500">
          Latest quiz performance across score bands.
        </p>
        <div className="mt-6">
          <PieChart distributions={data.distributions} />
        </div>
      </div>
    </div>
  );
}

function ParticipantsSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Manage Participants"
        description="Search participant usernames, sessions, and completion status."
      />
      <SearchFilter role="teacher" entity="participants" />
    </div>
  );
}

function ScoresSection({ data }: { data: TeacherDashboardData }) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="View Scores"
        description="Review student quiz results and performance trends."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          {data.results.length === 0 ? (
            <p className="p-6 text-sm text-neutral-600">
              No quiz results have been recorded for your quizzes yet.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-foreground">
                    Student
                  </th>
                  <th className="px-6 py-4 font-semibold text-foreground">
                    Quiz
                  </th>
                  <th className="px-6 py-4 font-semibold text-foreground">
                    Score
                  </th>
                  <th className="px-6 py-4 font-semibold text-foreground">
                    Share code
                  </th>
                  <th className="px-6 py-4 font-semibold text-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data.results.map((result) => (
                  <tr key={result.attemptId}>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {result.participantUsername}
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      {result.title}
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {result.percentage}%
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      {result.shareCode || "—"}
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      {resultStatusLabel(result.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground">
            Score Distribution
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Student score distribution per quiz.
          </p>
          <div className="mt-6">
            <PieChart distributions={data.distributions} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ data }: { data: TeacherDashboardData }) {
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Settings"
        description="Update your teacher profile and notification preferences."
      />

      <div className="max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <FormField
            label="Display name"
            id="teacher-display-name"
            name="displayName"
            type="text"
            defaultValue={data.username}
            required
          />
          <FormField
            label="Email address"
            id="teacher-settings-email"
            name="email"
            type="email"
            defaultValue={data.email || "teacher@example.com"}
            required
          />
          <label className="flex items-center gap-3 text-sm text-neutral-600">
            <input
              type="checkbox"
              name="notifications"
              defaultChecked
              className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
            />
            Email me when students submit quiz scores
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
