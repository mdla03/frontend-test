import { supabase } from '../../config/supabase.js'

export async function listEvents(req, res) {
  const { category, search, modality, organizer } = req.query

  let query = supabase.from('events').select('*').order('start_date', { ascending: true })

  if (req.user.role === 'user') {
    query = query.eq('approval_status', 'approved')
  } else if (req.user.role === 'organizer' && organizer === 'me') {
    query = query.eq('organizer_id', req.user.id)
  }

  if (category) query = query.eq('event_category', category)
  if (modality) query = query.eq('modality', modality)
  if (search) query = query.ilike('title', `%${search}%`)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })

  res.json({ data })
}

export async function getEvent(req, res) {
  const { data, error } = await supabase.from('events').select('*').eq('id', req.params.id).single()
  if (error || !data) return res.status(404).json({ error: 'Event not found' })

  res.json({ data })
}

export async function nearbyEvents(req, res) {
  const { lat, lng, radius = 5000 } = req.query
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' })

  const { data, error } = await supabase.rpc('nearby_events', {
    in_lat: Number(lat),
    in_lng: Number(lng),
    in_radius_m: Number(radius),
  })
  if (error) return res.status(500).json({ error: error.message })

  res.json({ data })
}
