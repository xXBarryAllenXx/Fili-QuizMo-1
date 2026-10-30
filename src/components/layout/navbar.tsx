"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";

// Easter egg: five quick clicks on the navbar Login open the admin portal.
const LOGIN_CLICK_KEY = "fili-quizmo-login-clicks";
const LOGIN_CLICK_WINDOW_MS = 5_000;
const ADMIN_LOGIN_CLICK_TARGET = 5;

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLoginClick(event: MouseEvent<HTMLAnchorElement>) {
    // Let modified clicks keep their normal browser behavior.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const now = Date.now();
    let count = 1;

    try {
      const stored = window.sessionStorage.getItem(LOGIN_CLICK_KEY);
      const previous = stored
        ? (JSON.parse(stored) as { count?: unknown; at?: unknown })
        : null;

      if (
        previous &&
        typeof previous.count === "number" &&
        typeof previous.at === "number" &&
        now - previous.at < LOGIN_CLICK_WINDOW_MS
      ) {
        count = previous.count + 1;
      }
    } catch {
      // Ignore storage errors and let the login link work normally.
    }

    if (count >= ADMIN_LOGIN_CLICK_TARGET) {
      try {
        window.sessionStorage.removeItem(LOGIN_CLICK_KEY);
      } catch {
        // Ignore storage errors and continue to the admin login.
      }

      event.preventDefault();
      router.push("/admin-login");
      return;
    }

    try {
      window.sessionStorage.setItem(
        LOGIN_CLICK_KEY,
        JSON.stringify({ count, at: now }),
      );
    } catch {
      // Ignore storage errors and let the login link work normally.
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-primary/95 text-primary-foreground shadow-lg backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/Fili-QuizMo Logo.png"
            alt=""
            className="h-9 w-9 rounded-lg object-cover shadow-sm ring-1 ring-white/20"
          />
          <span className="text-base font-bold tracking-tight sm:text-lg">
            Fili-QuizMo
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/"
                ? "bg-white/10 text-white"
                : "text-primary-foreground/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            href="/teacher-login"
            onClick={handleLoginClick}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            Login
          </Link>
        </div>
      </nav>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-sky-400/80 via-emerald-400/70 to-amber-300/80"
      />
    </header>
  );
}
