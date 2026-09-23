-- Seeds one account per role. Run in Supabase SQL editor.
-- Password for all three: demo1234  -- CHANGE before using anywhere real.
create extension if not exists pgcrypto;

insert into users (name, email, role, organizer_status, password)
values
  ('Demo Admin',     'admin@example.com',     'admin',     'approved', crypt('demo1234', gen_salt('bf', 10))),
  ('Demo Organizer', 'organizer@example.com', 'organizer', 'approved', crypt('demo1234', gen_salt('bf', 10))),
  ('Demo User',      'user@example.com',      'user',      'none',     crypt('demo1234', gen_salt('bf', 10)))
on conflict (email) do update
  set role             = excluded.role,
      organizer_status = excluded.organizer_status,
      password         = excluded.password;
