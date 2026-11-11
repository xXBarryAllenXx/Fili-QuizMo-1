-- Teacher interventions for low-score alerts.
-- Additive only: creates one table; no existing table, row or view is changed.
-- "Needs Attention" is the absence of a row; a row exists once the teacher
-- starts or completes an intervention. Safe to run more than once.

create table if not exists public.student_interventions (
  id uuid primary key default gen_random_uuid(),
  -- One alert per qualifying quiz attempt (no duplicates, never reopened).
  attempt_id text not null unique,
  student_id text not null,          -- account id, else lower-cased username
  quiz_id text not null,             -- quiz_sessions.session_id
  teacher_id text not null,          -- auth.uid()::text of the quiz owner
  status text not null default 'in_progress'
    check (status in ('in_progress', 'addressed')),
  note text not null default '',
  -- Display snapshot so history stays readable on its own.
  student_name text not null default '',
  quiz_title text not null default '',
  percentage numeric,
  correct_count integer,
  total_questions integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  addressed_at timestamptz,
  constraint student_interventions_addressed_needs_note
    check (status <> 'addressed'
           or (btrim(note) <> '' and addressed_at is not null))
);

create index if not exists student_interventions_teacher_idx
  on public.student_interventions (teacher_id, status);

-- Keep timestamps honest, freeze identifiers, and never reopen an addressed alert.
create or replace function public.student_interventions_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.updated_at := now();
    new.addressed_at := case when new.status = 'addressed' then now() else null end;
    return new;
  end if;

  if new.id <> old.id or new.attempt_id <> old.attempt_id
     or new.student_id <> old.student_id or new.quiz_id <> old.quiz_id
     or new.teacher_id <> old.teacher_id then
    raise exception 'Intervention identifiers cannot be changed';
  end if;
  if old.status = 'addressed' then
    raise exception 'An addressed intervention cannot be changed';
  end if;

  new.created_at := old.created_at;
  new.updated_at := now();
  new.addressed_at := case when new.status = 'addressed' then now() else null end;
  return new;
end;
$$;

drop trigger if exists student_interventions_guard on public.student_interventions;
create trigger student_interventions_guard
before insert or update on public.student_interventions
for each row execute function public.student_interventions_guard();

alter table public.student_interventions enable row level security;

revoke all on public.student_interventions from anon, authenticated;
grant select, insert, update on public.student_interventions to authenticated;

-- A teacher only touches alerts for attempts on quizzes they own.
drop policy if exists "teachers read own interventions" on public.student_interventions;
create policy "teachers read own interventions"
on public.student_interventions for select to authenticated
using (teacher_id = auth.uid()::text);

drop policy if exists "teachers create own interventions" on public.student_interventions;
create policy "teachers create own interventions"
on public.student_interventions for insert to authenticated
with check (
  teacher_id = auth.uid()::text
  and exists (
    select 1
    from public.quiz_results r
    join public.quiz_sessions s on s.session_id = r.session_id
    where r.attempt_id::text = student_interventions.attempt_id
      and r.session_id = student_interventions.quiz_id
      and s.teacher_id = auth.uid()::text
  )
);

drop policy if exists "teachers update own interventions" on public.student_interventions;
create policy "teachers update own interventions"
on public.student_interventions for update to authenticated
using (teacher_id = auth.uid()::text)
with check (teacher_id = auth.uid()::text);
