"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Reads the page's query parameters and moves to another dashboard URL with
 * history.pushState, which updates the address (and the browser's back button)
 * without the page loading screen. Used for opening a class, a quiz or an
 * attempt.
 */
export function useUrlParams() {
  const searchParams = useSearchParams();

  const pushHref = useCallback((href: string) => {
    window.history.pushState(null, "", href);
    window.scrollTo({ top: 0 });
  }, []);

  return { searchParams, pushHref };
}
