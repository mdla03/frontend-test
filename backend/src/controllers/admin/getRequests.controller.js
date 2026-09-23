import { supabase } from '../../config/supabase.js'

export async function listUsers(req, res) {
  const { data, error } = await supabase
    .from('users')
    .select('id, auth_user_id, name, email, role, organizer_status, img_url, created_at')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  res.json({ data })
}

export async function analytics(req, res) {
  const [{ count: totalEvents }, { count: totalRegistrations }, monthly] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('event_registrations').select('*', { count: 'exact', head: true }),
    supabase.rpc('monthly_registrations'),
  ])

  if (monthly.error) return res.status(500).json({ error: monthly.error.message })

  res.json({
    data: {
      totalEvents,
      totalRegistrations,
      registrationsByMonth: monthly.data,
    },
  })
}
