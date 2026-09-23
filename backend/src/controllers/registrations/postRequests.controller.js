import { supabase } from '../../config/supabase.js'

export async function registerForEvent(req, res) {
  const eventId = req.params.id

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('approval_status')
    .eq('id', eventId)
    .single()

  if (eventError || !event) return res.status(404).json({ error: 'Event not found' })
  if (event.approval_status !== 'approved') return res.status(400).json({ error: 'Event is not open for registration' })

  // Cancelling leaves the row in place, so re-registering must revive it rather
  // than insert a duplicate (event_id, user_id) pair.
  const { data, error } = await supabase
    .from('event_registrations')
    .upsert(
      { event_id: eventId, user_id: req.user.id, status: 'registered', registration_date: new Date().toISOString() },
      { onConflict: 'event_id,user_id' },
    )
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  res.status(201).json({ message: 'Registered', data })
}
