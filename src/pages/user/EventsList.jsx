import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EventCard from '../../components/EventCard'
import { api } from '../../lib/api'

function slotsLabel(event) {
  if (!event.capacity) return undefined
  const left = Math.max(0, event.capacity - (event.taken ?? 0))
  return left === 0 ? 'Full' : `${left} of ${event.capacity} slots left`
}

function toCard(event, registeredIds) {
  const start = event.start_time ? new Date(`${event.start_date}T${event.start_time}`) : new Date(event.start_date)
  return {
    ...event,
    id: event.id,
    category: event.event_category,
    day: event.day ?? start.toLocaleDateString('en-US', { weekday: 'short' }),
    dateLabel: event.dateLabel ?? start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    scheduleText: event.scheduleText ?? event.start_time ?? undefined,
    locationText: event.locationText ?? event.address,
    title: event.title,
    description: event.description,
    registered: registeredIds.has(event.id),
    badgeText: event.badgeText ?? slotsLabel(event),
  }
}

export default function EventsList() {
  const [category, setCategory] = useState('All Events')
  const [search, setSearch] = useState('')
  const [events, setEvents] = useState(null)
  const [categories, setCategories] = useState(['All Events'])
  const [registeredIds, setRegisteredIds] = useState(() => new Set())
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/events').then((res) => {
      const unique = [...new Set((res.data.data ?? []).map((e) => e.event_category).filter(Boolean))]
      setCategories(['All Events', ...unique])
    })

    api
      .get('/me/registrations')
      .then((res) =>
        setRegisteredIds(new Set((res.data.data ?? []).filter((r) => r.status !== 'cancelled').map((r) => r.event_id))),
      )
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false

    api
      .get('/events', { params: { category: category === 'All Events' ? undefined : category, search: search || undefined } })
      .then((res) => {
        if (cancelled) return
        setEvents((res.data.data ?? []).map((e) => toCard(e, registeredIds)))
      })
      .catch(() => {
        if (cancelled) return
        setEvents([])
      })

    return () => {
      cancelled = true
    }
  }, [category, search, registeredIds])

  return (
    <div className="w-full bg-background pb-8">
      <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 py-8 overflow-hidden">
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 right-0 w-80 h-80 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none" />

        <header className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6">
          <div className="flex flex-col max-w-3xl">
            <h1 className="font-display-hero text-display-hero-mobile lg:text-display-hero text-on-surface tracking-tight leading-tight">
              Discover Workshops & Social Meetups
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 max-w-2xl leading-relaxed">
              Expand your skill set, destress, and forge cross-department friendships across Manulife Philippines.
            </p>
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
            {categories.map((c) => (
              <button
                key={c}
                className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md shrink-0 whitespace-nowrap transition-colors ${category === c
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

        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map((event) => (
            <EventCard key={event.id} {...event} onClick={() => navigate(`/events/${event.id}`)} />
          ))}
        </section>

        {events && events.length === 0 && (
          <p className="mt-8 font-body-md text-body-md text-on-surface-variant text-center">
            No events found. Check back once organizers have events approved.
          </p>
        )}
      </div>
    </div>
  )
}
