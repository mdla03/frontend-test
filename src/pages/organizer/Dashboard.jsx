import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'

const STATUS_META = {
  draft: { label: 'Draft', badge: 'bg-surface-container-highest text-tertiary', icon: 'edit_note' },
  pending: { label: 'Under HR Review', badge: 'bg-surface-container-highest text-on-surface-variant', icon: 'hourglass_top' },
  approved: { label: 'Published', badge: 'bg-primary/10 text-primary', icon: null },
  rejected: { label: 'Rejected', badge: 'bg-error-container text-on-error-container', icon: 'block' },
  changes_requested: { label: 'Changes Requested', badge: 'bg-error-container text-on-error-container', icon: 'edit' },
}

function displayStatus(event) {
  if (event.status === 'draft') return 'draft'
  return event.approval_status
}

export default function Dashboard() {
  const [events, setEvents] = useState([])
  const [counts, setCounts] = useState({})
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api
      .get('/events', { params: { organizer: 'me' } })
      .then(async (res) => {
        const data = res.data.data ?? []
        setEvents(data)
        const entries = await Promise.all(
          data.map(async (e) => {
            try {
              const r = await api.get(`/events/${e.id}/registrations`)
              return [e.id, (r.data.data ?? []).filter((reg) => reg.status !== 'cancelled').length]
            } catch {
              return [e.id, 0]
            }
          }),
        )
        setCounts(Object.fromEntries(entries))
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const status = displayStatus(e)
      const matchesFilter = filter === 'all' || status === filter
      const matchesSearch = !search || e.title.toLowerCase().includes(search.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [events, filter, search])

  const totalActive = events.filter((e) => displayStatus(e) !== 'draft').length
  const totalRegistrations = Object.values(counts).reduce((sum, n) => sum + n, 0)

  const tabs = [
    { key: 'all', label: `All Events (${events.length})` },
    { key: 'draft', label: `Drafts (${events.filter((e) => displayStatus(e) === 'draft').length})` },
    { key: 'pending', label: `Pending Review (${events.filter((e) => displayStatus(e) === 'pending').length})` },
    { key: 'approved', label: `Published (${events.filter((e) => displayStatus(e) === 'approved').length})` },
  ]

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
              Committee Portal • People &amp; Culture
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface tracking-tight">
            Organizer Dashboard
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Overview of your events and attendee signups.
          </p>
        </div>
        <Link
          to="/organizer/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-container hover:opacity-95 text-on-primary rounded-lg font-label-md text-label-md shadow-sm transition-opacity shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>New Event</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">Active &amp; Upcoming</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-headline-lg text-headline-lg text-on-surface">{totalActive}</span>
          </div>
          <div className="mt-4 pt-2 flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant flex-wrap">
            <span>{events.filter((e) => displayStatus(e) === 'approved').length} Published</span>
            <span className="w-1 h-1 rounded-full bg-outline-variant" />
            <span className="text-tertiary font-semibold">{events.filter((e) => displayStatus(e) === 'pending').length} Pending</span>
            <span className="w-1 h-1 rounded-full bg-outline-variant" />
            <span>{events.filter((e) => displayStatus(e) === 'draft').length} Draft</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">Total Registrations</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-headline-lg text-headline-lg text-on-surface">{totalRegistrations}</span>
          </div>
          <p className="mt-4 font-label-sm text-label-sm text-on-surface-variant">Across all your events</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Your Events</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Track registrations and review statuses.</p>
              </div>
              <div className="relative w-full md:w-64">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">search</span>
                <input
                  className="w-full h-10 pl-9 pr-4 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Filter by title..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`px-4 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors ${
                    filter === tab.key ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => setFilter(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {loaded && filtered.length === 0 && (
                <p className="font-body-sm text-body-sm text-on-surface-variant py-6 text-center">No events match this filter.</p>
              )}
              {filtered.map((event) => {
                const status = displayStatus(event)
                const meta = STATUS_META[status] ?? STATUS_META.pending
                const count = counts[event.id] ?? 0
                const fillPct = event.capacity ? Math.min(100, Math.round((count / event.capacity) * 100)) : null

                return (
                  <div
                    key={event.id}
                    className="bg-surface p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="w-14 h-16 rounded-xl bg-secondary-container/40 flex flex-col items-center justify-center shrink-0">
                        <span className="font-label-sm text-label-sm uppercase font-bold text-on-secondary-container">
                          {event.start_date ? new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' }) : '—'}
                        </span>
                        <span className="font-headline-md text-headline-md text-on-secondary-container leading-none">
                          {event.start_date ? new Date(event.start_date).getDate() : '—'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {event.event_category && (
                            <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-secondary-container text-on-secondary-fixed font-medium">
                              {event.event_category}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1 ${meta.badge}`}>
                            {meta.icon && <span className="material-symbols-outlined text-[13px]">{meta.icon}</span>}
                            {meta.label}
                          </span>
                        </div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1 text-on-surface-variant font-body-sm text-body-sm">
                          {event.start_time && (
                            <span className="inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] text-outline">schedule</span> {event.start_time}
                            </span>
                          )}
                          {event.address && (
                            <span className="inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] text-outline">location_on</span> {event.address}
                            </span>
                          )}
                        </div>
                        {fillPct !== null && (
                          <div className="mt-2 flex items-center gap-3 max-w-sm">
                            <div className="flex-1 bg-surface-container-high h-2 rounded-full overflow-hidden">
                              <div className="bg-primary-container h-full rounded-full" style={{ width: `${fillPct}%` }} />
                            </div>
                            <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0 font-medium">
                              {count}/{event.capacity} filled
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                      <Link
                        to={`/organizer/events/${event.id}/attendees`}
                        className="px-3 py-1.5 bg-surface-container-low text-on-surface hover:bg-surface-container rounded-lg font-label-sm text-label-sm transition-colors"
                      >
                        Manage ({count})
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-surface-container to-surface-container-low p-6 rounded-xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[18px]">thumb_up</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface">Volunteer Attendance Playbook</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Events scheduled Friday afternoons tend to see higher turnout — plan capacity accordingly.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-primary">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span className="font-label-md text-label-md font-bold uppercase tracking-wide">HR Governance &amp; SLAs</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface">
              Event submissions require review by Manulife People &amp; Culture. Turnaround target is{' '}
              <strong>24–48 hours</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
