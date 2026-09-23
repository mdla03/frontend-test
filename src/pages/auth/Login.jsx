import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../lib/api'

const demoAccounts = {
  user: { email: 'mark.aquino@manulife.com', landing: '/events' },
  organizer: { email: 'liza.reyes@manulife.com', landing: '/events' },
  admin: { email: 'carlo.santos@manulife.com', landing: '/admin' },
}
const DEMO_PASSWORD = 'demo1234'

const roleCards = [
  {
    role: 'user',
    icon: 'diversity_3',
    iconWrapClass: 'bg-secondary-container/40 text-primary',
    title: 'Employee (User)',
    description: 'Discover life skills workshops, icebreakers, track volunteer hours & earn community rewards.',
    cta: 'Enter as Employee',
  },
  {
    role: 'organizer',
    icon: 'event_note',
    iconWrapClass: 'bg-primary-fixed/50 text-primary',
    title: 'Organization (Organizer)',
    description: 'Create events, manage attendees, track live registrations & review event details.',
    cta: 'Enter Organizer Portal',
  },
  {
    role: 'admin',
    icon: 'shield_person',
    iconWrapClass: 'bg-surface-variant text-on-surface',
    title: 'Admin (Platform & HR)',
    description: 'Approve submitted events, manage organizations & users, oversee rewards and company-wide metrics.',
    cta: 'Enter Admin Portal',
  },
]

export default function Login() {
  const [status, setStatus] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setSubmitting(true)
    setStatus(null)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      login(data.data.token, data.data.user)
      navigate(data.data.user.role === 'admin' ? '/admin' : '/events')
    } catch (err) {
      setStatus(err.response?.data?.error ?? 'Login failed. Check your email and password.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRoleSelect(role) {
    const account = demoAccounts[role]
    setStatus(`Signing in as ${role}... Transferring to platform.`)
    try {
      const { data } = await api.post('/auth/login', { email: account.email, password: DEMO_PASSWORD })
      login(data.data.token, data.data.user)
      navigate(account.landing)
    } catch {
      setStatus('Demo sign-in failed. Check that the backend is running and demo users are seeded.')
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
              Welcome to Bayanihan
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
              Sign in with your Manulife Philippines employee account.
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="w-full max-w-md pt-8 space-y-4">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-surface-tint text-on-primary py-3.5 px-6 rounded-lg font-label-lg text-label-lg transition duration-200 shadow-md disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </form>

        <div className="relative w-full max-w-3xl my-10">
          <div className="w-full h-px bg-surface-container" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-surface px-4 font-label-sm text-label-sm uppercase tracking-wider text-tertiary">
              Or preview by role access (Development &amp; Demo Gateway)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {roleCards.map((card) => (
            <div
              key={card.role}
              className="group relative flex flex-col justify-between bg-surface-container-low hover:bg-surface-container-lowest rounded-xl p-6 transition duration-200 shadow-sm hover:shadow-md"
            >
              <div className="space-y-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.iconWrapClass}`}>
                  <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">{card.title}</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4">
                <button
                  className="w-full bg-surface-container-lowest group-hover:bg-primary text-primary group-hover:text-on-primary py-2.5 px-4 rounded-lg font-label-md text-label-md transition duration-200 flex items-center justify-center space-x-2 shadow-sm"
                  onClick={() => handleRoleSelect(card.role)}
                >
                  <span>{card.cta}</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {status && (
          <div className="mt-6 w-full max-w-3xl bg-secondary-container/50 text-on-secondary-container p-3 rounded-lg flex items-center justify-center transition-all">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-[20px] text-primary">check_circle</span>
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
