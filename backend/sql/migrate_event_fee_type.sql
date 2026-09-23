-- Run once in Supabase SQL editor: fee_type is now a free/paid choice, not freeform text.
update events set fee_type = 'free' where fee_type is null or fee_type not in ('free', 'paid');

alter table events
  alter column fee_type set default 'free';

alter table events
  alter column fee_type set not null;

alter table events
  drop constraint if exists events_fee_type_check;

alter table events
  add constraint events_fee_type_check check (fee_type in ('free', 'paid'));
