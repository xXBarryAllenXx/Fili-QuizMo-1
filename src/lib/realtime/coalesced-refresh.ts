import { DASHBOARD_DATA_CHANGED_EVENT } from "@/lib/dashboard/realtime-events";

// Several live subscriptions can report the same change at once. They share
// this one timer so a burst of changes causes one server refresh, and
// refreshes never run closer together than MIN_GAP_MS.
const SETTLE_MS = 800;
const MIN_GAP_MS = 4_000;

let timer: ReturnType<typeof setTimeout> | null = null;
let lastRun = 0;

export function scheduleDashboardRefresh(refresh: () => void): void {
  if (timer) return;

  const wait = Math.max(SETTLE_MS, lastRun + MIN_GAP_MS - Date.now());

  timer = setTimeout(() => {
    timer = null;
    lastRun = Date.now();
    refresh();
    window.dispatchEvent(new Event(DASHBOARD_DATA_CHANGED_EVENT));
  }, wait);
}
