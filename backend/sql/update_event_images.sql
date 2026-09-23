-- Adds cover images to the events seeded by seed_events.sql. Run in the Supabase SQL editor.
-- Matches on title, so it is safe to re-run and only touches rows that exist.
-- Images are hotlinked from Unsplash's CDN (free to use, no API key, no attribution required).
-- The w=1200 query param is Unsplash's own resizer, so these stay small over the wire.

update events as e
set img_url = v.img_url
from (values
  ('Intro to Agile Delivery',        'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200'),
  ('Financial Wellness Clinic',      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200'),
  ('Virtual Yoga Break',             'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200'),
  ('Online Chess Tournament',        'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=1200'),
  ('Volunteer Onboarding Session',   'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200'),
  ('Coastal Cleanup Drive',          'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1200'),
  ('Tree Planting Day',              'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200'),
  ('Blood Donation Drive',           'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1200'),
  ('5K Fun Run for Charity',         'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200'),
  ('Weekend Food Bank Packing',      'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=1200')
) as v(title, img_url)
where e.title = v.title;

-- Any event still without a cover gets a stable placeholder keyed off its title.
update events
set img_url = 'https://picsum.photos/seed/' || left(md5(title), 8) || '/1200/675'
where img_url is null or img_url = '';

select title, modality, left(img_url, 60) as img from events order by start_date;
