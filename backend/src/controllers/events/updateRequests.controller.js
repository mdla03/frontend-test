import { supabase } from '../../config/supabase.js'

const EDITABLE_FIELDS = [
  'title',
  'description',
  'event_category',
  'address',
  'latitude',
  'longitude',
  'start_date',
  'end_date',
  'start_time',
  'end_time',
  'capacity',
  'fee_type',
  'reward_type',
  'modality',
  'img_url',
]

export async function updateEvent(req, res) {
  const { data: existing, error: findError } = await supabase
    .from('events')
    .select('organizer_id')
    .eq('id', req.params.id)
    .single()

  if (findError || !existing) return res.status(404).json({ error: 'Event not found' })
  if (existing.organizer_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })

  const updates = {}
  for (const field of EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field]
  }
  if (updates.latitude !== undefined && updates.longitude !== undefined) {
    updates.location = `SRID=4326;POINT(${updates.longitude} ${updates.latitude})`
  }

  const { data, error } = await supabase.from('events').update(updates).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })

  res.json({ message: 'Event updated', data })
}

export async function updateEventStatus(req, res) {
  const { approval_status } = req.body
  const allowed = ['approved', 'rejected']
  if (!allowed.includes(approval_status)) {
    return res.status(400).json({ error: `approval_status must be one of ${allowed.join(', ')}` })
  }

  const { data, error } = await supabase
    .from('events')
    .update({ approval_status, approved_by: req.user.id })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  res.json({ message: 'Event status updated', data })
}
