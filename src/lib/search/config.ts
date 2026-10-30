import type {
  SearchEntity,
  SearchFilterKey,
  SearchRole,
  SearchSortField,
} from "./types";

export type SearchStatusOption = {
  value: string;
  label: string;
};

export type SearchFilterDefinition = {
  label: string;
  type: "select" | "text" | "date";
  roles?: readonly SearchRole[];
  entities?: readonly SearchEntity[];
  maxLength?: number;
  placeholder?: string;
};

export type SearchEntityConfig = {
  label: string;
  pluralLabel: string;
  description: string;
  searchPlaceholder: string;
  searchHint: string;
  table: string | null;
  idColumn: string;
  scopeColumn: string;
  dateColumn: string;
  statusColumn: string | null;
  statusLabel: string;
  statusOptions: readonly SearchStatusOption[];
  accountStatusColumn: string | null;
  searchColumns: readonly string[];
  searchableFields: readonly string[];
  sortColumns: Record<SearchSortField, string>;
  select: readonly string[];
  filters: readonly SearchFilterKey[];
};

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MAX_SEARCH_LENGTH = 200;

export const ACCOUNT_STATUS_OPTIONS: readonly SearchStatusOption[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const SORT_OPTIONS: readonly {
  value: SearchSortField;
  label: string;
}[] = [
  { value: "name", label: "Name" },
  { value: "date", label: "Date" },
  { value: "status", label: "Status" },
];

export const FILTER_DEFINITIONS: Record<
  SearchFilterKey,
  SearchFilterDefinition
> = {
  status: {
    label: "Status",
    type: "select",
  },
  accountStatus: {
    label: "Account status",
    type: "select",
    roles: ["admin"],
    entities: ["teachers"],
  },
  teacher: {
    label: "Teacher username",
    type: "text",
    entities: ["quizzes", "participants"],
    maxLength: 100,
    placeholder: "e.g. msantos",
  },
  quiz: {
    label: "Quiz title",
    type: "text",
    entities: ["participants"],
    maxLength: 200,
    placeholder: "e.g. Science Fundamentals",
  },
  session: {
    label: "Session ID",
    type: "text",
    entities: ["participants"],
    maxLength: 100,
    placeholder: "e.g. SESS-1042",
  },
  from: {
    label: "From date",
    type: "date",
  },
  to: {
    label: "To date",
    type: "date",
  },
};

export const entityConfigs: Record<SearchEntity, SearchEntityConfig> = {
  // There is no student table in the deployed schema. The entity stays in the
  // union for backwards-compatible URLs, but no role can search it.
  students: {
    label: "Student",
    pluralLabel: "Students",
    description: "Student records are not part of the deployed schema.",
    searchPlaceholder: "Student search is unavailable",
    searchHint: "Student records are not available in this deployment.",
    table: null,
    idColumn: "student_id",
    scopeColumn: "teacher_id",
    dateColumn: "created_at",
    statusColumn: null,
    statusLabel: "Enrollment status",
    statusOptions: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
    accountStatusColumn: null,
    searchColumns: [],
    searchableFields: [],
    sortColumns: {
      name: "student_id",
      date: "created_at",
      status: "student_id",
    },
    select: [],
    filters: [],
  },
  quizzes: {
    label: "Quiz",
    pluralLabel: "Quizzes",
    description:
      "Search quiz sessions by title or share code, and narrow results by teacher or date.",
    searchPlaceholder: "Search quiz title or share code",
    searchHint:
      "Searches quiz titles and share codes. Teacher filters are available to admins.",
    table: "quiz_sessions",
    idColumn: "session_id",
    scopeColumn: "teacher_id",
    dateColumn: "created_at",
    statusColumn: "status",
    statusLabel: "Session status",
    statusOptions: [{ value: "ready", label: "Ready" }],
    accountStatusColumn: null,
    searchColumns: ["title", "share_code"],
    searchableFields: ["Quiz title", "Share code"],
    sortColumns: {
      name: "title",
      date: "created_at",
      status: "status",
    },
    select: [
      "session_id",
      "teacher_id",
      "teacher_username",
      "title",
      "status",
      "share_code",
      "requested_question_count",
      "created_at",
    ],
    filters: ["teacher", "from", "to"],
  },
  participants: {
    label: "Participant",
    pluralLabel: "Participants",
    description:
      "Search participants by username, quiz title, session ID, or share code.",
    searchPlaceholder: "Search username, quiz, session, or share code",
    searchHint:
      "Searches participant username, quiz title, session ID, and share code. Session and quiz filters are also available.",
    table: "quiz_results",
    idColumn: "attempt_id",
    scopeColumn: "teacher_id",
    dateColumn: "recorded_at",
    statusColumn: null,
    statusLabel: "Attempt status",
    statusOptions: [
      { value: "completed", label: "Completed" },
      { value: "in_progress", label: "In progress" },
    ],
    accountStatusColumn: null,
    searchColumns: [
      "participant_username",
      "title",
      "session_id",
      "share_code",
    ],
    searchableFields: [
      "Participant username",
      "Quiz title",
      "Session ID",
      "Share code",
    ],
    sortColumns: {
      name: "participant_username",
      date: "recorded_at",
      status: "percentage",
    },
    select: [
      "attempt_id",
      "session_id",
      "share_code",
      "title",
      "participant_username",
      "correct_count",
      "total_questions",
      "answered_count",
      "percentage",
      "final_score",
      "started_at",
      "completed_at",
      "recorded_at",
      "teacher_id",
      "teacher_username",
    ],
    filters: ["teacher", "quiz", "session", "from", "to"],
  },
  teachers: {
    label: "Teacher",
    pluralLabel: "Teachers",
    description:
      "Search teacher accounts by email and filter by account status.",
    searchPlaceholder: "Search teacher email",
    searchHint:
      "Searches teacher email and account status. This view is admin-only.",
    table: "teacher_accounts",
    idColumn: "id",
    scopeColumn: "id",
    dateColumn: "created_at",
    statusColumn: "status",
    statusLabel: "Account status",
    statusOptions: ACCOUNT_STATUS_OPTIONS,
    accountStatusColumn: "status",
    searchColumns: ["email", "status"],
    searchableFields: ["Email", "Account status"],
    sortColumns: {
      name: "email",
      date: "created_at",
      status: "status",
    },
    select: ["id", "email", "status", "school_id", "created_at"],
    filters: ["accountStatus", "from", "to"],
  },
};

type RoleSearchConfig = {
  label: string;
  defaultEntity: SearchEntity;
  entities: readonly SearchEntity[];
};

export const ROLE_CONFIG: Record<SearchRole, RoleSearchConfig> = {
  teacher: {
    label: "Teacher",
    defaultEntity: "quizzes",
    entities: ["quizzes", "participants"],
  },
  admin: {
    label: "Admin",
    defaultEntity: "quizzes",
    entities: ["quizzes", "participants", "teachers"],
  },
};

export function getEntityConfig(entity: SearchEntity): SearchEntityConfig {
  return entityConfigs[entity];
}

export function getVisibleFilterKeys(
  role: SearchRole,
  entity: SearchEntity,
): SearchFilterKey[] {
  return getEntityConfig(entity).filters.filter((key) => {
    const definition = FILTER_DEFINITIONS[key];
    if (definition.roles && !definition.roles.includes(role)) {
      return false;
    }
    if (definition.entities && !definition.entities.includes(entity)) {
      return false;
    }
    return true;
  });
}

export function getStatusLabel(
  entity: SearchEntity,
  status: string,
): string {
  const option = getEntityConfig(entity).statusOptions.find(
    (candidate) => candidate.value === status,
  );

  if (option) {
    return option.label;
  }

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
