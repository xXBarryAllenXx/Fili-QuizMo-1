"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  FILTER_DEFINITIONS,
  SORT_OPTIONS,
  getEntityConfig,
  getStatusLabel,
  getVisibleFilterKeys,
} from "@/lib/search/config";
import { getActiveFilterChips } from "@/lib/search/active-filters";
import {
  defaultSearchQuery,
  serializeSearchState,
} from "@/lib/search/url-state";
import { submittedQueryFor } from "@/lib/search/submit-search";
import { useSearchFilters } from "@/lib/search/use-search-filters";
import type {
  SearchEntity,
  SearchFilterKey,
  SearchItem,
  SearchQuery,
  SearchRole,
} from "@/lib/search/types";
import { PixelLoader } from "@/components/ui/pixel-loader";
import { ActionIcon } from "@/components/ui/action-icon";
import {
  PixelBadge,
  PixelButton,
  PixelCard,
  PixelInput,
} from "@/components/ui/pixel-primitives";
import {
  PaginatedTable,
  type PaginatedTableColumn,
} from "@/components/ui/paginated-table";
import { SESSION_ENDED_EVENT } from "@/lib/auth/session-state";

type SearchFilterProps = {
  role: SearchRole;
  entity: SearchEntity;
  toolbar?: ReactNode;
  renderActions?: (item: SearchItem) => ReactNode;
  /** The teacher's classes. Without any, the Class filter is not shown. */
  classOptions?: readonly ClassFilterOption[];
  /**
   * Shows results as cards (no sideways scrolling) that load more as the list
   * is scrolled, instead of a paged table.
   */
  renderCard?: (item: SearchItem) => ReactNode;
};

type SortChoice = { value: string; label: string };

/** Pages already loaded for one search, so the list can keep growing. */
type LoadedPages = {
  key: string;
  pages: Readonly<Record<number, SearchItem[]>>;
  totalPages: number;
  total: number;
};

export type ClassFilterOption = { id: string; name: string };

/**
 * A text field that keeps what is being typed (the draft) apart from the
 * submitted value. Typing only updates the draft; the search runs when Enter is
 * pressed. `value` is the submitted value: when it changes from outside (a
 * removed filter chip, "Clear all", an old link) the draft follows it. The input
 * is never remounted or disabled, so it keeps focus while results load.
 */
function SubmitTextInput({
  id,
  value,
  placeholder,
  maxLength,
  type = "text",
  describedBy,
  className = "mt-1 h-10 w-full px-3 text-sm md:h-9",
  onSubmit,
}: {
  id: string;
  /** The submitted value. */
  value: string;
  placeholder?: string;
  maxLength?: number;
  type?: "search" | "text";
  describedBy?: string;
  className?: string;
  onSubmit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    setDraft(value);
  }

  useEffect(() => {
    function clearDraft() {
      setDraft("");
    }

    window.addEventListener(SESSION_ENDED_EVENT, clearDraft);
    return () => window.removeEventListener(SESSION_ENDED_EVENT, clearDraft);
  }, []);

  return (
    <PixelInput
      id={id}
      type={type}
      value={draft}
      maxLength={maxLength}
      placeholder={placeholder}
      aria-describedby={describedBy}
      enterKeyHint="search"
      onChange={(event) => setDraft(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.preventDefault();
        const submitted = submittedQueryFor(
          event.key,
          event.nativeEvent.isComposing,
          draft,
          value,
        );
        if (submitted !== null) onSubmit(submitted);
      }}
      className={className}
    />
  );
}

function itemValues(item: SearchItem): string[] {
  if (item.entity === "students") {
    return [
      item.username,
      item.quizTitle,
      item.sessionCode,
      item.studentEmail,
      getStatusLabel("students", item.status),
      item.score === null ? "—" : `${item.score}%`,
      new Date(item.joinedAt).toLocaleDateString("en-PH", {
        dateStyle: "medium",
        timeZone: "Asia/Manila",
      }),
    ];
  }

  if (item.entity === "student_accounts") {
    return [
      item.username,
      item.email,
      item.teacherUsername,
      new Date(item.createdAt).toLocaleDateString("en-PH", {
        dateStyle: "medium",
        timeZone: "Asia/Manila",
      }),
    ];
  }

  if (item.entity === "quizzes") {
    return [
      item.title,
      getStatusLabel("quizzes", item.status),
      String(item.questionCount),
      item.teacherUsername,
      new Date(item.createdAt).toLocaleDateString("en-PH", {
        dateStyle: "medium",
        timeZone: "Asia/Manila",
      }),
    ];
  }

  return [
    item.username,
    item.email,
    getStatusLabel("teachers", item.status),
    String(item.quizCount),
    new Date(item.createdAt).toLocaleDateString("en-PH", {
      dateStyle: "medium",
      timeZone: "Asia/Manila",
    }),
  ];
}

/**
 * Filters a person can actually use. A teacher only sees their own records,
 * so the teacher filter is pointless, and the session code is something only
 * the app uses. Those two stay for admins. Class is left out while there are
 * no classes to pick from (the Class field itself is unchanged).
 */
function filterKeysFor(
  role: SearchRole,
  entity: SearchEntity,
  hasClasses: boolean,
): SearchFilterKey[] {
  return getVisibleFilterKeys(role, entity).filter(
    (key) =>
      key !== "from" &&
      key !== "to" &&
      !(role === "teacher" && (key === "teacher" || key === "session")) &&
      !(key === "class" && !hasClasses),
  );
}

/** "Date" + "desc" -> one choice such as "Date: newest first". */
function sortChoiceLabel(
  field: string,
  label: string,
  direction: "asc" | "desc",
): string {
  if (field === "date") {
    return `${label}: ${direction === "desc" ? "newest first" : "oldest first"}`;
  }

  return `${label}: ${direction === "asc" ? "A to Z" : "Z to A"}`;
}

function FilterFields({
  role,
  entity,
  query,
  updateQuery,
  idPrefix,
  classOptions,
  sortChoices,
}: {
  role: SearchRole;
  entity: SearchEntity;
  query: SearchQuery;
  updateQuery: (patch: Partial<SearchQuery>) => void;
  idPrefix: string;
  classOptions: readonly ClassFilterOption[];
  sortChoices: readonly SortChoice[];
}) {
  const config = getEntityConfig(entity);

  function renderFilter(key: SearchFilterKey) {
    const definition = FILTER_DEFINITIONS[key];
    const id = `${idPrefix}-${key}`;

    if (key === "status") {
      return (
        <label key={key} htmlFor={id} className="block text-xs font-medium sm:text-sm">
          {config.statusLabel}
          <select
            id={id}
            value={query.status ?? ""}
            onChange={(event) =>
              updateQuery({ status: event.currentTarget.value || null })
            }
            className="pixel-input mt-1 h-10 w-full px-3 text-sm md:h-9"
          >
            <option value="">All statuses</option>
            {config.statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      );
    }

    if (key === "class") {
      if (classOptions.length === 0 && !query.class) return null;

      return (
        <label key={key} htmlFor={id} className="block text-xs font-medium sm:text-sm">
          {definition.label}
          <select
            id={id}
            value={query.class}
            onChange={(event) =>
              updateQuery({ class: event.currentTarget.value })
            }
            className="pixel-input mt-1 h-10 w-full px-3 text-sm md:h-9"
          >
            <option value="">All classes</option>
            {classOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      );
    }

    if (key === "from" || key === "to") {
      return (
        <label key={key} htmlFor={id} className="block text-xs font-medium sm:text-sm">
          {definition.label}
          <input
            id={id}
            type="date"
            value={query[key] ?? ""}
            onChange={(event) => {
              const value = event.currentTarget.value || null;
              if (key === "from") {
                updateQuery({ from: value });
              } else {
                updateQuery({ to: value });
              }
            }}
            className="pixel-input mt-1 h-10 w-full px-3 text-sm md:h-9"
          />
        </label>
      );
    }

    const value =
      key === "teacher"
        ? query.teacher
        : key === "quiz"
          ? query.quiz
          : query.session;

    return (
      <label key={key} htmlFor={id} className="block text-xs font-medium sm:text-sm">
        {definition.label}
        <SubmitTextInput
          id={id}
          value={value}
          maxLength={definition.maxLength}
          placeholder={definition.placeholder}
          onSubmit={(nextValue) => {
            if (key === "teacher") {
              updateQuery({ teacher: nextValue });
            } else if (key === "quiz") {
              updateQuery({ quiz: nextValue });
            } else {
              updateQuery({ session: nextValue });
            }
          }}
        />
      </label>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:gap-3 md:grid-cols-4">
      <label
        htmlFor={`${idPrefix}-sort`}
        className="block text-xs font-medium sm:text-sm"
      >
        Sort by
        <select
          id={`${idPrefix}-sort`}
          value={`${query.sort}:${query.dir}`}
          onChange={(event) => {
            const [sort, dir] = event.currentTarget.value.split(":");
            updateQuery({
              sort: sort as SearchQuery["sort"],
              dir: dir as SearchQuery["dir"],
            });
          }}
          className="pixel-input mt-1 h-10 w-full px-3 text-sm md:h-9"
        >
          {sortChoices.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      </label>
      {filterKeysFor(
        role,
        entity,
        classOptions.length > 0 || Boolean(query.class),
      ).map(renderFilter)}
    </div>
  );
}

export function SearchFilter({
  role,
  entity,
  toolbar,
  renderActions,
  classOptions = [],
  renderCard,
}: SearchFilterProps) {
  const {
    query,
    results,
    loading,
    error,
    updateQuery,
  } = useSearchFilters(role, entity);
  const config = getEntityConfig(entity);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Keep the last loaded page on screen while the next one loads, so moving
  // between pages (or editing a filter) never swaps the table for a loader.
  const [lastResults, setLastResults] = useState(results);
  if (results && results !== lastResults) {
    setLastResults(results);
  }
  const visibleResults = results ?? lastResults;

  // Card lists grow as the page is scrolled: each page that arrives is kept,
  // and a new search (anything but the page number) starts the list over.
  const searchKey = serializeSearchState({ ...query, page: 1 });
  const [loaded, setLoaded] = useState<LoadedPages>({
    key: searchKey,
    pages: {},
    totalPages: 1,
    total: 0,
  });
  if (renderCard && results) {
    const { page, totalPages, total } = results.pagination;

    if (loaded.key !== searchKey) {
      setLoaded({ key: searchKey, pages: { [page]: results.items }, totalPages, total });
    } else if (loaded.pages[page] !== results.items) {
      setLoaded({
        key: searchKey,
        pages: { ...loaded.pages, [page]: results.items },
        totalPages,
        total,
      });
    }
  }
  const loadedPageNumbers = Object.keys(loaded.pages).map(Number);
  const lastLoadedPage = loadedPageNumbers.length
    ? Math.max(...loadedPageNumbers)
    : 0;
  const cardItems = loadedPageNumbers
    .sort((left, right) => left - right)
    .flatMap((page) => loaded.pages[page]);
  const hasMore = Boolean(renderCard) && lastLoadedPage < loaded.totalPages;
  const sentinelRef = useRef<HTMLDivElement>(null);
  const startedAtFirstPage = useRef(false);

  // A list that opens on a later page (an old link, or after a refresh) starts
  // from the top instead.
  useEffect(() => {
    if (!renderCard || startedAtFirstPage.current) return;
    startedAtFirstPage.current = true;
    if (query.page > 1) updateQuery({ page: 1 });
  }, [renderCard, query.page, updateQuery]);

  // Ask for the next page when the end of the list scrolls into view.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!hasMore || loading || !node || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          updateQuery({ page: lastLoadedPage + 1 });
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, [hasMore, loading, lastLoadedPage, updateQuery]);

  function clearAllFilters() {
    updateQuery(defaultSearchQuery(role, entity));
  }

  function removeFilter(key: SearchFilterKey | "q") {
    if (key === "q") {
      updateQuery({ q: "" });
      return;
    }
    if (key === "status") {
      updateQuery({ status: null });
      return;
    }
    if (key === "class") {
      updateQuery({ class: "" });
      return;
    }
    if (key === "teacher" || key === "quiz" || key === "session") {
      if (key === "teacher") {
        updateQuery({ teacher: "" });
      } else if (key === "quiz") {
        updateQuery({ quiz: "" });
      } else {
        updateQuery({ session: "" });
      }
      return;
    }
    updateQuery({ [key]: null });
  }

  const chips = getActiveFilterChips(
    query,
    Object.fromEntries(classOptions.map((option) => [option.id, option.name])),
  );
  const items = visibleResults?.items ?? [];
  const pagination = results?.pagination;
  const visiblePagination = visibleResults?.pagination;

  useEffect(() => {
    if (
      !loading &&
      pagination &&
      query.page > pagination.totalPages
    ) {
      updateQuery({ page: pagination.totalPages });
    }
  }, [loading, pagination, query.page, updateQuery]);

  const sortChoices = SORT_OPTIONS.filter((option) =>
    config.sortFields.includes(option.value),
  ).flatMap((option) =>
    (option.value === "date" ? (["desc", "asc"] as const) : (["asc", "desc"] as const)).map(
      (direction) => ({
        value: `${option.value}:${direction}`,
        label: sortChoiceLabel(option.value, option.label, direction),
      }),
    ),
  );
  const filterCount = chips.filter((chip) => chip.key !== "q").length;

  return (
    <section aria-label={`${config.pluralLabel} search`} className="space-y-2">
      {/* One compact row: search, the filters button and the page's own button.
          Sorting and the other filters open under the button. */}
      <PixelCard className="space-y-2 p-2! sm:p-2.5!">
        <div className="flex items-center gap-2">
          <label htmlFor={`${entity}-search`} className="sr-only">
            Search {config.pluralLabel.toLowerCase()}
          </label>
          <div className="min-w-0 flex-1 sm:max-w-80">
            <SubmitTextInput
              id={`${entity}-search`}
              type="search"
              value={query.q}
              maxLength={200}
              placeholder="Search"
              className="h-9 w-full px-3 text-sm"
              onSubmit={(value) => updateQuery({ q: value })}
            />
          </div>

          <PixelButton
            type="button"
            variant="accent"
            size="sm"
            aria-expanded={filtersOpen}
            aria-controls={`${entity}-filters`}
            onClick={() => setFiltersOpen((open) => !open)}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap"
          >
            <ActionIcon name="ListFilter" size={14} />
            Filters{filterCount > 0 ? ` (${filterCount})` : ""}
          </PixelButton>

          {toolbar ? (
            <div className="ml-auto flex flex-wrap gap-2">{toolbar}</div>
          ) : null}
        </div>

        {filtersOpen ? (
          <div id={`${entity}-filters`} className="border-t-2 border-ink/20 pt-2">
            <FilterFields
              role={role}
              entity={entity}
              query={query}
              updateQuery={updateQuery}
              idPrefix={`${entity}-filter`}
              classOptions={classOptions}
              sortChoices={sortChoices}
            />
          </div>
        ) : null}
      </PixelCard>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Active filters">
          {chips.map((chip) => (
            <PixelBadge
              key={chip.key}
              variant="info"
              className="gap-2"
            >
              {chip.label}: {chip.value}
              <button
                type="button"
                aria-label={`Remove ${chip.label} filter`}
                onClick={() => removeFilter(chip.key)}
                className="font-bold"
              >
                <ActionIcon name="X" size={14} />
              </button>
            </PixelBadge>
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1.5 px-1 text-sm font-semibold text-ink underline"
          >
            <ActionIcon name="RotateCcw" size={14} />
            Clear all
          </button>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {loading
          ? "Loading search results"
          : pagination
            ? `${pagination.total} ${config.pluralLabel.toLowerCase()} found`
            : ""}
      </p>

      {loading && !visibleResults ? (
        <PixelLoader label="Loading search results..." />
      ) : null}
      {error ? (
        <div
          role="alert"
          className="flex items-start gap-3 border-2 border-danger-dark bg-danger-surface p-3 text-sm text-danger-dark"
        >
          {error}
        </div>
      ) : null}

      {!error && visibleResults && renderCard ? (
        <div
          aria-busy={loading}
          className={
            loading && query.page === 1
              ? "pointer-events-none opacity-60 transition-opacity"
              : undefined
          }
        >
          {cardItems.length === 0 ? (
            <p className="border-2 border-dashed border-ink p-4 text-center text-sm">
              No results found.
            </p>
          ) : (
            <ul aria-label={`${config.pluralLabel} search results`} className="space-y-2">
              {cardItems.map((item) => (
                <li key={item.id}>{renderCard(item)}</li>
              ))}
            </ul>
          )}
          <div ref={sentinelRef} className="py-3 text-center text-xs text-neutral-700">
            {hasMore ? (
              loading ? (
                "Loading more..."
              ) : typeof IntersectionObserver === "undefined" ? (
                <PixelButton
                  type="button"
                  variant="neutral"
                  size="sm"
                  onClick={() => updateQuery({ page: lastLoadedPage + 1 })}
                  icon="ArrowRight"
                >
                  Load more
                </PixelButton>
              ) : null
            ) : cardItems.length > 0 ? (
              `Showing all ${loaded.total}`
            ) : null}
          </div>
        </div>
      ) : null}

      {!error && visibleResults && !renderCard ? (
        <div
          aria-busy={loading}
          className={loading ? "pointer-events-none opacity-60 transition-opacity" : undefined}
        >
        <PaginatedTable
          stickyFirstColumn
          caption={`${config.pluralLabel} search results`}
          columns={[
            ...resultHeaders(entity)
              .map((label, index) => ({ label, index }))
              .filter(
                ({ label }) => !(role === "teacher" && label === "Teacher"),
              )
              .map(
                ({ label, index }): PaginatedTableColumn<SearchItem> => ({
                  key: `${entity}-${index}`,
                  label,
                  render: (item) => itemValues(item)[index] || "—",
                  // The name wraps (up to a width); everything else stays on
                  // one line and the table scrolls sideways.
                  className:
                    index === 0 ? "min-w-32 max-w-56" : "whitespace-nowrap",
                }),
              ),
            ...(renderActions
              ? [{
                  key: "actions",
                  label: "Actions",
                  render: renderActions,
                  className: "min-w-32",
                }]
              : []),
          ]}
          rows={items}
          rowKey={(item) => item.id}
          page={visiblePagination?.page ?? 1}
          totalPages={visiblePagination?.totalPages ?? 1}
          onPageChange={(page) => updateQuery({ page }, true)}
          emptyMessage="No results found."
        />
        </div>
      ) : null}
    </section>
  );
}

function resultHeaders(entity: SearchEntity): string[] {
  if (entity === "students") {
    return ["Username", "Quiz", "Session", "Email", "Status", "Score", "Joined"];
  }
  if (entity === "student_accounts") {
    return ["Student", "Email", "Teacher", "Created"];
  }
  if (entity === "quizzes") {
    return ["Quiz", "Status", "Questions", "Teacher", "Created"];
  }
  return ["Teacher", "Email", "Status", "Quizzes", "Created"];
}
