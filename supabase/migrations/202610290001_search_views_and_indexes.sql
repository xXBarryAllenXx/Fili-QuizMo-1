-- Indexes for the tables queried by the admin/teacher dashboards and
-- GET /api/search. This migration intentionally does not create views,
-- change RLS policies, or modify grants: those remain managed separately
-- against the deployed schema.
--
-- Apply with the Supabase CLI or SQL editor after reviewing against the
-- live schema:
--   supabase db push
--
-- The dashboard/search code reads:
--   quizzes       (teacher scope, status counts, title/share-code search)
--   quiz_results  (teacher scope, participant search, date sorting)
--   teachers      (admin search, auth user lookup, quiz counts)
--   quiz_questions (per-quiz question counts)

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- quizzes ---------------------------------------------------------------

CREATE INDEX IF NOT EXISTS quizzes_teacher_id_idx
  ON public.quizzes (teacher_id);

CREATE INDEX IF NOT EXISTS quizzes_status_created_at_idx
  ON public.quizzes (status, created_at DESC);

CREATE INDEX IF NOT EXISTS quizzes_created_at_idx
  ON public.quizzes (created_at DESC);

CREATE INDEX IF NOT EXISTS quizzes_title_trgm_idx
  ON public.quizzes USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS quizzes_share_code_trgm_idx
  ON public.quizzes USING gin (share_code gin_trgm_ops);

-- quiz_results ----------------------------------------------------------

CREATE INDEX IF NOT EXISTS quiz_results_teacher_id_idx
  ON public.quiz_results (teacher_id);

CREATE INDEX IF NOT EXISTS quiz_results_teacher_recorded_at_idx
  ON public.quiz_results (teacher_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS quiz_results_session_id_idx
  ON public.quiz_results (session_id);

CREATE INDEX IF NOT EXISTS quiz_results_participant_username_trgm_idx
  ON public.quiz_results USING gin (participant_username gin_trgm_ops);

CREATE INDEX IF NOT EXISTS quiz_results_title_trgm_idx
  ON public.quiz_results USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS quiz_results_share_code_trgm_idx
  ON public.quiz_results USING gin (share_code gin_trgm_ops);

-- teachers --------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS teachers_user_id_key
  ON public.teachers (user_id);

CREATE INDEX IF NOT EXISTS teachers_status_created_at_idx
  ON public.teachers (status, created_at DESC);

CREATE INDEX IF NOT EXISTS teachers_username_trgm_idx
  ON public.teachers USING gin (username gin_trgm_ops);

CREATE INDEX IF NOT EXISTS teachers_email_trgm_idx
  ON public.teachers USING gin (email gin_trgm_ops);

-- quiz_questions --------------------------------------------------------

CREATE INDEX IF NOT EXISTS quiz_questions_session_id_idx
  ON public.quiz_questions (session_id);
