import { supabase } from '../../config/supabase.js'

export async function myRewards(req, res) {
  const { data, error } = await supabase
    .from('rewards')
    .select('*, events(title)')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  const total = data.filter((r) => r.status === 'granted').reduce((sum, r) => sum + Number(r.amount), 0)

  res.json({ data: { total, rewards: data } })
}

export async function leaderboard(req, res) {
  const { data, error } = await supabase.rpc('leaderboard_rewards')
  if (error) return res.status(500).json({ error: error.message })

  res.json({ data })
}
