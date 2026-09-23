import { supabase } from '../../config/supabase.js'

export async function myRegistrations(req, res) {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*, events(*)')
    .eq('user_id', req.user.id)
    .order('registration_date', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  res.json({ data })
}

export async function eventRegistrations(req, res) {
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('organizer_id')
    .eq('id', req.params.id)
    .single()

  if (eventError || !event) return res.status(404).json({ error: 'Event not found' })
  if (req.user.role === 'organizer' && event.organizer_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const { data, error } = await supabase
    .from('event_registrations')
    .select('*, users(id, name, email, img_url)')
    .eq('event_id', req.params.id)
    .order('registration_date', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })

  res.json({ data })
}
