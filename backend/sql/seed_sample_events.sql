-- Run in Supabase SQL editor.

insert into users (name, email, role, password)
select 'Sample Organizer', 'organizer@example.com', 'organizer', 'placeholder'
where not exists (select 1 from users where role = 'organizer');

insert into events (
  title, description, event_category, address, location, latitude, longitude,
  start_date, start_time, capacity, status, fee_type, reward_type, modality,
  organizer_id, approval_status
)
select v.title, v.description, v.event_category, v.address,
  st_setsrid(st_makepoint(v.lng, v.lat), 4326)::geography, v.lat, v.lng,
  v.start_date, v.start_time, v.capacity, v.status, v.fee_type, v.reward_type, v.modality,
  (select id from users where role = 'organizer' limit 1), v.approval_status
from (values
  ('Coastal Cleanup Drive', 'Community beach cleanup with gloves and bags provided.', 'Environment',
   'Manila Bay, Manila', 14.5896::double precision, 120.9822::double precision,
   current_date + 7, '07:00'::time, 50, 'submitted', 'free', 'points', 'in-person', 'approved'),
  ('Tree Planting Day', 'Reforestation activity, seedlings supplied on site.', 'Environment',
   'La Mesa Watershed, Quezon City', 14.7275, 121.0645,
   current_date + 14, '08:00', 100, 'submitted', 'free', 'certificate', 'in-person', 'approved'),
  ('Blood Donation Drive', 'Partner hospital blood drive, walk-ins welcome.', 'Health',
   'Barangay Hall, Makati', 14.5547, 121.0244,
   current_date + 3, '09:00', 30, 'submitted', 'free', 'points', 'in-person', 'approved')
) as v(title, description, event_category, address, lat, lng, start_date, start_time, capacity, status, fee_type, reward_type, modality, approval_status);
