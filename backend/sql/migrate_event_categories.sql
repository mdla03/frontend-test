-- Run once in Supabase SQL editor to constrain event_category on an existing table.
alter table events
  add constraint events_event_category_check
  check (event_category in ('Sports', 'Lifestyle', 'Community', 'Networking', 'Others'));
