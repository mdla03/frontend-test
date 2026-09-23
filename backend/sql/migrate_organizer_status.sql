-- Run once in Supabase SQL editor to add organizer-application tracking to an existing table.
alter table users
  add column if not exists organizer_status text not null default 'none'
  check (organizer_status in ('none', 'pending', 'approved', 'rejected'));
