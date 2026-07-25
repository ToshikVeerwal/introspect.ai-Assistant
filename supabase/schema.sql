-- Lumora: Supabase schema. Run in the Supabase SQL editor after enabling pgvector.
create extension if not exists vector;
create extension if not exists pgcrypto;

create type public.mood_name as enum ('joy', 'calm', 'focused', 'anxious', 'tender', 'low');
create type public.entry_source as enum ('voice', 'text', 'conversation');
create type public.goal_horizon as enum ('short_term', 'long_term', 'vision');
create type public.goal_status as enum ('active', 'paused', 'complete', 'archived');
create type public.notification_kind as enum ('reflection', 'memory', 'goal', 'wellbeing', 'streak');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  timezone text not null default 'UTC',
  locale text not null default 'en',
  onboarding_complete boolean not null default false,
  voice_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 20000),
  source public.entry_source not null default 'text',
  occurred_at timestamptz not null default now(),
  latitude numeric(9,6),
  longitude numeric(9,6),
  location_label text,
  ai_summary text,
  embedding vector(1536),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((latitude is null and longitude is null) or (latitude between -90 and 90 and longitude between -180 and 180))
);
create index journal_entries_user_occurred_idx on public.journal_entries(user_id, occurred_at desc) where archived_at is null;
create index journal_entries_embedding_idx on public.journal_entries using hnsw (embedding vector_cosine_ops);

create table public.entry_moods (
  entry_id uuid primary key references public.journal_entries(id) on delete cascade,
  primary_mood public.mood_name not null,
  score smallint not null check (score between 0 and 100),
  explanation text not null,
  signals jsonb not null default '[]'::jsonb,
  analyzed_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 30),
  color text,
  unique (user_id, lower(label))
);
create table public.entry_tags (
  entry_id uuid not null references public.journal_entries(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (entry_id, tag_id)
);
create table public.journal_assets (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.journal_entries(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  mime_type text not null,
  bytes bigint not null check (bytes >= 0 and bytes <= 26214400),
  transcript text,
  duration_seconds integer check (duration_seconds >= 0),
  created_at timestamptz not null default now()
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  description text,
  horizon public.goal_horizon not null default 'short_term',
  status public.goal_status not null default 'active',
  target_date date,
  progress smallint not null default 0 check (progress between 0 and 100),
  ai_suggestion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index goals_user_status_idx on public.goals(user_id, status, target_date);
create table public.goal_milestones (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  completed_at timestamptz,
  position smallint not null default 0
);

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 80),
  category text not null default 'custom',
  is_ai_detected boolean not null default false,
  insight text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(user_id, label)
);
create table public.habit_observations (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  entry_id uuid references public.journal_entries(id) on delete set null,
  observed_on date not null,
  confidence smallint not null check (confidence between 0 and 100),
  note text
);
create index habit_observations_habit_date_idx on public.habit_observations(habit_id, observed_on desc);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null check (char_length(content) <= 12000),
  created_at timestamptz not null default now()
);
create index conversation_messages_conversation_created_idx on public.conversation_messages(conversation_id, created_at);

create table public.memory_entities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('person', 'place', 'goal', 'habit', 'event', 'dream', 'emotion')),
  label text not null check (char_length(label) between 1 and 120),
  summary text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique(user_id, kind, label)
);
create table public.memory_links (
  source_entity_id uuid not null references public.memory_entities(id) on delete cascade,
  target_entity_id uuid not null references public.memory_entities(id) on delete cascade,
  relation text not null check (char_length(relation) between 1 and 60),
  weight numeric(4,3) not null default 0.5 check (weight between 0 and 1),
  primary key (source_entity_id, target_entity_id, relation),
  check (source_entity_id <> target_entity_id)
);
create table public.entry_memory_entities (
  entry_id uuid not null references public.journal_entries(id) on delete cascade,
  entity_id uuid not null references public.memory_entities(id) on delete cascade,
  primary key (entry_id, entity_id)
);

create table public.weekly_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  summary text not null,
  happiest_moment text,
  stressful_moment text,
  lesson text,
  affirmation text,
  mood_trend jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique(user_id, week_start)
);
create table public.monthly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  month_start date not null,
  report jsonb not null,
  storage_path text,
  created_at timestamptz not null default now(),
  unique(user_id, month_start)
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind public.notification_kind not null,
  title text not null,
  body text not null,
  scheduled_for timestamptz not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_pending_idx on public.notifications(user_id, scheduled_for) where read_at is null;

create or replace function public.set_updated_at() returns trigger language plpgsql security invoker as $$ begin new.updated_at = now(); return new; end; $$;
create trigger profiles_updated before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger entries_updated before update on public.journal_entries for each row execute procedure public.set_updated_at();
create trigger goals_updated before update on public.goals for each row execute procedure public.set_updated_at();
create trigger conversations_updated before update on public.conversations for each row execute procedure public.set_updated_at();

-- Semantic search. Generate the query embedding in a trusted server route, never the browser.
create or replace function public.match_journal_entries(query_embedding vector(1536), match_user_id uuid, match_count int default 12)
returns table (id uuid, title text, body text, occurred_at timestamptz, similarity float)
language sql stable security invoker set search_path = public as $$
  select id, title, body, occurred_at, 1 - (embedding <=> query_embedding) as similarity
  from public.journal_entries
  where user_id = match_user_id and archived_at is null and embedding is not null
  order by embedding <=> query_embedding limit least(greatest(match_count, 1), 50);
$$;

alter table public.profiles enable row level security;
alter table public.journal_entries enable row level security;
alter table public.entry_moods enable row level security;
alter table public.tags enable row level security;
alter table public.entry_tags enable row level security;
alter table public.journal_assets enable row level security;
alter table public.goals enable row level security;
alter table public.goal_milestones enable row level security;
alter table public.habits enable row level security;
alter table public.habit_observations enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.memory_entities enable row level security;
alter table public.memory_links enable row level security;
alter table public.entry_memory_entities enable row level security;
alter table public.weekly_reflections enable row level security;
alter table public.monthly_reports enable row level security;
alter table public.notifications enable row level security;

create policy "own profile" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "own entries" on public.journal_entries for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own moods" on public.entry_moods for all using (exists(select 1 from public.journal_entries e where e.id = entry_id and e.user_id = auth.uid())) with check (exists(select 1 from public.journal_entries e where e.id = entry_id and e.user_id = auth.uid()));
create policy "own tags" on public.tags for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own entry tags" on public.entry_tags for all using (exists(select 1 from public.journal_entries e where e.id = entry_id and e.user_id = auth.uid())) with check (exists(select 1 from public.journal_entries e where e.id = entry_id and e.user_id = auth.uid()));
create policy "own assets" on public.journal_assets for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own goals" on public.goals for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own milestones" on public.goal_milestones for all using (exists(select 1 from public.goals g where g.id = goal_id and g.user_id = auth.uid())) with check (exists(select 1 from public.goals g where g.id = goal_id and g.user_id = auth.uid()));
create policy "own habits" on public.habits for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own observations" on public.habit_observations for all using (exists(select 1 from public.habits h where h.id = habit_id and h.user_id = auth.uid())) with check (exists(select 1 from public.habits h where h.id = habit_id and h.user_id = auth.uid()));
create policy "own conversations" on public.conversations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own messages" on public.conversation_messages for all using (exists(select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid())) with check (exists(select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()));
create policy "own entities" on public.memory_entities for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own links" on public.memory_links for all using (exists(select 1 from public.memory_entities e where e.id = source_entity_id and e.user_id = auth.uid())) with check (exists(select 1 from public.memory_entities e where e.id = source_entity_id and e.user_id = auth.uid()));
create policy "own entity mentions" on public.entry_memory_entities for all using (exists(select 1 from public.journal_entries e where e.id = entry_id and e.user_id = auth.uid())) with check (exists(select 1 from public.journal_entries e where e.id = entry_id and e.user_id = auth.uid()));
create policy "own weekly reflections" on public.weekly_reflections for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own reports" on public.monthly_reports for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own notifications" on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Create private buckets in Storage dashboard: journal-assets and reports.
-- Storage policy pattern: bucket_id = 'journal-assets' and (storage.foldername(name))[1] = auth.uid()::text
