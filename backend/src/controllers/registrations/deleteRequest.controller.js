import { supabase } from '../../config/supabase.js'

export async function cancelRegistration(req, res) {
  const { data, error } = await supabase
    .from('event_registrations')
    .update({ status: 'cancelled' })
    .eq('event_id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single()

  if (error || !data) return res.status(404).json({ error: 'Registration not found' })

  res.json({ message: 'Registration cancelled', data })
}
