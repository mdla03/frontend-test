import { supabase } from '../config/supabase.js'
import { verifyToken } from '../utils/jwt.js'

export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' })

  try {
    const decoded = verifyToken(header.slice(7))
    const { data: user, error } = await supabase
      .from('users')
      .select('id, auth_user_id, name, email, role, img_url, created_at')
      .eq('id', decoded.sub)
      .single()

    if (error || !user) return res.status(401).json({ error: 'Invalid token' })

    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
