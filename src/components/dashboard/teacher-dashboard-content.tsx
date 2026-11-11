"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DashboardShell,
  type DashboardNavItem,
} from "@/components/dashboard/dashboard-shell";
import { useNavigation } from "@/components/pixel";
import {
  SectionHeading,
  StatCard,
  StatGrid,
} from "@/components/dashboard/compact-layout";
import { ManageClasses } from "@/components/dashboard/manage-classes";
import { ManageQuizzesTable } from "@/components/dashboard/manage-quizzes";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { QuizResults } from "@/components/dashboard/quiz-results";
import { SettingsPasswordForm } from "@/components/dashboard/settings-password-form";
import { TeacherAssessmentSection } from "@/components/dashboard/assessment-section";
import { InterventionPanel } from "@/components/dashboard/intervention-panel";
import { TeacherOverview } from "@/components/dashboard/teacher-overview";
import { logoutAndRedirect } from "@/lib/auth/logout";
import type { TeacherDashboardData } from "@/lib/dashboard/data";
import {
  activeAlerts,
  loadInterventions,
  markAddressed,
  startIntervention,
  type InterventionAlert,
  type InterventionRecord,
} from "@/lib/dashboard/interventions";
import {
  lowScoreAttempts,
  teacherNotices,
  type NoticeRow,
  type PerformanceNotice,
} from "@/lib/dashboard/performance-notice";
import { useResetRouteState } from "@/lib/dashboard/route-reset";
import {
  classesHref,
  isTeacherSectionKey,
  quizzesHref,
  teacherSectionFromUrl,
  teacherSectionHref,
  TEACHER_BASE_PATH,
  type TeacherSectionKey,
} from "@/lib/dashboard/teacher-sections";
import { useUrlParams } from "@/lib/dashboard/use-url-params";
import { useRealtimeRefresh } from "@/lib/realtime/use-realtime-refresh";

const navItems: DashboardNavItem[] = [
  { key: "overview", label: "Overview" },
  { key: "classes", label: "Classes" },
  { key: "quizzes", label: "Quizzes" },
];

// Tables the teacher dashboard summarises. Only rows this teacher is allowed
// to read are streamed (row level security).
const LIVE_TABLES = [
  "quiz_sessions",
  "students",
  "quiz_results",
  "account_profiles",
] as const;

/** The section's own address, with the class, quiz or attempt that is open. */
function currentHref(
  key: TeacherSectionKey,
  params: URLSearchParams,
): string {
  switch (key) {
    case "classes":
      return classesHref(params.get("class"), params.get("tab"));
    case "quizzes":
      return quizzesHref(
        params.get("quizId"),
        params.get("attempt"),
        params.get("quiz"),
      );
    default:
      return teacherSectionHref(key);
  }
}

export default function TeacherDashboardContent({
  data,
}: {
  data: TeacherDashboardData;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeKey = teacherSectionFromUrl(pathname, searchParams.get("entity"));
  const [logoutError, setLogoutError] = useState("");
  const router = useRouter();
  const { navigate } = useNavigation();

  // Read once when the page opens; the notices look at the last two weeks.
  const [now] = useState(() => Date.now());
  const noticeRows = useMemo<NoticeRow[]>(
    () =>
      data.assessmentAttempts.map((attempt) => ({
        id: attempt.id,
        student: attempt.student,
        studentId: attempt.studentId,
        quizId: attempt.quizId,
        title: attempt.quizTitle,
        percentage: attempt.percentage,
        correct: attempt.correct,
        total: attempt.total,
        completedAt: attempt.completedAt,
      })),
    [data.assessmentAttempts],
  );

  // Saved interventions (RLS limits them to this teacher's students).
  const [records, setRecords] = useState<InterventionRecord[]>([]);
  const [recordsLoaded, setRecordsLoaded] = useState(false);
  const [recordsError, setRecordsError] = useState("");

  const refreshRecords = useCallback(async () => {
    try {
      setRecords(await loadInterventions());
      setRecordsError("");
    } catch (error) {
      setRecordsError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setRecordsLoaded(true);
    }
  }, []);

  // Load once on mount. The state updates happen after the request resolves,
  // not synchronously inside the effect.
  useEffect(() => {
    let cancelled = false;

    loadInterventions()
      .then((loaded) => {
        if (cancelled) return;
        setRecords(loaded);
        setRecordsError("");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setRecordsError(error instanceof Error ? error.message : "Unknown error");
      })
      .finally(() => {
        if (!cancelled) setRecordsLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const notices = useMemo(() => {
    const addressed = new Set(
      records.filter((r) => r.status === "addressed").map((r) => r.attemptId),
    );
    const all = teacherNotices(noticeRows, now, addressed);

    // Hold the low-score count until saved statuses are known, so an
    // addressed alert never flashes back into the count.
    return recordsLoaded ? all : all.filter((n) => n.tone !== "warning");
  }, [noticeRows, now, records, recordsLoaded]);

  const alerts = useMemo(
    () => activeAlerts(lowScoreAttempts(noticeRows, now), records),
    [noticeRows, now, records],
  );
  const history = useMemo(
    () =>
      records
        .filter((r) => r.status === "addressed")
        .sort((a, b) => Date.parse(b.addressedAt ?? "") - Date.parse(a.addressedAt ?? "")),
    [records],
  );

  async function handleStart(alert: InterventionAlert, note: string) {
    await startIntervention(alert, note);
    await refreshRecords();
  }

  async function handleAddress(alert: InterventionAlert, note: string) {
    await markAddressed(alert, note);
    await refreshRecords();
  }

  useResetRouteState("teacher-dashboard", currentHref(activeKey, searchParams), {
    clientOnly: true,
  });
  useRealtimeRefresh(LIVE_TABLES);

  function go(href: string) {
    // Sections share one server page, so moving between them only changes the
    // address; the data is already loaded. Anything else is a real navigation.
    if (href === TEACHER_BASE_PATH || href.startsWith(`${TEACHER_BASE_PATH}/`)) {
      window.history.pushState(null, "", href);
      window.scrollTo({ top: 0 });
      return;
    }

    navigate(() => router.push(href, { scroll: false }));
  }

  /** Link to one attempt's answers, inside the quiz it belongs to. */
  function attemptHref(attemptId: string | null): string {
    const attempt = data.assessmentAttempts.find((item) => item.id === attemptId);

    return quizzesHref(attempt?.quizId || null, attemptId, attempt?.quizTitle ?? null);
  }

  function navigateToSection(key: string) {
    if (!isTeacherSectionKey(key)) return;

    const target = currentHref(key, new URLSearchParams());
    const currentSearch = searchParams.toString();
    if (target === `${pathname}${currentSearch ? `?${currentSearch}` : ""}`) {
      return;
    }

    go(target);
  }

  async function handleLogout() {
    setLogoutError("");

    try {
      await logoutAndRedirect(router, navigate);
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
        <p
          role="alert"
          className="mb-3 flex items-center gap-2 border-2 border-danger-dark bg-danger-surface px-3 py-2 text-sm text-danger-dark"
        >
          Unable to log out: {logoutError}
        </p>
      ) : null}
      {activeKey === "overview" && (
        <TeacherOverview
          data={data}
          notices={notices}
          interventions={
            <InterventionPanel
              alerts={alerts}
              history={history}
              loadError={recordsError}
              onStart={handleStart}
              onAddress={handleAddress}
            />
          }
          onReviewNotice={(notice: PerformanceNotice) =>
            go(attemptHref(notice.attemptId))
          }
          onOpenMessages={(attemptId) => go(attemptHref(attemptId))}
          onOpenClass={(classId, tab) => go(classesHref(classId, tab))}
          onOpenAttempt={(attemptId) => go(attemptHref(attemptId))}
          onGoToClasses={() => go(classesHref())}
        />
      )}
      {activeKey === "classes" && (
        <div className="space-y-2 sm:space-y-3">
          <SectionHeading
            title="Classes"
            description="Your students, the quizzes sent to them and how they rank, class by class."
          />
          <ManageClasses
            classViews={data.classViews}
            onOpenQuiz={(quizId, title) => go(quizzesHref(quizId, null, title))}
          />
        </div>
      )}
      {activeKey === "quizzes" && <QuizzesSection data={data} />}
      {activeKey === "settings" && <SettingsSection />}
    </DashboardShell>
  );
}

/**
 * The quiz library, and from it one quiz's results and each student's
 * answers. Quizzes are made and sent in the app; this is where results are read.
 */
function QuizzesSection({ data }: { data: TeacherDashboardData }) {
  const { searchParams, pushHref } = useUrlParams();
  const attemptId = searchParams.get("attempt");
  const attempt = data.assessmentAttempts.find((item) => item.id === attemptId);
  // The quiz is identified by its unique id; the title is display-only.
  const quizId = searchParams.get("quizId") || attempt?.quizId || null;
  const title =
    searchParams.get("quiz") ||
    data.assessmentAttempts.find((item) => item.quizId === quizId)?.quizTitle ||
    "Quiz";

  // An attempt that is not in the loaded list still opens (its page loads it).
  if (attemptId && !quizId) {
    return (
      <TeacherAssessmentSection
        attempts={data.assessmentAttempts}
        attemptId={attemptId}
        onSelect={(id) => pushHref(quizzesHref(null, id))}
        onBack={() => pushHref(quizzesHref())}
      />
    );
  }

  if (quizId) {
    return (
      <QuizResults
        key={quizId}
        quizId={quizId}
        title={title}
        attempts={data.assessmentAttempts}
        attemptId={attemptId}
        onBack={() => pushHref(quizzesHref())}
        onSelectAttempt={(id) => pushHref(quizzesHref(quizId, id, title))}
        onBackToQuiz={() => pushHref(quizzesHref(quizId, null, title))}
      />
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      <SectionHeading
        title="Quizzes"
        description="Your quiz library. Open a quiz to see its scores and each student's answers."
      />

      <StatGrid columns={4}>
        <StatCard label="Total Quizzes" value={String(data.quizzes.total)} />
        <StatCard label="Ready" value={String(data.quizzes.ready)} />
        <StatCard label="Drafts" value={String(data.quizzes.draft)} />
        <StatCard label="Failed" value={String(data.quizzes.failed)} />
      </StatGrid>

      <ManageQuizzesTable
        actorRole="teacher"
        assignedTo={data.assignedTo}
        onOpenResults={(quizId, quizTitle) =>
          pushHref(quizzesHref(quizId, null, quizTitle))
        }
      />
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="space-y-2 sm:space-y-3">
      <SectionHeading
        title="Settings"
        description="Review your teacher account details and keep your password up to date."
      />

      <ProfileCard role="teacher" />

      <SettingsPasswordForm sessionExpiredPath="/teacher-login?status=session_expired" />
    </div>
  );
}
