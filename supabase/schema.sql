-- SnapMark – Supabase-Schema
-- Im SQL-Editor des Supabase-Projekts ausführen.

-- =============================================================
-- Tabellen
-- =============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Unbenanntes Projekt',
  image_path text not null,
  annotations_json jsonb not null default '[]'::jsonb,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_owner_id_idx on public.projects (owner_id);

-- Profil automatisch anlegen, sobald sich ein Benutzer registriert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- Row Level Security
-- =============================================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;

drop policy if exists "Eigenes Profil lesen" on public.profiles;
create policy "Eigenes Profil lesen"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Eigene und öffentliche Projekte lesen" on public.projects;
create policy "Eigene und öffentliche Projekte lesen"
  on public.projects for select
  using (is_public or auth.uid() = owner_id);

drop policy if exists "Eigene Projekte anlegen" on public.projects;
create policy "Eigene Projekte anlegen"
  on public.projects for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Eigene Projekte ändern" on public.projects;
create policy "Eigene Projekte ändern"
  on public.projects for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Eigene Projekte löschen" on public.projects;
create policy "Eigene Projekte löschen"
  on public.projects for delete
  using (auth.uid() = owner_id);

-- =============================================================
-- Storage: Bucket "images"
-- Pfad-Schema: {owner_id}/{project_id}.{ext}
-- Der Bucket ist öffentlich lesbar; die Pfade enthalten unerratbare
-- UUIDs, Projekt-Metadaten schützt die RLS auf `projects`.
-- =============================================================

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

drop policy if exists "Bilder öffentlich lesen" on storage.objects;
create policy "Bilder öffentlich lesen"
  on storage.objects for select
  using (bucket_id = 'images');

drop policy if exists "Eigene Bilder hochladen" on storage.objects;
create policy "Eigene Bilder hochladen"
  on storage.objects for insert
  with check (
    bucket_id = 'images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Eigene Bilder ersetzen" on storage.objects;
create policy "Eigene Bilder ersetzen"
  on storage.objects for update
  using (
    bucket_id = 'images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Eigene Bilder löschen" on storage.objects;
create policy "Eigene Bilder löschen"
  on storage.objects for delete
  using (
    bucket_id = 'images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
