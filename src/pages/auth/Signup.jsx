import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../lib/api'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setStatus(null)
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      login(data.data.token, data.data.user)
      navigate('/events')
    } catch (err) {
      setStatus(err.response?.data?.error ?? 'Sign up failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="w-full min-h-screen overflow-x-hidden bg-surface flex flex-col items-center p-gutter-lg">
      <div className="relative w-full max-w-5xl flex flex-col items-center py-10">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-secondary-container/30 via-primary/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-on-primary" fill="none" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 18L10 6H14L8 18H4Z" fill="currentColor" />
                <path d="M12 18L18 6H22L16 18H12Z" fill="currentColor" fillOpacity="0.85" />
                <circle cx="20" cy="18" fill="#8BF5B1" r="3" />
              </svg>
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-1.5">
                <span className="font-headline-sm text-headline-sm tracking-tight text-primary font-bold">Manulife</span>
                <span className="text-outline-variant font-light text-body-sm">|</span>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Bayanihan</span>
              </div>
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary">
                Philippines Employee &amp; Community Platform
              </p>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero text-on-surface tracking-tight">
              Create your account
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
              Sign up to discover workshops, track volunteer hours, and earn community rewards.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md pt-8 space-y-4">
          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Juan Dela Cruz"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@manulife.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="At least 8 characters"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-surface-tint text-on-primary py-3.5 px-6 rounded-lg font-label-lg text-label-lg transition duration-200 shadow-md disabled:opacity-60"
          >
            {submitting ? 'Creating account...' : 'Sign Up'}
          </button>
          <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </form>

        {status && (
          <div className="mt-6 w-full max-w-md bg-secondary-container/50 text-on-secondary-container p-3 rounded-lg flex items-center justify-center transition-all">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-[20px] text-primary">error</span>
              <span className="font-label-md text-label-md">{status}</span>
            </div>
          </div>
        )}

        <div className="w-full mt-6 py-2 flex flex-col sm:flex-row items-center justify-between text-tertiary font-label-sm text-label-sm px-2 gap-3">
          <span>© 2026 Manulife Philippines.</span>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <span>Privacy Notice</span>
            <span>Terms of Use</span>
          </div>
        </div>
      </div>
    </main>
  )
}
