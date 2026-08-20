
CREATE TYPE public.app_role AS ENUM ('admin','funcionario','pessoal');
CREATE TYPE public.scope_type AS ENUM ('empresa','pessoal');
CREATE TYPE public.priority_type AS ENUM ('baixa','media','alta','urgente');
CREATE TYPE public.event_status AS ENUM ('agendado','confirmado','concluido','cancelado');
CREATE TYPE public.task_status AS ENUM ('a_fazer','em_andamento','concluida','atrasada');
CREATE TYPE public.recurrence_type AS ENUM ('nao','diario','semanal','mensal','anual','personalizado');

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  company text,
  work_start time NOT NULL DEFAULT '08:00',
  work_end time NOT NULL DEFAULT '18:00',
  timezone text NOT NULL DEFAULT 'America/Sao_Paulo',
  week_start smallint NOT NULL DEFAULT 0,
  theme text NOT NULL DEFAULT 'light',
  notify_in_app boolean NOT NULL DEFAULT true,
  default_reminder integer NOT NULL DEFAULT 15,
  color_empresa text NOT NULL DEFAULT '#2563eb',
  color_pessoal text NOT NULL DEFAULT '#16a34a',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_roles_select_own_or_admin" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'cliente',
  name text NOT NULL,
  company text,
  phone text,
  email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_select" ON public.clients FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "clients_insert" ON public.clients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clients_update" ON public.clients FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clients_delete" ON public.clients FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  scope public.scope_type NOT NULL DEFAULT 'empresa',
  category text NOT NULL DEFAULT 'empresa',
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  all_day boolean NOT NULL DEFAULT false,
  location text,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  responsible text,
  priority public.priority_type NOT NULL DEFAULT 'media',
  status public.event_status NOT NULL DEFAULT 'agendado',
  notes text,
  recurrence public.recurrence_type NOT NULL DEFAULT 'nao',
  recurrence_interval integer NOT NULL DEFAULT 1,
  recurrence_end date,
  reminder_minutes integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX events_user_start_idx ON public.events (user_id, start_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_select" ON public.events FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR (scope = 'empresa' AND public.has_role(auth.uid(), 'admin')));
CREATE POLICY "events_insert" ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "events_update" ON public.events FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR (scope = 'empresa' AND public.has_role(auth.uid(), 'admin')))
  WITH CHECK (auth.uid() = user_id OR (scope = 'empresa' AND public.has_role(auth.uid(), 'admin')));
CREATE POLICY "events_delete" ON public.events FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR (scope = 'empresa' AND public.has_role(auth.uid(), 'admin')));
CREATE TRIGGER trg_events_updated BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  scope public.scope_type NOT NULL DEFAULT 'empresa',
  category text NOT NULL DEFAULT 'tarefa',
  due_at timestamptz,
  priority public.priority_type NOT NULL DEFAULT 'media',
  responsible text,
  status public.task_status NOT NULL DEFAULT 'a_fazer',
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR (scope = 'empresa' AND public.has_role(auth.uid(), 'admin')));
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR (scope = 'empresa' AND public.has_role(auth.uid(), 'admin')))
  WITH CHECK (auth.uid() = user_id OR (scope = 'empresa' AND public.has_role(auth.uid(), 'admin')));
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_all_own" ON public.notifications FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'funcionario'))
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
