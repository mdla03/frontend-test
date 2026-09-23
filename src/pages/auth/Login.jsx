import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../lib/api'

// Hero feature list — the four things the product actually does.
const features = [
  {
    icon: 'explore',
    title: 'Discover events near you',
    body: 'Clean-up drives, workshops, and fun runs on an interactive map — or join virtually from your desk.',
  },
  {
    icon: 'how_to_reg',
    title: 'Register in one tap',
    body: 'Reserve a slot, land on the waitlist when capacity fills, and keep every upcoming event in one place.',
  },
  {
    icon: 'military_tech',
    title: 'Earn rewards for showing up',
    body: 'Attendance turns into points and certificates, with a company-wide leaderboard to keep it friendly.',
  },
  {
    icon: 'insights',
    title: 'Run and approve events',
    body: 'Organizers manage attendees and check-ins; HR approves submissions and tracks participation.',
  },
]

// Six of the seeded events, mirroring backend/sql/seed_events.sql with the cover
// images from backend/sql/update_event_images.sql. Static on purpose — this page
// is unauthenticated, so it does not call the API.
const showcaseEvents = [
  {
    title: 'Coastal Cleanup Drive',
    category: 'Community',
    where: 'Manila Baywalk, Manila',
    when: 'Sat · 7:00 AM',
    virtual: false,
    img: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800',
  },
  {
    title: 'Virtual Yoga Break',
    category: 'Lifestyle',
    where: 'meet.google.com',
    when: 'Wed · 12:15 PM',
    virtual: true,
    img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
  },
  {
    title: '5K Fun Run for Charity',
    category: 'Sports',
    where: 'Bonifacio Global City, Taguig',
    when: 'Sun · 5:30 AM',
    virtual: false,
    img: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
  },
  {
    title: 'Financial Wellness Clinic',
    category: 'Lifestyle',
    where: 'zoom.us',
    when: 'Thu · 6:00 PM',
    virtual: true,
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
  },
  {
    title: 'Tree Planting Day',
    category: 'Community',
    where: 'La Mesa Watershed, Quezon City',
    when: 'Sat · 8:00 AM',
    virtual: false,
    img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
  },
  {
    title: 'Intro to Agile Delivery',
    category: 'Networking',
    where: 'teams.microsoft.com',
    when: 'Tue · 10:00 AM',
    virtual: true,
    img: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800',
  },
]

// Each landing section owns a full viewport on desktop and snaps into place.
// Below lg the height cap is dropped — forcing a phone screen to hold a whole
// section only shrinks the content into illegibility.
const SECTION = 'lg:min-h-screen lg:snap-start lg:flex lg:flex-col lg:justify-center py-12 sm:py-16'

const steps = [
  { icon: 'search', title: 'Find something worth your Saturday', body: 'Filter by category, date, or distance. Every listing shows capacity, fee, and whether it runs on-site or online.' },
  { icon: 'confirmation_number', title: 'Reserve your slot', body: 'One tap registers you. Full event? You are waitlisted automatically and moved up when a slot frees.' },
  { icon: 'workspace_premium', title: 'Collect what you earned', body: 'Organizers mark attendance, points and certificates land in your profile, and the leaderboard updates.' },
]

const audiences = [
  {
    icon: 'diversity_3',
    label: 'For employees',
    points: ['Browse and map nearby events', 'Track registrations and history', 'Earn points, badges, certificates'],
  },
  {
    icon: 'event_note',
    label: 'For organizers',
    points: ['Create events with cover art and capacity', 'See live registrations and attendance', 'Check attendees in on the day'],
  },
  {
    icon: 'shield_person',
    label: 'For admin & HR',
    points: ['Review and approve submissions', 'Manage organizer applications', 'Watch participation month over month'],
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

  return (
    // h-screen + overflow-y-auto makes this the scroll container, which is what
    // scroll-snap needs; snapping is proximity so a tall section can still scroll.
    <main className="w-full h-screen overflow-y-auto overflow-x-hidden bg-surface lg:snap-y lg:snap-proximity">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* ---------------- hero + sign in ---------------- */}
        <div className={`relative ${SECTION} py-8 sm:py-10`}>
          <div className="absolute -top-28 -left-40 w-[min(680px,90vw)] h-[420px] bg-gradient-to-br from-secondary-container/40 via-primary/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

          <header className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary flex items-center justify-center shadow-md shrink-0">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-on-primary" fill="none" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 18L10 6H14L8 18H4Z" fill="currentColor" />
                <path d="M12 18L18 6H22L16 18H12Z" fill="currentColor" fillOpacity="0.85" />
                <circle cx="20" cy="18" fill="#8BF5B1" r="3" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-headline-sm tracking-tight text-primary font-bold">Manulife</span>
                <span className="text-outline-variant font-light text-body-sm">|</span>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Spaces</span>
              </div>
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary truncate">
                Philippines Employee &amp; Community Platform
              </p>
            </div>
          </header>

          <div className="mt-8 sm:mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-8 lg:gap-12 xl:gap-16 items-start">
            <section className="min-w-0 space-y-7 lg:space-y-6">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary-container/50 text-on-secondary-container px-3 py-1 font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
                  Bayanihan spirit, one shared space
                </span>
                <h1 className="font-display-hero text-display-hero-mobile lg:text-display-hero text-on-surface tracking-tight text-balance">
                  Every event your team runs, in one place
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                  Spaces connects Manulife Philippines employees to volunteer drives, wellness sessions, and
                  company-wide activities — then turns showing up into recognition.
                </p>
              </div>

              <ul className="grid sm:grid-cols-2 gap-x-6 xl:gap-x-8 gap-y-5 sm:gap-y-6">
                {features.map((f) => (
                  <li key={f.title} className="flex gap-3.5 min-w-0">
                    <span className="w-10 h-10 shrink-0 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[22px]">{f.icon}</span>
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-label-lg text-label-lg text-on-surface">{f.title}</h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">{f.body}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-surface-container-low px-4 sm:px-5 py-4">
                {[
                  ['map', 'Map & virtual events'],
                  ['groups', 'Live attendance tracking'],
                  ['leaderboard', 'Rewards leaderboard'],
                ].map(([icon, label]) => (
                  <span key={label} className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px] text-primary">{icon}</span>
                    {label}
                  </span>
                ))}
              </div>
            </section>

            <section className="w-full min-w-0 lg:sticky lg:top-8">
              <div className="bg-surface-container-lowest rounded-xl shadow-md p-5 sm:p-7">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Sign in</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Use your Manulife Philippines employee account.
                </p>

                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
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
                      autoComplete="current-password"
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

                {status && (
                  <div
                    role="status"
                    className="mt-5 bg-secondary-container/50 text-on-secondary-container p-3 rounded-lg flex items-start gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px] text-primary shrink-0">info</span>
                    <span className="font-label-md text-label-md">{status}</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* ---------------- discover ---------------- */}
        {/* min-h-screen + centred content so the six cards land in one viewport. */}
        <section className={`${SECTION} border-t border-surface-container`}>
          <div className="max-w-2xl">
            <h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface tracking-tight">
              Discover what&apos;s near
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-3">
              Filter by category, date, or distance. Every listing tells you where it is, when it starts, and whether
              you need to be there in person.
            </p>
          </div>

          <div className="mt-6 lg:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {showcaseEvents.map((e) => (
              <article
                key={e.title}
                className="min-w-0 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[16/9] bg-surface-container">
                  <img
                    src={e.img}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(ev) => {
                      ev.currentTarget.style.display = 'none'
                    }}
                  />
                  <span className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-surface-container-lowest/90 backdrop-blur px-2.5 py-0.5 font-label-sm text-label-sm text-on-surface shadow-sm">
                    <span className="material-symbols-outlined text-[15px] text-primary">
                      {e.virtual ? 'videocam' : 'location_on'}
                    </span>
                    {e.virtual ? 'Virtual' : 'On-site'}
                  </span>
                </div>

                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-label-sm text-label-sm rounded-full bg-secondary-container/50 text-on-secondary-container px-2.5 py-0.5 shrink-0">
                      {e.category}
                    </span>
                    <span className="font-label-sm text-label-sm text-tertiary truncate">{e.when}</span>
                  </div>
                  <h3 className="font-label-lg text-label-lg text-on-surface line-clamp-1">{e.title}</h3>
                  <p className="flex items-center gap-1.5 min-w-0 font-body-sm text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-primary shrink-0">place</span>
                    <span className="truncate">{e.where}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ---------------- how it works ---------------- */}
        <section className={`${SECTION} border-t border-surface-container`}>
          <div className="max-w-2xl">
            <h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface tracking-tight">
              Every visit counts
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-3">
              From finding an event to collecting the reward, three steps and nothing to chase over email.
            </p>
          </div>

          <ol className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <li key={s.title} className="min-w-0 bg-surface-container-low rounded-xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 shrink-0 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[22px]">{s.icon}</span>
                  </span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="font-label-lg text-label-lg text-on-surface">{s.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------- built for each role ---------------- */}
        <section className={`${SECTION} border-t border-surface-container`}>
          <div className="max-w-2xl">
            <h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface tracking-tight">
              Built for everyone in the room
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-3">
              The same platform serves the people attending, the people running things, and the people approving them.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            {audiences.map((a) => (
              <div key={a.label} className="min-w-0 bg-surface-container-lowest rounded-xl shadow-sm p-6 space-y-4">
                <span className="w-11 h-11 rounded-lg bg-secondary-container/40 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">{a.icon}</span>
                </span>
                <h3 className="font-label-lg text-label-lg text-on-surface">{a.label}</h3>
                <ul className="space-y-2">
                  {a.points.map((p) => (
                    <li key={p} className="flex gap-2 font-body-sm text-body-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px] text-primary shrink-0">check_circle</span>
                      <span className="min-w-0">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- closing CTA ---------------- */}
        <section className={`${SECTION} border-t border-surface-container lg:justify-between`}>
          <div className="lg:flex-1 lg:flex lg:flex-col lg:justify-center">
            <div className="rounded-xl bg-primary text-on-primary px-6 sm:px-10 py-10 sm:py-12 flex flex-col items-center text-center gap-4">
            <h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg tracking-tight text-balance">
              Show up. Get recognised.
            </h2>
            <p className="font-body-md text-body-md text-on-primary/80 max-w-xl">
              Sign in with your employee account to see what is happening this month.
            </p>
            <Link
              to="/signup"
              className="mt-2 bg-surface-container-lowest text-primary py-3 px-7 rounded-lg font-label-lg text-label-lg shadow-md hover:opacity-90 transition-opacity"
            >
              Create an account
            </Link>
            </div>
          </div>

          {/* Footer rides inside the last viewport instead of trailing after it. */}
          <footer className="mt-10 pt-6 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between text-tertiary font-label-sm text-label-sm gap-3">
            <span>© 2026 Manulife Philippines.</span>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <span>Privacy Notice</span>
              <span>Terms of Use</span>
            </div>
          </footer>
        </section>
      </div>
    </main>
  )
}
