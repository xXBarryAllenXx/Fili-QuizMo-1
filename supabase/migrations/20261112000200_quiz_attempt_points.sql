-- Points per question for one attempt, so the attempt review can explain a
-- weighted score. Apply after the quiz backend's 20261112_0016 migration, which
-- adds quiz_questions.points. Read-only; changes no existing data.
--
-- plpgsql (not sql) on purpose: the column is only resolved when the function
-- runs, so this migration never fails if it is applied before 0016.
create or replace function public.quiz_attempt_points(p_attempt_id uuid)
returns table (question_id text, points integer)
language plpgsql stable security definer set search_path = public, pg_temp
as $$
begin
  return query
    select q.question_id::text, q.points
    from public.quiz_attempts t
    join public.quiz_sessions s on s.session_id = t.session_id
    join public.quiz_questions q on q.session_id = t.session_id
    where t.attempt_id = p_attempt_id
      and (
        -- the student who took it, the teacher who owns the quiz, or an admin
        t.account_id = auth.uid()
        or s.teacher_id = auth.uid()::text
        or exists (select 1 from public.admins a where a.user_id = auth.uid())
      );
end;
$$;

revoke all on function public.quiz_attempt_points(uuid) from public, anon;
grant execute on function public.quiz_attempt_points(uuid) to authenticated;
