-- Supabase schema for SKE app
-- Run this in the Supabase SQL editor for your project.

-- Enable UUID generation (usually enabled by default on Supabase)
create extension if not exists "pgcrypto" with schema public;

-- Categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_amharic text not null,
  description text,
  icon text not null,
  book_count integer not null default 0,
  inserted_at timestamptz not null default now()
);

-- Books table
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  description text not null,
  cover_url text,
  category text not null,
  language text not null,
  published_year integer,
  pages integer,
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  download_count integer not null default 0,
  is_available_offline boolean not null default false,
  created_at timestamptz not null default now()
);

-- Reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  user_id text,
  user_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  sentiment text not null check (sentiment in ('positive','neutral','negative')),
  created_at timestamptz not null default now()
);

-- Chat messages table (optional, for persisting chat history)
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('user','assistant')),
  content text not null,
  book_id uuid references public.books(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Platform stats (single-row configuration table)
create table if not exists public.platform_stats (
  id text primary key default 'main',
  total_books integer not null default 0,
  total_users integer not null default 0,
  total_downloads integer not null default 0,
  total_categories integer not null default 0,
  active_researchers integer not null default 0,
  universities_connected integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Basic row-level security setup
alter table public.categories enable row level security;
alter table public.books enable row level security;
alter table public.reviews enable row level security;
alter table public.chat_messages enable row level security;
alter table public.platform_stats enable row level security;

-- Public read access for anonymous users (adjust as needed)
create policy "Public read categories" on public.categories
  for select using (true);

create policy "Public read books" on public.books
  for select using (true);

create policy "Public read reviews" on public.reviews
  for select using (true);

create policy "Public read platform stats" on public.platform_stats
  for select using (true);

-- Allow anonymous inserts for reviews and chat messages (you can tighten later)
create policy "Anon insert reviews" on public.reviews
  for insert with check (true);

create policy "Anon insert chat messages" on public.chat_messages
  for insert with check (true);

