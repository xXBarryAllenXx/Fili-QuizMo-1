"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useClickOutside } from "@/lib/hooks/use-click-outside";

export type DashboardNavItem = {
  key: string;
  label: string;
};

type DashboardShellProps = {
  role: "Teacher" | "Admin";
  navItems: DashboardNavItem[];
  activeKey: string;
  onNavigate: (key: string) => void;
  onLogout?: () => void | Promise<void>;
  children: ReactNode;
};

export function DashboardShell({
  role,
  navItems,
  activeKey,
  onNavigate,
  onLogout,
  children,
}: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const routeKey = `${pathname}?${search}`;
  const [sidebarState, setSidebarState] = useState({
    routeKey,
    open: false,
  });
  const sidebarOpen =
    sidebarState.routeKey === routeKey && sidebarState.open;
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const sidebarToggleRef = useRef<HTMLButtonElement>(null);

  const loginRoute = role === "Teacher" ? "/teacher-login" : "/admin-login";

  const closeSidebar = useCallback((restoreFocus = false) => {
    setSidebarState({ routeKey, open: false });
    if (restoreFocus) {
      sidebarToggleRef.current?.focus();
    }
  }, [routeKey]);

  useClickOutside(
    sidebarRef,
    sidebarToggleRef,
    () => closeSidebar(),
    sidebarOpen,
  );

  useEffect(() => {
    if (sidebarOpen) {
      sidebarRef.current
        ?.querySelector<HTMLElement>("nav button:not([disabled])")
        ?.focus();
    }
  }, [sidebarOpen]);

  useEffect(() => {
    function handlePopState() {
      closeSidebar();
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [closeSidebar]);

  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSidebar(true);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeSidebar, sidebarOpen]);

  function handleNavigate(key: string) {
    onNavigate(key);
    closeSidebar(true);
    setProfileOpen(false);
  }

  async function handleLogout() {
    setProfileOpen(false);
    setIsLoggingOut(true);

    try {
      if (onLogout) {
        await onLogout();
      } else {
        router.push(loginRoute);
      }
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => closeSidebar(true)}
        />
      ) : null}

      <aside
        id="dashboard-sidebar"
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-primary text-primary-foreground transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/Fili-QuizMo Logo.png"
              alt=""
              className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/20"
            />
            Fili-QuizMo
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = item.key === activeKey;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavigate(item.key)}
                className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white text-primary"
                    : "text-primary-foreground/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-primary-foreground/50">
            {role} Portal
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              ref={sidebarToggleRef}
              onClick={() =>
                sidebarOpen
                  ? closeSidebar(true)
                  : setSidebarState({ routeKey, open: true })
              }
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-expanded={sidebarOpen}
              aria-controls="dashboard-sidebar"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 lg:hidden"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              {role} Dashboard
            </h1>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              className="flex items-center focus:outline-none"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/Default_pfp.jpg"
                alt="Profile"
                className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
              />
            </button>

            {profileOpen ? (
              <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => handleNavigate("settings")}
                  className="block w-full px-4 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100"
                >
                  Settings
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {isLoggingOut ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-primary/30 px-4 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-2xl">
            <Spinner className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold text-foreground">
              Logging out...
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
