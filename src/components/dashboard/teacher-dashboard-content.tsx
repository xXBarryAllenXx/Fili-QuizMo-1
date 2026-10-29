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
import { defaultSearchQuery } from "@/lib/search/url-state";
import { createClient } from "@/lib/supabase/client";

const navItems: DashboardNavItem[] = [
  { key: "quizzes", label: "View Quizzes" },
  { key: "students", label: "Manage Student Info" },
  { key: "participants", label: "Manage Participants" },
  { key: "scores", label: "View Scores" },
  { key: "settings", label: "Settings" },
];

const scores = [
  {
    student: "Maria Santos",
    quiz: "General Knowledge Quiz",
    score: "92%",
    status: "Excellent",
  },
  {
    student: "Juan Dela Cruz",
    quiz: "Science Fundamentals",
    score: "78%",
    status: "Good",
  },
  {
    student: "Ana Reyes",
    quiz: "Math Essentials",
    score: "64%",
    status: "Needs Improvement",
  },
  {
    student: "Carlo Mendoza",
    quiz: "English Vocabulary",
    score: "88%",
    status: "Good",
  },
];

export default function TeacherDashboardContent() {
  const searchParams = useSearchParams();
  const entity = searchParams.get("entity");
  const searchActiveKey =
    entity === "students"
      ? "students"
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
      key === "students" || key === "participants" || key === "quizzes"
        ? null
        : key,
    );
    if (key !== "students" && key !== "participants" && key !== "quizzes") {
      return;
    }

    const entity =
      key === "students"
        ? "students"
        : key === "participants"
          ? "participants"
          : "quizzes";
    const params = new URLSearchParams();
    const query = defaultSearchQuery("teacher", entity);
    params.set("entity", query.entity);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  async function handleLogout() {
    setLogoutError("");

    try {
      const { error } = await createClient().auth.signOut();
      if (error) {
        setLogoutError(error.message);
        return;
      }

      router.replace("/teacher-login");
      router.refresh();
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
      {activeKey === "quizzes" && <QuizzesSection />}
      {activeKey === "students" && <StudentsSection />}
      {activeKey === "participants" && <ParticipantsSection />}
      {activeKey === "scores" && <ScoresSection />}
      {activeKey === "settings" && <SettingsSection />}
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

function QuizzesSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="View Quizzes"
        description="Review your quiz library and overall class performance."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Quizzes" value="12" />
        <StatCard label="Active Students" value="48" />
        <StatCard label="Average Score" value="82%" />
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
          <PieChart />
        </div>
      </div>
    </div>
  );
}

function StudentsSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Manage Student Info"
        description="Search students assigned to your classes."
      />

      <SearchFilter role="teacher" entity="students" />
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

function ScoresSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="View Scores"
        description="Review student quiz results and performance trends."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-4 font-semibold text-foreground">
                  Student
                </th>
                <th className="px-6 py-4 font-semibold text-foreground">Quiz</th>
                <th className="px-6 py-4 font-semibold text-foreground">Score</th>
                <th className="px-6 py-4 font-semibold text-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {scores.map((score) => (
                <tr key={`${score.student}-${score.quiz}`}>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {score.student}
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{score.quiz}</td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {score.score}
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{score.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground">
            Score Distribution
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Student score distribution per quiz.
          </p>
          <div className="mt-6">
            <PieChart />
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsSection() {
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
            defaultValue="Teacher Account"
            required
          />
          <FormField
            label="Email address"
            id="teacher-settings-email"
            name="email"
            type="email"
            defaultValue="teacher@example.com"
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
