-- SnapMark – Supabase-Schema
-- Im SQL-Editor des Supabase-Projekts ausführen.
--
-- Alle Objekte tragen ein "snapmark"-Präfix, damit sich SnapMark eine
-- Supabase-Instanz konfliktfrei mit anderen Apps teilen kann. Es werden
-- keine fremden Tabellen, Funktionen, Trigger oder Policies angefasst.

-- =============================================================
-- Tabellen
-- =============================================================

create table if not exists public.snapmark_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.snapmark_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Unbenanntes Projekt',
  image_path text not null,
  annotations_json jsonb not null default '[]'::jsonb,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists snapmark_projects_owner_id_idx
  on public.snapmark_projects (owner_id);

-- Profil automatisch anlegen, sobald sich ein Benutzer registriert
create or replace function public.snapmark_handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.snapmark_profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists snapmark_on_auth_user_created on auth.users;
create trigger snapmark_on_auth_user_created
  after insert on auth.users
  for each row execute function public.snapmark_handle_new_user();

-- Profile für bereits existierende Benutzer nachziehen
-- (relevant, wenn die Instanz schon Benutzer aus anderen Apps hat)
insert into public.snapmark_profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- =============================================================
-- Row Level Security
-- =============================================================

alter table public.snapmark_profiles enable row level security;
alter table public.snapmark_projects enable row level security;

drop policy if exists "SnapMark: eigenes Profil lesen" on public.snapmark_profiles;
create policy "SnapMark: eigenes Profil lesen"
  on public.snapmark_profiles for select
  using (auth.uid() = id);

drop policy if exists "SnapMark: eigene und öffentliche Projekte lesen" on public.snapmark_projects;
create policy "SnapMark: eigene und öffentliche Projekte lesen"
  on public.snapmark_projects for select
  using (is_public or auth.uid() = owner_id);

drop policy if exists "SnapMark: eigene Projekte anlegen" on public.snapmark_projects;
create policy "SnapMark: eigene Projekte anlegen"
  on public.snapmark_projects for insert
  with check (auth.uid() = owner_id);

drop policy if exists "SnapMark: eigene Projekte ändern" on public.snapmark_projects;
create policy "SnapMark: eigene Projekte ändern"
  on public.snapmark_projects for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "SnapMark: eigene Projekte löschen" on public.snapmark_projects;
create policy "SnapMark: eigene Projekte löschen"
  on public.snapmark_projects for delete
  using (auth.uid() = owner_id);

-- =============================================================
-- Storage: Bucket "snapmark-images"
-- Pfad-Schema: {owner_id}/{project_id}.{ext}
-- Der Bucket ist öffentlich lesbar; die Pfade enthalten unerratbare
-- UUIDs, Projekt-Metadaten schützt die RLS auf `snapmark_projects`.
-- =============================================================

insert into storage.buckets (id, name, public)
values ('snapmark-images', 'snapmark-images', true)
on conflict (id) do nothing;

drop policy if exists "SnapMark: Bilder öffentlich lesen" on storage.objects;
create policy "SnapMark: Bilder öffentlich lesen"
  on storage.objects for select
  using (bucket_id = 'snapmark-images');

drop policy if exists "SnapMark: eigene Bilder hochladen" on storage.objects;
create policy "SnapMark: eigene Bilder hochladen"
  on storage.objects for insert
  with check (
    bucket_id = 'snapmark-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "SnapMark: eigene Bilder ersetzen" on storage.objects;
create policy "SnapMark: eigene Bilder ersetzen"
  on storage.objects for update
  using (
    bucket_id = 'snapmark-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "SnapMark: eigene Bilder löschen" on storage.objects;
create policy "SnapMark: eigene Bilder löschen"
  on storage.objects for delete
  using (
    bucket_id = 'snapmark-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
