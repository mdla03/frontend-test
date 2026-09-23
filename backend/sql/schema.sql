-- Bayanihan schema. Tables match datamodel.md exactly; spatial_ref_sys is
-- created by the postgis extension itself, not a table this app owns.

create extension if not exists postgis;
create extension if not exists pgcrypto; -- gen_random_uuid()

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid,
  name text not null,
  email text not null unique,
  role text not null default 'user' check (role in ('user', 'organizer', 'admin')),
  organizer_status text not null default 'none' check (organizer_status in ('none', 'pending', 'approved', 'rejected')),
  img_url text,
  password text not null,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_category text check (event_category in ('Sports', 'Lifestyle', 'Community', 'Networking', 'Others')),
  address text,
  location geography(point, 4326),
  latitude double precision,
  longitude double precision,
  start_date date not null,
  end_date date,
  start_time time,
  end_time time,
  capacity integer,
  status text not null default 'submitted' check (status in ('submitted', 'cancelled', 'completed')),
  fee_type text not null default 'free' check (fee_type in ('free', 'paid')),
  reward_type text,
  modality text,
  approved_by uuid references users (id),
  organizer_id uuid not null references users (id),
  img_url text,
  created_at timestamptz not null default now(),
  approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'rejected', 'changes_requested'))
);

create table if not exists event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  user_id uuid not null references users (id) on delete cascade,
  registration_date timestamptz not null default now(),
  status text not null default 'registered' check (status in ('registered', 'waitlisted', 'cancelled')),
  unique (event_id, user_id)
);

create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  event_id uuid references events (id) on delete set null,
  type text not null,
  amount numeric not null default 0,
  status text not null default 'granted' check (status in ('pending', 'granted')),
  created_at timestamptz not null default now()
);

create index if not exists idx_events_organizer on events (organizer_id);
create index if not exists idx_events_approval_status on events (approval_status);
create index if not exists idx_event_registrations_event on event_registrations (event_id);
create index if not exists idx_event_registrations_user on event_registrations (user_id);
create index if not exists idx_rewards_user on rewards (user_id);

-- RPC: map "near me" (PostGIS distance filter, not expressible via PostgREST alone)
create or replace function nearby_events(in_lat double precision, in_lng double precision, in_radius_m double precision)
returns setof events
language sql
stable
as $$
  select *
  from events
  where approval_status = 'approved'
    and location is not null
    and st_dwithin(location, st_setsrid(st_makepoint(in_lng, in_lat), 4326)::geography, in_radius_m)
  order by st_distance(location, st_setsrid(st_makepoint(in_lng, in_lat), 4326)::geography);
$$;

-- RPC: per-user reward leaderboard
create or replace function leaderboard_rewards()
returns table (user_id uuid, name text, img_url text, total_amount numeric)
language sql
stable
as $$
  select u.id as user_id, u.name, u.img_url, coalesce(sum(r.amount), 0) as total_amount
  from users u
  join rewards r on r.user_id = u.id and r.status = 'granted'
  group by u.id, u.name, u.img_url
  order by total_amount desc;
$$;

-- RPC: registrations per month, for admin analytics
create or replace function monthly_registrations()
returns table (month date, count bigint)
language sql
stable
as $$
  select date_trunc('month', registration_date)::date as month, count(*)
  from event_registrations
  group by 1
  order by 1;
$$;
