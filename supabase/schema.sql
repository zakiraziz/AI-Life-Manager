-- Z4 AI Life Manager Database Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TASKS TABLE
-- ============================================
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  due_date timestamptz,
  completed_at timestamptz,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_due_date_idx on public.tasks(due_date);

-- ============================================
-- HABITS TABLE
-- ============================================
create table if not exists public.habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  color text not null default '#6366f1',
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists habits_user_id_idx on public.habits(user_id);

-- ============================================
-- HABIT LOGS TABLE
-- ============================================
create table if not exists public.habit_logs (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_date date not null,
  created_at timestamptz not null default now(),
  unique(habit_id, logged_date)
);

create index if not exists habit_logs_user_id_idx on public.habit_logs(user_id);
create index if not exists habit_logs_habit_id_idx on public.habit_logs(habit_id);
create index if not exists habit_logs_logged_date_idx on public.habit_logs(logged_date);

-- ============================================
-- NOTES TABLE
-- ============================================
create table if not exists public.notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled',
  content text not null default '',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_user_id_idx on public.notes(user_id);
create index if not exists notes_updated_at_idx on public.notes(updated_at);

-- ============================================
-- USER PROFILES TABLE
-- ============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
alter table public.tasks enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.notes enable row level security;
alter table public.profiles enable row level security;

-- TASKS policies
create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can create own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- HABITS policies
create policy "Users can view own habits"
  on public.habits for select
  using (auth.uid() = user_id);

create policy "Users can create own habits"
  on public.habits for insert
  with check (auth.uid() = user_id);

create policy "Users can update own habits"
  on public.habits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own habits"
  on public.habits for delete
  using (auth.uid() = user_id);

-- HABIT LOGS policies
create policy "Users can view own habit logs"
  on public.habit_logs for select
  using (auth.uid() = user_id);

create policy "Users can create own habit logs"
  on public.habit_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own habit logs"
  on public.habit_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own habit logs"
  on public.habit_logs for delete
  using (auth.uid() = user_id);

-- NOTES policies
create policy "Users can view own notes"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "Users can create own notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notes"
  on public.notes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own notes"
  on public.notes for delete
  using (auth.uid() = user_id);

-- PROFILES policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at on tasks
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();

create trigger habits_updated_at
  before update on public.habits
  for each row execute function public.handle_updated_at();

create trigger notes_updated_at
  before update on public.notes
  for each row execute function public.handle_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();