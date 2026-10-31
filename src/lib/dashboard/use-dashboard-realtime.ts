"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  notifyDashboardDataChanged,
  type DashboardRealtimeTable,
} from "./realtime-events";

type RealtimeSubscription = {
  table: DashboardRealtimeTable;
  filter?: string;
};

const REFRESH_DEBOUNCE_MS = 250;

export function useDashboardRealtime(input: {
  role: "admin" | "teacher";
  teacherNumericId?: number | null;
  teacherAuthId?: string | null;
}): void {
  const router = useRouter();
  const { role, teacherNumericId, teacherAuthId } = input;

  useEffect(() => {
    const pendingTables = new Set<DashboardRealtimeTable>();
    let refreshTimer: number | null = null;
    const subscriptions: RealtimeSubscription[] = [];

    if (role === "admin") {
      subscriptions.push(
        { table: "quizzes" },
        { table: "quiz_results" },
        { table: "teachers" },
      );
    } else {
      if (teacherNumericId !== null && teacherNumericId !== undefined) {
        subscriptions.push({
          table: "quizzes",
          filter: `teacher_id=eq.${teacherNumericId}`,
        });
      }

      if (teacherAuthId) {
        subscriptions.push({
          table: "quiz_results",
          filter: `teacher_id=eq.${teacherAuthId}`,
        });
      }
    }

    if (subscriptions.length === 0) {
      return;
    }

    const supabase = createClient();
    let channel = supabase.channel(
      `dashboard-${role}-${teacherNumericId ?? "all"}`,
    );

    function scheduleRefresh(table: DashboardRealtimeTable) {
      pendingTables.add(table);

      if (refreshTimer !== null) {
        return;
      }

      refreshTimer = window.setTimeout(() => {
        refreshTimer = null;
        const tables = Array.from(pendingTables);
        pendingTables.clear();

        router.refresh();
        notifyDashboardDataChanged(tables);
      }, REFRESH_DEBOUNCE_MS);
    }

    for (const subscription of subscriptions) {
      channel = channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: subscription.table,
          ...(subscription.filter ? { filter: subscription.filter } : {}),
        },
        () => scheduleRefresh(subscription.table),
      );
    }

    channel.subscribe();

    return () => {
      if (refreshTimer !== null) {
        window.clearTimeout(refreshTimer);
        refreshTimer = null;
      }

      pendingTables.clear();
      void supabase.removeChannel(channel);
    };
  }, [role, teacherNumericId, teacherAuthId, router]);
}
