-- Foundation only: not applied or security-tested. Do not enable production until reviewed.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text, avatar_url text, created_at timestamptz not null default now()
);
create table public.user_api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null, label text not null default '', encrypted_key text not null,
  account_id text, priority integer not null default 0, enabled boolean not null default true,
  status text, last_error text, last_tested_at timestamptz, cooldown_until timestamptz,
  created_at timestamptz not null default now(), unique (user_id,id)
);
create table public.user_models (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  key_id uuid not null, model_id text not null, kind text not null, priority integer not null default 0,
  enabled boolean not null default true, verified_status text, context_window integer,
  foreign key (user_id,key_id) references public.user_api_keys(user_id,id) on delete cascade
);
create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider_order jsonb not null default '[]', caption_style text, default_language text,
  framing text, clip_length integer, format text, clip_count integer, ai_captions boolean,
  brand jsonb not null default '{}'
);
create table public.projects (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, source_filename text, status text not null default 'draft', options jsonb not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (user_id,id)
);
create table public.clips (
  id uuid primary key default gen_random_uuid(), project_id uuid not null, user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, start_s double precision, end_s double precision, score integer, reason text,
  caption_text text, storage_path text, thumb_path text, size_bytes bigint, created_at timestamptz not null default now(),
  foreign key (user_id,project_id) references public.projects(user_id,id) on delete cascade
);
create table public.ai_usage_log (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null, model text, ok boolean not null, latency_ms integer, error_code text, created_at timestamptz not null default now()
);
create index on public.user_api_keys(user_id,created_at);
create index on public.user_models(user_id,key_id);
create index on public.projects(user_id,created_at desc);
create index on public.clips(user_id,project_id,created_at);
create index on public.ai_usage_log(user_id,created_at desc);

alter table public.profiles enable row level security;
create policy profile_owner on public.profiles for all to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
-- Key ciphertext is deliberately unavailable to browser roles, even to its owner.
-- A future server endpoint must check the authenticated owner before using service credentials.
alter table public.user_api_keys enable row level security;
revoke all on public.user_api_keys from anon, authenticated;
alter table public.user_models enable row level security;
create policy model_owner on public.user_models for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
alter table public.user_settings enable row level security;
create policy settings_owner on public.user_settings for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
alter table public.projects enable row level security;
create policy project_owner on public.projects for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
alter table public.clips enable row level security;
create policy clip_owner on public.clips for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
alter table public.ai_usage_log enable row level security;
create policy usage_owner on public.ai_usage_log for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

insert into storage.buckets (id,name,public) values ('clips','clips',false),('thumbnails','thumbnails',false);
create policy clip_files_owner on storage.objects for all to authenticated
 using (bucket_id in ('clips','thumbnails') and (storage.foldername(name))[1]=(select auth.uid())::text)
 with check (bucket_id in ('clips','thumbnails') and (storage.foldername(name))[1]=(select auth.uid())::text);
