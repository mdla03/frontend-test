-- Run once in Supabase SQL editor: events now capture an end time alongside the start.
alter table events
  add column if not exists end_time time;
