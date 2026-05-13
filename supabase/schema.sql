create extension if not exists "pgcrypto";

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  subject text not null check (subject in ('english', 'math', 'law')),
  title text not null,
  objective text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lessons_room_id_idx on public.lessons(room_id);

create table if not exists public.canvas_events (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid,
  event_id text not null,
  sequence bigint not null default 0,
  event_type text not null check (event_type in ('stroke', 'text', 'clear')),
  event_data jsonb not null,
  created_at timestamptz not null default now()
);

create unique index if not exists canvas_events_event_id_idx on public.canvas_events(event_id);
create index if not exists canvas_events_room_id_created_at_idx on public.canvas_events(room_id, created_at desc);

create table if not exists public.room_presence (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null,
  display_name text,
  color text,
  is_active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create index if not exists room_presence_room_id_last_seen_at_idx on public.room_presence(room_id, last_seen_at desc);

create table if not exists public.room_snapshots (
  room_id uuid primary key references public.rooms(id) on delete cascade,
  connected_peers integer not null default 0,
  active_lesson jsonb,
  updated_at timestamptz not null default now()
);

alter table public.canvas_events enable row level security;
alter table public.room_presence enable row level security;
alter table public.room_snapshots enable row level security;
alter table public.rooms enable row level security;

create policy "Anyone can read canvas events"
  on public.canvas_events for select using (true);

create policy "Anyone can insert canvas events"
  on public.canvas_events for insert with check (true);

create policy "Anyone can read room presence"
  on public.room_presence for select using (true);

create policy "Anyone can upsert room presence"
  on public.room_presence for insert with check (true);

create policy "Anyone can update room presence"
  on public.room_presence for update using (true);

create policy "Anyone can read room snapshots"
  on public.room_snapshots for select using (true);

create policy "Anyone can upsert room snapshots"
  on public.room_snapshots for insert with check (true);

create policy "Anyone can update room snapshots"
  on public.room_snapshots for update using (true);

create policy "Anyone can read rooms"
  on public.rooms for select using (true);

create policy "Anyone can create rooms"
  on public.rooms for insert with check (true);
