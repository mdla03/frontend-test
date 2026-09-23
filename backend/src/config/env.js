import 'dotenv/config'

function required(key) {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required env var: ${key}`)
  return value
}

export const ENV = {
  PORT: process.env.PORT || 4000,
  SUPABASE_URL: required('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: required('SUPABASE_SERVICE_ROLE_KEY'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
}
