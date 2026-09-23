import { supabase } from '../../config/supabase.js'

const EDITABLE_FIELDS = ['name', 'role', 'organizer_status', 'img_url']

export async function updateUser(req, res) {
  const updates = {}
  for (const field of EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field]
  }

  // A manual role change settles any open application, so reset it unless the
  // caller set the status explicitly (the approve/reject buttons do).
  if (updates.role && updates.organizer_status === undefined) {
    updates.organizer_status = 'none'
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', req.params.id)
    .select('id, auth_user_id, name, email, role, organizer_status, img_url, created_at')
    .single()

  if (error || !data) return res.status(404).json({ error: 'User not found' })

  res.json({ message: 'User updated', data })
}
