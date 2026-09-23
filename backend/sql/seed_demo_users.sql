-- Run in Supabase SQL editor. Password for all three: demo1234
insert into users (name, email, role, password)
values
  ('Mark Aquino', 'mark.aquino@manulife.com', 'user', '$2a$10$r4a0W0et0lVV99RLXe/a9erq/fTv3VB4TP1zfJPAnf0s6/69nSkqe'),
  ('Liza Reyes', 'liza.reyes@manulife.com', 'organizer', '$2a$10$r4a0W0et0lVV99RLXe/a9erq/fTv3VB4TP1zfJPAnf0s6/69nSkqe'),
  ('Carlo Santos', 'carlo.santos@manulife.com', 'admin', '$2a$10$r4a0W0et0lVV99RLXe/a9erq/fTv3VB4TP1zfJPAnf0s6/69nSkqe')
on conflict (email) do nothing;
