export class SearchError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "SearchError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isSearchError(error: unknown): error is SearchError {
  return error instanceof SearchError;
}
