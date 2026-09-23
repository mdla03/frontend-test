import { supabase } from '../../config/supabase.js'

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
    capacity,
    fee_type,
    reward_type,
    modality,
    img_url,
    status,
  } = req.body

  if (!title || !start_date) return res.status(400).json({ error: 'title and start_date are required' })

  const initialStatus = status === 'submitted' ? 'submitted' : 'draft'

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
      capacity,
      fee_type,
      reward_type,
      modality,
      img_url,
      organizer_id: req.user.id,
      status: initialStatus,
      approval_status: 'pending',
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  res.status(201).json({ message: 'Event created', data })
}
