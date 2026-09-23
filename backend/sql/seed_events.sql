-- Run in the Supabase SQL editor. Seeds 5 virtual + 5 onsite events.
-- Requires at least one user with role 'organizer' (see seed_accounts.sql).
--
-- Conventions the frontend depends on:
--   modality 'virtual'   -> address holds the meeting URL, location/lat/lng stay null
--                           (EventDetails.jsx:87 only renders a link if address is a URL)
--   modality 'in-person' -> address is a venue, location/lat/lng drive the map
--   event_category is constrained to Sports/Lifestyle/Community/Networking/Others
--   approval_status 'approved' is what makes an event visible to regular users

with organizer as (
  select id from users
  where role = 'organizer'
  order by (email = 'liza.reyes@manulife.com') desc
  limit 1
)
insert into events (
  title, description, event_category, address, location, latitude, longitude,
  start_date, end_date, start_time, end_time, capacity, status, fee_type,
  reward_type, modality, organizer_id, approval_status
)
select
  v.title, v.description, v.event_category, v.address,
  case when v.lat is null then null
       else st_setsrid(st_makepoint(v.lng, v.lat), 4326)::geography end,
  v.lat, v.lng,
  v.start_date, v.start_date, v.start_time, v.end_time, v.capacity,
  'submitted', v.fee_type, v.reward_type, v.modality,
  (select id from organizer), 'approved'
from (values
  -- ---- virtual (address = meeting link, no coordinates) ----
  ('Intro to Agile Delivery', 'Live webinar on sprint planning and retrospectives, recording shared after.', 'Networking',
   'https://teams.microsoft.com/l/meetup-join/agile-delivery', null::double precision, null::double precision,
   (current_date + 4)::date, '10:00'::time, '11:30'::time, 200, 'free', 'certificate', 'virtual'),
  ('Financial Wellness Clinic', 'Budgeting and investing basics with a licensed advisor, Q&A at the end.', 'Lifestyle',
   'https://zoom.us/j/9912345678', null, null,
   (current_date + 6)::date, '18:00', '19:00', 150, 'free', 'points', 'virtual'),
  ('Virtual Yoga Break', 'Thirty-minute guided desk stretch and breathing session, camera optional.', 'Lifestyle',
   'https://meet.google.com/abc-defg-hij', null, null,
   (current_date + 2)::date, '12:15', '12:45', 80, 'free', 'points', 'virtual'),
  ('Online Chess Tournament', 'Swiss-format rapid tournament on Lichess, five rounds.', 'Sports',
   'https://lichess.org/tournament/bayanihan-rapid', null, null,
   (current_date + 11)::date, '19:00', '22:00', 64, 'paid', 'trophy', 'virtual'),
  ('Volunteer Onboarding Session', 'Walkthrough of upcoming community drives and how to sign up.', 'Community',
   'https://teams.microsoft.com/l/meetup-join/volunteer-onboarding', null, null,
   (current_date + 1)::date, '16:00', '17:00', 120, 'free', 'points', 'virtual'),

  -- ---- onsite (real venue + coordinates) ----
  ('Coastal Cleanup Drive', 'Community beach cleanup, gloves and bags provided on site.', 'Community',
   'Manila Baywalk, Roxas Blvd, Manila', 14.5764, 120.9787,
   (current_date + 7)::date, '07:00', '11:00', 50, 'free', 'certificate', 'in-person'),
  ('Tree Planting Day', 'Reforestation activity at the watershed, seedlings supplied.', 'Community',
   'La Mesa Watershed, Quezon City', 14.7275, 121.0645,
   (current_date + 14)::date, '08:00', '12:00', 100, 'free', 'certificate', 'in-person'),
  ('Blood Donation Drive', 'Partner hospital blood drive, walk-ins welcome, bring a valid ID.', 'Community',
   'Barangay Hall, Makati City', 14.5547, 121.0244,
   (current_date + 3)::date, '09:00', '15:00', 30, 'free', 'points', 'in-person'),
  ('5K Fun Run for Charity', 'Morning fun run around the park, race kit included with registration.', 'Sports',
   'Bonifacio Global City, Taguig', 14.5507, 121.0494,
   (current_date + 21)::date, '05:30', '08:00', 300, 'paid', 'medal', 'in-person'),
  ('Weekend Food Bank Packing', 'Sort and pack relief goods for partner barangays, no experience needed.', 'Community',
   'Ortigas Center, Pasig City', 14.5866, 121.0614,
   (current_date + 9)::date, '13:00', '17:00', 40, 'free', 'points', 'in-person')
) as v(title, description, event_category, address, lat, lng,
       start_date, start_time, end_time, capacity, fee_type, reward_type, modality)
where exists (select 1 from organizer);

-- Should print 5 virtual and 5 in-person.
select modality, count(*) from events group by modality;
