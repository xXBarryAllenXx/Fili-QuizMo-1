"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  clearPageInputs,
  getDashboardResetUrl,
  logoutAndRedirect,
  SESSION_EXPIRED_EVENT,
} from "@/lib/session/session-hygiene";

export function SessionLifecycle() {
  const router = useRouter();

  useEffect(() => {
    let handlingExpiredSession = false;

    function clearDashboardUrl(): string | null {
      const nextUrl = getDashboardResetUrl(new URL(window.location.href));

      if (nextUrl) {
        window.history.replaceState(window.history.state, "", nextUrl);
      }

      return nextUrl;
    }

    function handlePageHide() {
      clearPageInputs();
      clearDashboardUrl();
    }

    function handlePageShow(event: PageTransitionEvent) {
      if (!event.persisted) {
        return;
      }

      clearPageInputs();
      clearDashboardUrl();
      window.location.reload();
    }

    function handlePopState() {
      if (
        window.location.pathname === "/admin-login" ||
        window.location.pathname === "/teacher-login" ||
        window.location.pathname === "/signup"
      ) {
        clearPageInputs();
        window.location.reload();
        return;
      }

      if (
        window.location.pathname !== "/admin-dashboard" &&
        window.location.pathname !== "/teacher-dashboard"
      ) {
        return;
      }

      clearPageInputs();
      const nextUrl = clearDashboardUrl();
      if (nextUrl) {
        router.replace(nextUrl, { scroll: false });
      }
      router.refresh();
    }

    async function handleSessionExpired() {
      if (handlingExpiredSession) {
        return;
      }

      handlingExpiredSession = true;
      const loginRoute = window.location.pathname.startsWith("/admin-dashboard")
        ? "/admin-login"
        : "/teacher-login";

      try {
        await logoutAndRedirect(router, loginRoute);
      } catch (error) {
        console.error("Unable to clear an expired session.", error);
        clearPageInputs();
        router.replace(loginRoute);
        router.refresh();
      }
    }

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [router]);

  return null;
}
