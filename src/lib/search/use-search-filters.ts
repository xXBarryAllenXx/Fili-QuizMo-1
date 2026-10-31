"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DASHBOARD_DATA_CHANGED_EVENT,
  dashboardTablesFromEvent,
  type DashboardRealtimeTable,
} from "@/lib/dashboard/realtime-events";
import { fetchSearchResults } from "./api-client";
import {
  defaultSearchQuery,
  parseSearchState,
  serializeSearchState,
} from "./url-state";
import type {
  SearchEntity,
  SearchQuery,
  SearchResponse,
  SearchRole,
} from "./types";

const REALTIME_TABLE_BY_ENTITY: Record<
  SearchEntity,
  DashboardRealtimeTable
> = {
  quizzes: "quizzes",
  participants: "quiz_results",
  teachers: "teachers",
};

function messageFromError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Unable to load search results.";
}

type SearchRequestState = {
  key: string;
  results: SearchResponse | null;
  loading: boolean;
  error: string;
};

export function useSearchFilters(
  role: SearchRole,
  initialEntity: SearchQuery["entity"],
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const parsedState = useMemo(() => {
    try {
      const current = new URLSearchParams(search);
      const parsed = parseSearchState(search, role);

      return {
        query: current.has("entity")
          ? parsed
          : { ...parsed, entity: initialEntity },
        error: "",
      };
    } catch (error) {
      return {
        query: defaultSearchQuery(role, initialEntity),
        error: messageFromError(error),
      };
    }
  }, [initialEntity, role, search]);
  const query = parsedState.query;
  const queryKey = serializeSearchState(query);
  const [realtimeRefresh, setRealtimeRefresh] = useState(0);
  const [request, setRequest] = useState<SearchRequestState>({
    key: "",
    results: null,
    loading: false,
    error: "",
  });

  const updateQuery = useCallback(
    (patch: Partial<SearchQuery>) => {
      const nextQuery = {
        ...query,
        ...patch,
        page: patch.page ?? 1,
      };
      const serialized = serializeSearchState(nextQuery);
      const nextUrl = serialized
        ? `${pathname}?${serialized}`
        : pathname;

      router.replace(nextUrl, { scroll: false });
    },
    [pathname, query, router],
  );

  useEffect(() => {
    const table = REALTIME_TABLE_BY_ENTITY[query.entity];

    function handleDashboardDataChanged(event: Event) {
      if (dashboardTablesFromEvent(event).includes(table)) {
        setRealtimeRefresh((value) => value + 1);
      }
    }

    window.addEventListener(
      DASHBOARD_DATA_CHANGED_EVENT,
      handleDashboardDataChanged,
    );

    return () =>
      window.removeEventListener(
        DASHBOARD_DATA_CHANGED_EVENT,
        handleDashboardDataChanged,
      );
  }, [query.entity]);

  useEffect(() => {
    if (parsedState.error) {
      return;
    }

    const controller = new AbortController();
    let active = true;

    queueMicrotask(() => {
      if (active) {
        setRequest({
          key: queryKey,
          results: null,
          loading: true,
          error: "",
        });
      }
    });

    fetchSearchResults(query, controller.signal)
      .then((results) => {
        if (active) {
          setRequest({
            key: queryKey,
            results,
            loading: false,
            error: "",
          });
        }
      })
      .catch((error: unknown) => {
        if (
          !active ||
          (error instanceof Error && error.name === "AbortError")
        ) {
          return;
        }

        setRequest({
          key: queryKey,
          results: null,
          loading: false,
          error: messageFromError(error),
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [parsedState.error, query, queryKey, realtimeRefresh]);

  const requestMatchesQuery = request.key === queryKey;

  return {
    query,
    results: requestMatchesQuery ? request.results : null,
    loading:
      !parsedState.error &&
      (!requestMatchesQuery || request.loading),
    error:
      parsedState.error ||
      (requestMatchesQuery ? request.error : ""),
    updateQuery,
  };
}
