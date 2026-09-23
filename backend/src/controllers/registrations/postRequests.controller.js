import { supabase } from '../../config/supabase.js'

export async function registerForEvent(req, res) {
  const eventId = req.params.id

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('capacity, approval_status')
    .eq('id', eventId)
    .single()

  if (eventError || !event) return res.status(404).json({ error: 'Event not found' })
  if (event.approval_status !== 'approved') return res.status(400).json({ error: 'Event is not open for registration' })

  const { count, error: countError } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', 'registered')

  if (countError) return res.status(500).json({ error: countError.message })

  const status = event.capacity != null && count >= event.capacity ? 'waitlisted' : 'registered'

  const { data, error } = await supabase
    .from('event_registrations')
    .insert({ event_id: eventId, user_id: req.user.id, status })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Already registered for this event' })
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json({ message: status === 'waitlisted' ? 'Added to waitlist' : 'Registered', data })
}
