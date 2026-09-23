import { supabase } from '../../config/supabase.js'

const EDITABLE_FIELDS = ['name', 'role', 'img_url']

export async function updateUser(req, res) {
  const updates = {}
  for (const field of EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field]
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', req.params.id)
    .select('id, auth_user_id, name, email, role, img_url, created_at')
    .single()

  if (error || !data) return res.status(404).json({ error: 'User not found' })

  res.json({ message: 'User updated', data })
}
