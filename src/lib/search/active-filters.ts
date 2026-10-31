import { ACCOUNT_STATUS_OPTIONS } from "./config";
import type { SearchFilterKey, SearchQuery } from "./types";

export type ActiveFilterChip = {
  key: SearchFilterKey | "q";
  label: string;
  value: string;
};

export function getActiveFilterChips(
  query: SearchQuery,
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (query.q) {
    chips.push({ key: "q", label: "Search", value: query.q });
  }

  if (query.accountStatus) {
    chips.push({
      key: "accountStatus",
      label: "Account status",
      value:
        ACCOUNT_STATUS_OPTIONS.find(
          (option) => option.value === query.accountStatus,
        )?.label ?? query.accountStatus,
    });
  }

  if (query.teacher) {
    chips.push({
      key: "teacher",
      label: "Teacher",
      value: query.teacher,
    });
  }

  if (query.quiz) {
    chips.push({ key: "quiz", label: "Quiz", value: query.quiz });
  }

  if (query.session) {
    chips.push({
      key: "session",
      label: "Session ID",
      value: query.session,
    });
  }

  if (query.from) {
    chips.push({ key: "from", label: "From", value: query.from });
  }

  if (query.to) {
    chips.push({ key: "to", label: "To", value: query.to });
  }

  return chips;
}
