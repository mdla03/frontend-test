import { supabase } from '../../config/supabase.js'
import { comparePassword } from '../../utils/password.js'
import { signToken } from '../../utils/jwt.js'

export async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' })

  const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single()
  if (error || !user) return res.status(401).json({ error: 'Invalid email or password' })

  const valid = await comparePassword(password, user.password)
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

  const token = signToken(user)
  const { password: _password, ...safeUser } = user

  res.json({ message: 'Logged in', data: { token, user: safeUser } })
}
