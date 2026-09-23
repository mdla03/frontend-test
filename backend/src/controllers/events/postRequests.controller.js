import { supabase } from '../../config/supabase.js'

const MAX_IMG_URL_LENGTH = 2 * 1024 * 1024

export async function createEvent(req, res) {
  const {
    title,
    description,
    event_category,
    address,
    latitude,
    longitude,
    start_date,
    end_date,
    start_time,
    end_time,
    capacity,
    fee_type,
    reward_type,
    modality,
    img_url,
  } = req.body

  if (!title || !start_date) return res.status(400).json({ error: 'title and start_date are required' })
  // Covers arrive as base64 data URLs, so cap what a client can push into the column.
  if (img_url && img_url.length > MAX_IMG_URL_LENGTH) {
    return res.status(413).json({ error: 'Cover image is too large' })
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      title,
      description,
      event_category,
      address,
      latitude,
      longitude,
      location: latitude && longitude ? `SRID=4326;POINT(${longitude} ${latitude})` : null,
      start_date,
      end_date,
      start_time,
      end_time,
      capacity,
      fee_type,
      reward_type,
      modality,
      img_url,
      organizer_id: req.user.id,
      status: 'submitted',
      approval_status: 'pending',
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  res.status(201).json({ message: 'Event created', data })
}
