import { supabase } from '../../config/supabase.js'

export async function applyOrganizer(req, res) {
  if (req.user.role !== 'user') return res.status(400).json({ error: 'Only employees can apply to become organizers' })
  if (req.user.organizer_status === 'pending') return res.status(409).json({ error: 'Application already pending' })

  const { data, error } = await supabase
    .from('users')
    .update({ organizer_status: 'pending' })
    .eq('id', req.user.id)
    .select('id, auth_user_id, name, email, role, organizer_status, img_url, created_at')
    .single()

  if (error) return res.status(500).json({ error: error.message })

  res.json({ message: 'Organizer application submitted', data })
}
