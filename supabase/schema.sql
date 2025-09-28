create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null,
  home_location_id text not null,
  home_location_label text,
  home_location_latitude numeric,
  home_location_longitude numeric,
  home_location_country_code text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated" on public.profiles
  for select using (auth.role() = 'authenticated');

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  title text,
  pigeon_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  departure_time timestamp with time zone not null,
  arrival_time timestamp with time zone not null,
  status text not null default 'in_flight' constraint message_status_check check (status in ('preparing', 'in_flight', 'delivered')),
  distance_km numeric not null,
  pigeon_speed_kmh numeric not null
);

alter table public.messages enable row level security;

drop policy if exists "messages_select_participants" on public.messages;
create policy "messages_select_participants" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "messages_insert_sender" on public.messages;
create policy "messages_insert_sender" on public.messages
  for insert with check (auth.uid() = sender_id);

drop policy if exists "messages_update_participants" on public.messages;
create policy "messages_update_participants" on public.messages
  for update using (auth.uid() = sender_id or auth.uid() = recipient_id);
