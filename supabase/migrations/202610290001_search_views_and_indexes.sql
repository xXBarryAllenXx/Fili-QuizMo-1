CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS student_teacher_id_idx
  ON public.student (teacher_id);
CREATE INDEX IF NOT EXISTS student_status_created_at_idx
  ON public.student (enrollment_status, created_at DESC);
CREATE INDEX IF NOT EXISTS student_account_status_idx
  ON public.student (account_status);
CREATE INDEX IF NOT EXISTS student_name_trgm_idx
  ON public.student USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS student_school_id_trgm_idx
  ON public.student USING gin (school_id gin_trgm_ops);
CREATE INDEX IF NOT EXISTS student_email_trgm_idx
  ON public.student USING gin (email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS student_enrollment_status_trgm_idx
  ON public.student USING gin (enrollment_status gin_trgm_ops);
CREATE INDEX IF NOT EXISTS student_account_status_trgm_idx
  ON public.student USING gin (account_status gin_trgm_ops);

CREATE INDEX IF NOT EXISTS quiz_teacher_id_idx
  ON public.quiz (teacher_id);
CREATE INDEX IF NOT EXISTS quiz_status_created_at_idx
  ON public.quiz (status, created_at DESC);
CREATE INDEX IF NOT EXISTS quiz_title_trgm_idx
  ON public.quiz USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS quiz_status_trgm_idx
  ON public.quiz USING gin (status gin_trgm_ops);

CREATE INDEX IF NOT EXISTS quiz_session_quiz_id_idx
  ON public.quiz_session (quiz_id);
CREATE INDEX IF NOT EXISTS quiz_session_code_trgm_idx
  ON public.quiz_session USING gin (session_code gin_trgm_ops);

CREATE INDEX IF NOT EXISTS participant_session_id_idx
  ON public.participant (session_id);
CREATE INDEX IF NOT EXISTS participant_student_id_idx
  ON public.participant (student_id);
CREATE INDEX IF NOT EXISTS participant_status_joined_at_idx
  ON public.participant (status, joined_at DESC);
CREATE INDEX IF NOT EXISTS participant_username_trgm_idx
  ON public.participant USING gin (username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS participant_status_trgm_idx
  ON public.participant USING gin (status gin_trgm_ops);

CREATE INDEX IF NOT EXISTS teacher_account_status_created_at_idx
  ON public.teacher (account_status, created_at DESC);
CREATE INDEX IF NOT EXISTS teacher_username_trgm_idx
  ON public.teacher USING gin (username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS teacher_email_trgm_idx
  ON public.teacher USING gin (email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS teacher_account_status_trgm_idx
  ON public.teacher USING gin (account_status gin_trgm_ops);

CREATE OR REPLACE VIEW public.search_students
WITH (security_invoker = true)
AS
SELECT
  s.student_id,
  s.teacher_id,
  COALESCE(t.username, '') AS teacher_username,
  s.name,
  s.school_id,
  s.email,
  s.enrollment_status,
  s.account_status,
  s.created_at
FROM public.student AS s
LEFT JOIN public.teacher AS t ON t.teacher_id = s.teacher_id;

CREATE OR REPLACE VIEW public.search_quizzes
WITH (security_invoker = true)
AS
SELECT
  q.quiz_id,
  q.teacher_id,
  COALESCE(t.username, '') AS teacher_username,
  q.title,
  q.status,
  q.question_count,
  q.created_at
FROM public.quiz AS q
LEFT JOIN public.teacher AS t ON t.teacher_id = q.teacher_id;

CREATE OR REPLACE VIEW public.search_participants
WITH (security_invoker = true)
AS
SELECT
  p.participant_id,
  s.session_id,
  s.session_code,
  q.quiz_id,
  q.title AS quiz_title,
  p.username,
  p.status,
  p.score,
  p.joined_at,
  st.school_id AS student_school_id,
  st.email AS student_email,
  st.teacher_id AS student_teacher_id,
  q.teacher_id,
  COALESCE(t.username, '') AS teacher_username
FROM public.participant AS p
JOIN public.quiz_session AS s ON s.session_id = p.session_id
JOIN public.quiz AS q ON q.quiz_id = s.quiz_id
LEFT JOIN public.student AS st ON st.student_id = p.student_id
LEFT JOIN public.teacher AS t ON t.teacher_id = q.teacher_id;

CREATE OR REPLACE VIEW public.search_teachers
WITH (security_invoker = true)
AS
SELECT
  t.teacher_id,
  t.username,
  t.email,
  t.account_status,
  COUNT(q.quiz_id)::integer AS quiz_count,
  t.created_at
FROM public.teacher AS t
LEFT JOIN public.quiz AS q ON q.teacher_id = t.teacher_id
GROUP BY
  t.teacher_id,
  t.username,
  t.email,
  t.account_status,
  t.created_at;

GRANT SELECT ON
  public.search_students,
  public.search_quizzes,
  public.search_participants,
  public.search_teachers
TO authenticated;
