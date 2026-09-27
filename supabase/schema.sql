-- ============================================================
-- FlowState — Database Schema
-- Run this in the Supabase SQL Editor on your project.
-- ============================================================

-- ── profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL DEFAULT '',
  focus_area        TEXT NOT NULL DEFAULT 'Academics',
  email             TEXT,
  device_token      TEXT UNIQUE,
  device_last_seen  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_device_token_idx ON public.profiles (device_token);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: select own"   ON public.profiles FOR SELECT TO authenticated USING ( (SELECT auth.uid()) = id );
CREATE POLICY "profiles: insert own"   ON public.profiles FOR INSERT TO authenticated WITH CHECK ( (SELECT auth.uid()) = id );
CREATE POLICY "profiles: update own"   ON public.profiles FOR UPDATE TO authenticated USING ( (SELECT auth.uid()) = id ) WITH CHECK ( (SELECT auth.uid()) = id );
CREATE POLICY "profiles: delete own"   ON public.profiles FOR DELETE TO authenticated USING ( (SELECT auth.uid()) = id );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create or sync profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    name = CASE WHEN EXCLUDED.name <> '' THEN EXCLUDED.name ELSE public.profiles.name END,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── tasks ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  category            TEXT NOT NULL DEFAULT 'Academics',
  deadline            TEXT,                          -- human-readable: "Today", "Tomorrow", ISO date
  estimated_minutes   INTEGER NOT NULL DEFAULT 30 CHECK (estimated_minutes > 0),
  completed_minutes   INTEGER NOT NULL DEFAULT 0 CHECK (completed_minutes >= 0),
  priority            TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low','Medium','High','Urgent')),
  status              TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','In Progress','Completed','Incomplete')),
  plan_action         TEXT NOT NULL DEFAULT 'NONE' CHECK (plan_action IN ('KEEP','REDUCE','MOVE','NONE')),
  planned_minutes     INTEGER,
  planned_date        TEXT,                          -- ISO YYYY-MM-DD
  move_reason         TEXT,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tasks_user_id_idx         ON public.tasks (user_id);
CREATE INDEX IF NOT EXISTS tasks_user_status_idx     ON public.tasks (user_id, status);
CREATE INDEX IF NOT EXISTS tasks_user_deadline_idx   ON public.tasks (user_id, deadline);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks: select own"  ON public.tasks FOR SELECT TO authenticated USING ( (SELECT auth.uid()) = user_id );
CREATE POLICY "tasks: insert own"  ON public.tasks FOR INSERT TO authenticated WITH CHECK ( (SELECT auth.uid()) = user_id );
CREATE POLICY "tasks: update own"  ON public.tasks FOR UPDATE TO authenticated USING ( (SELECT auth.uid()) = user_id ) WITH CHECK ( (SELECT auth.uid()) = user_id );
CREATE POLICY "tasks: delete own"  ON public.tasks FOR DELETE TO authenticated USING ( (SELECT auth.uid()) = user_id );

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── daily_states ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_states (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date                DATE NOT NULL DEFAULT CURRENT_DATE,
  energy              INTEGER NOT NULL DEFAULT 6 CHECK (energy BETWEEN 1 AND 10),
  stress              INTEGER NOT NULL DEFAULT 5 CHECK (stress BETWEEN 1 AND 10),
  available_minutes   INTEGER NOT NULL DEFAULT 210 CHECK (available_minutes > 0),
  sleep_hours         NUMERIC(4,1) DEFAULT 7,
  capacity_minutes    INTEGER,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS daily_states_user_date_idx ON public.daily_states (user_id, date);

ALTER TABLE public.daily_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_states: select own"  ON public.daily_states FOR SELECT TO authenticated USING ( (SELECT auth.uid()) = user_id );
CREATE POLICY "daily_states: insert own"  ON public.daily_states FOR INSERT TO authenticated WITH CHECK ( (SELECT auth.uid()) = user_id );
CREATE POLICY "daily_states: update own"  ON public.daily_states FOR UPDATE TO authenticated USING ( (SELECT auth.uid()) = user_id ) WITH CHECK ( (SELECT auth.uid()) = user_id );
CREATE POLICY "daily_states: delete own"  ON public.daily_states FOR DELETE TO authenticated USING ( (SELECT auth.uid()) = user_id );

CREATE TRIGGER daily_states_updated_at BEFORE UPDATE ON public.daily_states
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── task_history ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.task_history (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id           UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  task_title        TEXT NOT NULL DEFAULT '',
  date              DATE NOT NULL DEFAULT CURRENT_DATE,
  action            TEXT NOT NULL,
  previous_status   TEXT,
  new_status        TEXT,
  planned_minutes   INTEGER,
  actual_minutes    INTEGER,
  note              TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS task_history_user_date_idx ON public.task_history (user_id, date);
CREATE INDEX IF NOT EXISTS task_history_task_idx      ON public.task_history (task_id);

ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_history: select own"  ON public.task_history FOR SELECT TO authenticated USING ( (SELECT auth.uid()) = user_id );
CREATE POLICY "task_history: insert own"  ON public.task_history FOR INSERT TO authenticated WITH CHECK ( (SELECT auth.uid()) = user_id );
CREATE POLICY "task_history: delete own"  ON public.task_history FOR DELETE TO authenticated USING ( (SELECT auth.uid()) = user_id );

-- ── daily_summaries ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_summaries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date                DATE NOT NULL DEFAULT CURRENT_DATE,
  available_minutes   INTEGER,
  capacity_minutes    INTEGER,
  workload_minutes    INTEGER,
  planned_minutes     INTEGER,
  completed_minutes   INTEGER,
  moved_minutes       INTEGER,
  missed_minutes      INTEGER,
  energy              INTEGER,
  stress              INTEGER,
  sleep_hours         NUMERIC(4,1),
  status              TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS daily_summaries_user_date_idx ON public.daily_summaries (user_id, date);

ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_summaries: select own"  ON public.daily_summaries FOR SELECT TO authenticated USING ( (SELECT auth.uid()) = user_id );
CREATE POLICY "daily_summaries: insert own"  ON public.daily_summaries FOR INSERT TO authenticated WITH CHECK ( (SELECT auth.uid()) = user_id );
CREATE POLICY "daily_summaries: update own"  ON public.daily_summaries FOR UPDATE TO authenticated USING ( (SELECT auth.uid()) = user_id ) WITH CHECK ( (SELECT auth.uid()) = user_id );
CREATE POLICY "daily_summaries: delete own"  ON public.daily_summaries FOR DELETE TO authenticated USING ( (SELECT auth.uid()) = user_id );

CREATE TRIGGER daily_summaries_updated_at BEFORE UPDATE ON public.daily_summaries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── Grant access to authenticated role ───────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_states TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_summaries TO authenticated;
