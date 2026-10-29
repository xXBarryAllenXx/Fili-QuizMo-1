"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  DashboardShell,
  type DashboardNavItem,
} from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { createClient } from "@/lib/supabase/client";

const navItems: DashboardNavItem[] = [
  { key: "quizzes", label: "Manage Quizzes" },
  { key: "teacher-data", label: "Manage Teacher Data" },
  { key: "teacher-accounts", label: "Manage Teacher Accounts" },
];

const quizzes = [
  {
    title: "General Knowledge Quiz",
    subject: "General",
    questions: 20,
    status: "Published",
  },
  {
    title: "Science Fundamentals",
    subject: "Science",
    questions: 15,
    status: "Published",
  },
  {
    title: "Math Essentials",
    subject: "Mathematics",
    questions: 25,
    status: "Draft",
  },
  {
    title: "English Vocabulary",
    subject: "English",
    questions: 10,
    status: "Published",
  },
];

const teacherData = [
  {
    name: "Maria Santos",
    email: "maria@example.com",
    subject: "Science",
    status: "Active",
  },
  {
    name: "Juan Dela Cruz",
    email: "juan@example.com",
    subject: "Mathematics",
    status: "Active",
  },
  {
    name: "Ana Reyes",
    email: "ana@example.com",
    subject: "English",
    status: "Inactive",
  },
];

const teacherAccounts = [
  {
    name: "Maria Santos",
    email: "maria@example.com",
    role: "Teacher",
    status: "Active",
  },
  {
    name: "Juan Dela Cruz",
    email: "juan@example.com",
    role: "Teacher",
    status: "Active",
  },
  {
    name: "Ana Reyes",
    email: "ana@example.com",
    role: "Teacher",
    status: "Inactive",
  },
];

export default function AdminDashboardContent() {
  const [activeKey, setActiveKey] = useState("quizzes");
  const [logoutError, setLogoutError] = useState("");
  const router = useRouter();

  async function handleLogout() {
    setLogoutError("");

    try {
      const { error } = await createClient().auth.signOut();
      if (error) {
        setLogoutError(error.message);
        return;
      }

      router.replace("/admin-login");
      router.refresh();
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
      onNavigate={setActiveKey}
      onLogout={handleLogout}
    >
      {logoutError ? (
        <p role="alert" className="mb-6 text-sm text-red-600">
          Unable to log out: {logoutError}
        </p>
      ) : null}
      {activeKey === "quizzes" && <ManageQuizzesSection />}
      {activeKey === "teacher-data" && <TeacherDataSection />}
      {activeKey === "teacher-accounts" && <TeacherAccountsSection />}
      {activeKey === "settings" && <AdminSettingsSection />}
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

function ManageQuizzesSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Manage Quizzes"
        description="Review, edit, and control quiz content across the platform."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Quizzes" value="12" />
        <StatCard label="Published" value="9" />
        <StatCard label="Drafts" value="3" />
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-4 font-semibold text-foreground">Quiz</th>
              <th className="px-6 py-4 font-semibold text-foreground">Subject</th>
              <th className="px-6 py-4 font-semibold text-foreground">
                Questions
              </th>
              <th className="px-6 py-4 font-semibold text-foreground">Status</th>
              <th className="px-6 py-4 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {quizzes.map((quiz) => (
              <tr key={quiz.title}>
                <td className="px-6 py-4 font-medium text-foreground">
                  {quiz.title}
                </td>
                <td className="px-6 py-4 text-neutral-600">{quiz.subject}</td>
                <td className="px-6 py-4 text-neutral-600">
                  {quiz.questions}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      quiz.status === "Published"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {quiz.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="px-3 py-2 text-xs"
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeacherDataSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Manage Teacher Data"
        description="Review teacher profiles and subject assignments."
      />

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-4 font-semibold text-foreground">Teacher</th>
              <th className="px-6 py-4 font-semibold text-foreground">Email</th>
              <th className="px-6 py-4 font-semibold text-foreground">Subject</th>
              <th className="px-6 py-4 font-semibold text-foreground">Status</th>
              <th className="px-6 py-4 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {teacherData.map((teacher) => (
              <tr key={teacher.email}>
                <td className="px-6 py-4 font-medium text-foreground">
                  {teacher.name}
                </td>
                <td className="px-6 py-4 text-neutral-600">{teacher.email}</td>
                <td className="px-6 py-4 text-neutral-600">
                  {teacher.subject}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      teacher.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {teacher.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="px-3 py-2 text-xs"
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teacherAccounts.map((account) => (
          <div
            key={account.email}
            className="rounded-xl bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/Default_pfp.jpg"
                alt={account.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-foreground">{account.name}</p>
                <p className="text-sm text-neutral-500">{account.email}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  account.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {account.status}
              </span>
              <span className="text-xs text-neutral-500">{account.role}</span>
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 px-3 py-2 text-xs"
              >
                {account.status === "Active" ? "Deactivate" : "Activate"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="px-3 py-2 text-xs"
              >
                Reset Password
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminSettingsSection() {
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
            defaultValue="Administrator"
            required
          />
          <FormField
            label="Email address"
            id="admin-settings-email"
            name="email"
            type="email"
            defaultValue="admin@example.com"
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
