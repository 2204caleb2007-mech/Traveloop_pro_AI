create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "view own profile" on public.profiles for select using (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.saved_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  destination text not null,
  travelers int not null default 1,
  budget_tier text not null check (budget_tier in ('low','medium','high')),
  start_date date,
  end_date date,
  itinerary jsonb,
  total_budget numeric,
  created_at timestamptz not null default now()
);
alter table public.saved_trips enable row level security;
create policy "select own trips" on public.saved_trips for select using (auth.uid() = user_id);
create policy "insert own trips" on public.saved_trips for insert with check (auth.uid() = user_id);
create policy "update own trips" on public.saved_trips for update using (auth.uid() = user_id);
create policy "delete own trips" on public.saved_trips for delete using (auth.uid() = user_id);

create index saved_trips_user_idx on public.saved_trips(user_id, created_at desc);
revoke execute on function public.handle_new_user() from public, anon, authenticated;