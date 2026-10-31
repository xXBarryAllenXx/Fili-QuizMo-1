import { createDemoRows } from "./demo-data";
import { MockSearchRepository } from "./mock-repository";
import {
  SupabaseSearchRepository,
  type SupabaseSearchClient,
} from "./supabase-repository";
import type {
  SearchDataSource,
  SearchRepository,
  SearchScope,
} from "./types";

export function getSearchDataSource(): SearchDataSource {
  const configured = process.env.SEARCH_DATA_SOURCE?.trim().toLowerCase();

  if (configured === "mock" || configured === "supabase") {
    return configured;
  }

  // The dashboards must read deployed Supabase data by default. Mock rows are
  // opt-in only, so development cannot silently show fake records.
  return "supabase";
}

export function createSearchRepository(input: {
  dataSource: SearchDataSource;
  supabase: SupabaseSearchClient;
  scope: SearchScope;
}): SearchRepository {
  if (input.dataSource === "mock") {
    return new MockSearchRepository(
      createDemoRows({
        role: input.scope.role,
        teacherId: input.scope.teacherId,
        teacherNumericId: input.scope.teacherNumericId,
        teacherUsername: input.scope.teacherLabel,
      }),
    );
  }

  return new SupabaseSearchRepository(input.supabase);
}
