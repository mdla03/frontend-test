-- Run once in Supabase SQL editor: drafts are gone; every event is submitted on create.
update events set status = 'submitted' where status = 'draft';

alter table events
  drop constraint if exists events_status_check;

alter table events
  add constraint events_status_check
  check (status in ('submitted', 'cancelled', 'completed'));

alter table events
  alter column status set default 'submitted';
