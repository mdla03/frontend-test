import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EventCard from '../../components/EventCard'
import { api } from '../../lib/api'

const CATEGORIES = ['All Events', 'Life Skills', 'Wellness', 'Career Growth', 'Icebreakers', 'Social']

// Shown until the backend has seeded events, so the design isn't staring at an empty grid.
const SAMPLE_EVENTS = [
  {
    id: 'sample-1',
    category: 'Life Skills',
    hours: '2.0 hrs',
    day: 'Thu',
    dateLabel: 'Nov 2',
    scheduleText: '4:00 PM – 6:00 PM',
    locationText: '10F Training Rm 2, BGC Tower',
    title: 'Personal Finance 101: Budgeting Your First Salary & Building Wealth',
    description: 'Learn practical compounding, government contribution hacks (SSS, Pag-IBIG MP2), and zero-stress monthly budgeting.',
    avatars: [{ label: 'JD' }, { label: 'MA', bg: 'bg-secondary-container', text: 'text-on-secondary-container' }, { label: 'RL', bg: 'bg-surface-container-highest' }],
    goingText: '5 colleagues going',
    badgeText: '6 slots left',
  },
  {
    id: 'sample-2',
    category: 'Icebreakers',
    hours: '2.0 hrs',
    day: 'Fri',
    dateLabel: 'Nov 3',
    scheduleText: '6:00 PM – 8:00 PM',
    locationText: '12F Sky Lounge BGC',
    title: 'Speed Friending Friday & Board Game Mixer',
    description: 'Break out of your daily team silo with 5-minute round-robin chats followed by board games and free milk tea.',
    avatars: [{ label: 'CB', bg: 'bg-primary-fixed' }, { label: 'NM' }, { label: 'TG', bg: 'bg-secondary-fixed' }],
    goingText: '14 colleagues going',
    badgeText: 'Almost Full (2 left)',
    badgeClass: 'bg-error-container text-on-error-container animate-pulse',
    ctaLabel: 'Claim Last Spots',
    ctaIcon: 'bolt',
  },
  {
    id: 'sample-3',
    category: 'Career Growth',
    hours: '3.0 hrs',
    day: 'Sat',
    dateLabel: 'Nov 4',
    scheduleText: '9:00 AM – 12:00 PM',
    locationText: 'Makati Hub Auditorium',
    title: 'Public Speaking & Pitch Bootcamp: Overcome Stage Fright',
    description: 'Master micro-storytelling, voice modulation, and anxiety reduction techniques with Manulife Toastmasters mentors.',
    avatars: [{ label: 'KL' }, { label: 'PS', bg: 'bg-primary-fixed' }],
    goingText: '7 colleagues going',
    badgeText: '8 slots left',
  },
  {
    id: 'sample-4',
    category: 'Social',
    hours: '1.0 hr',
    day: 'Tue',
    dateLabel: 'Next Wk',
    scheduleIcon: 'coffee',
    scheduleText: 'Flexible 45-min pairing',
    locationIcon: 'shuffle',
    locationText: 'Matched across teams',
    title: 'Coffee Roulette: Bi-Weekly Cross-Department Connection',
    description: 'Get randomly paired with a colleague from Underwriting, IT, Marketing, or Claims for a sponsor-covered coffee chat.',
    goingText: '32 enrolled for next pairing',
    badgeText: 'Open Cohort',
    ctaLabel: 'Join This Round',
    ctaIcon: 'add_circle',
  },
  {
    id: 'sample-5',
    category: 'Life Skills',
    hours: '2.0 hrs',
    day: 'Wed',
    dateLabel: 'Nov 8',
    scheduleText: '3:00 PM – 5:00 PM',
    locationIcon: 'devices',
    locationText: 'Virtual & Hybrid Hub',
    title: 'Excel & Google Sheets Tricks for Everyday Superpowers',
    description: 'From XLOOKUP and INDEX MATCH to dynamic conditional formatting that saves hours every week.',
    avatars: [{ label: 'MC' }, { label: 'JP', bg: 'bg-surface-container-highest' }, { label: 'AA', bg: 'bg-primary-fixed' }],
    goingText: '12 colleagues going',
    badgeText: '15 slots left',
  },
  {
    id: 'sample-6',
    category: 'Wellness',
    hours: '1.5 hrs',
    day: 'Fri',
    dateLabel: 'Nov 10',
    scheduleText: '4:30 PM – 6:00 PM',
    locationIcon: 'spa',
    locationText: 'Quiet Room & Zoom',
    title: 'Mental Wellness & Stress Resilience Workshop',
    description: 'Practical grounding exercises, burnout boundary scripts, and ergonomic micro-stretches for sustained well-being.',
    avatars: [{ label: 'RC', bg: 'bg-surface-container-highest' }, { label: 'MT', bg: 'bg-primary-fixed' }],
    goingText: '9 colleagues going',
    badgeText: '8 slots left',
  },
]

function toCard(event) {
  const start = event.start_time ? new Date(`${event.start_date}T${event.start_time}`) : new Date(event.start_date)
  return {
    id: event.id,
    category: event.event_category,
    day: start.toLocaleDateString('en-US', { weekday: 'short' }),
    dateLabel: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    scheduleText: event.start_time ?? undefined,
    locationText: event.address,
    title: event.title,
    description: event.description,
    badgeText: event.capacity ? `${event.capacity} slots` : undefined,
  }
}

export default function EventsList() {
  const [category, setCategory] = useState('All Events')
  const [search, setSearch] = useState('')
  const [events, setEvents] = useState(null)
  const [usingSample, setUsingSample] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    api
      .get('/events', { params: { category: category === 'All Events' ? undefined : category, search: search || undefined } })
      .then((res) => {
        if (cancelled) return
        const data = res.data.data ?? []
        if (data.length === 0) {
          setEvents(SAMPLE_EVENTS)
          setUsingSample(true)
        } else {
          setEvents(data.map(toCard))
          setUsingSample(false)
        }
      })
      .catch(() => {
        if (cancelled) return
        setEvents(SAMPLE_EVENTS)
        setUsingSample(true)
      })

    return () => {
      cancelled = true
    }
  }, [category, search])

  return (
    <div className="w-full bg-background pb-8">
      <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 py-8 overflow-hidden">
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 right-0 w-80 h-80 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none" />

        <header className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6">
          <div className="flex flex-col max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[15px]">groups</span>
                Bayanihan Culture & Learning
              </span>
            </div>
            <h1 className="font-display-hero text-display-hero-mobile lg:text-display-hero text-on-surface tracking-tight leading-tight">
              Discover Workshops & Social Meetups
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 max-w-2xl leading-relaxed">
              Expand your skill set, destress, and forge cross-department friendships across Manulife Philippines.
            </p>
          </div>
          <div className="flex items-center bg-surface-container p-1 rounded-xl shadow-sm self-start lg:self-auto shrink-0">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md shadow-sm" type="button">
              <span className="material-symbols-outlined text-[18px]">view_agenda</span>
              <span>List View</span>
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors"
              type="button"
              onClick={() => navigate('/map')}
            >
              <span className="material-symbols-outlined text-[18px]">explore</span>
              <span>Map Discovery</span>
            </button>
          </div>
        </header>

        <section className="mt-4 bg-surface-container-lowest rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input
                className="w-full pl-11 pr-4 py-3 bg-surface-container-low rounded-xl text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Search by topic, skill, host speaker, or venue..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md shrink-0 whitespace-nowrap transition-colors ${
                  category === c
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
                type="button"
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {usingSample && (
          <p className="mt-4 font-label-sm text-label-sm text-on-surface-variant">
            Showing sample events — connect a seeded backend to see live data.
          </p>
        )}

        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map((event) => (
            <EventCard key={event.id} {...event} onCtaClick={() => navigate(`/events/${event.id}`)} />
          ))}
        </section>

        <section className="mt-12 bg-gradient-to-r from-primary via-secondary to-primary-container rounded-2xl p-8 text-on-primary shadow-lg relative overflow-hidden">
          <span className="material-symbols-outlined absolute -right-6 -bottom-8 text-[180px] text-white/10 pointer-events-none select-none">
            handshake
          </span>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 max-w-5xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-lowest/15 backdrop-blur-md flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px] text-secondary-fixed">campaign</span>
              </div>
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary-fixed font-bold">
                  Volunteer to Lead a Session
                </span>
                <h2 className="font-headline-md text-headline-md text-on-primary mt-1">Have a passion or hobby to share?</h2>
                <p className="font-body-md text-body-md text-on-primary/90 mt-1 max-w-xl">
                  Host a mini-workshop, book swap, or board game session for your peers. We supply the room, refreshments, and promo!
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
