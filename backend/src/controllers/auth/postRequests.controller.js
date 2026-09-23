import { supabase } from '../../config/supabase.js'
import { comparePassword, hashPassword } from '../../utils/password.js'
import { signToken } from '../../utils/jwt.js'

export async function register(req, res) {
  const { name, email, password } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password are required' })

  const { data: existing } = await supabase.from('users').select('id').eq('email', email).single()
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const { data: user, error } = await supabase
    .from('users')
    .insert({ name, email, password: await hashPassword(password) })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })

  const token = signToken(user)
  const { password: _password, ...safeUser } = user

  res.status(201).json({ message: 'Registered', data: { token, user: safeUser } })
}

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
