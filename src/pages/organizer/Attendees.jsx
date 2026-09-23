import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../lib/api'

function initials(name) {
  return (name ?? '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Attendees() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [myEvents, setMyEvents] = useState([])
  const [event, setEvent] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [tab, setTab] = useState('confirmed')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api
      .get('/events', { params: { organizer: 'me' } })
      .then((res) => setMyEvents(res.data.data ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data.data))
      .catch(() => {})
    api
      .get(`/events/${id}/registrations`)
      .then((res) => setRegistrations(res.data.data ?? []))
      .catch(() => setRegistrations([]))
  }, [id])

  const confirmed = registrations.filter((r) => r.status === 'registered')
  const waitlisted = registrations.filter((r) => r.status === 'waitlisted')
  const rows = (tab === 'confirmed' ? confirmed : waitlisted).filter(
    (r) => !search || r.users?.name?.toLowerCase().includes(search.toLowerCase()),
  )
  const fillPct = event?.capacity ? Math.min(100, Math.round((confirmed.length / event.capacity) * 100)) : null

  return (
    <div className="flex flex-col w-full gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline gap-4">
          <h1 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface tracking-tight">
            Attendees
          </h1>
          <select
            className="appearance-none bg-surface-container-low pl-3 pr-8 py-1.5 rounded-lg font-headline-sm text-headline-sm text-primary font-semibold cursor-pointer focus:outline-none shadow-sm"
            value={id}
            onChange={(e) => navigate(`/organizer/events/${e.target.value}/attendees`)}
          >
            {myEvents.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>
        {event?.address && (
          <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
            {event.address}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-md text-label-md font-semibold">Confirmed Slots</span>
            <span className="material-symbols-outlined text-[18px] text-primary">how_to_reg</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg text-on-surface">{confirmed.length}</span>
            {event?.capacity && <span className="font-label-md text-label-md text-outline">/ {event.capacity} target</span>}
          </div>
          {fillPct !== null && (
            <div className="mt-2 w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${fillPct}%` }} />
            </div>
          )}
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-md text-label-md font-semibold">Waitlist Queue</span>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">schedule</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg text-on-surface">{waitlisted.length}</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-md text-label-md font-semibold">Capacity</span>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">groups</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg text-on-surface">{event?.capacity ?? '—'}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              className={`px-4 py-2 rounded-lg font-label-lg text-label-lg transition-all flex items-center gap-2 ${
                tab === 'confirmed' ? 'bg-primary-container text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
              onClick={() => setTab('confirmed')}
            >
              <span>Confirmed</span>
              <span className="bg-surface-container-lowest/30 px-2 py-0.5 rounded-full font-label-sm text-label-sm">{confirmed.length}</span>
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-label-lg text-label-lg transition-all flex items-center gap-2 ${
                tab === 'waitlist' ? 'bg-primary-container text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
              onClick={() => setTab('waitlist')}
            >
              <span>Waitlist</span>
              <span className="bg-surface-container-low px-2 py-0.5 rounded-full font-label-sm text-label-sm">{waitlisted.length}</span>
            </button>
          </div>
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              className="w-full h-10 pl-9 pr-4 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Filter by name..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
                <th className="py-3 px-4 font-semibold">Employee</th>
                <th className="py-3 px-4 font-semibold">Registered On</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm text-on-surface">
              {rows.length === 0 && (
                <tr>
                  <td className="py-6 px-4 text-on-surface-variant" colSpan={3}>
                    No {tab === 'confirmed' ? 'confirmed attendees' : 'waitlisted registrants'} yet.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold shrink-0">
                        {initials(r.users?.name)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-label-md text-on-surface font-semibold truncate">{r.users?.name}</span>
                        <span className="font-label-sm text-label-sm text-outline truncate">{r.users?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-on-surface-variant">
                    {new Date(r.registration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold ${
                        r.status === 'registered' ? 'bg-secondary-container text-on-secondary-fixed' : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {r.status === 'registered' ? 'Confirmed' : 'Waitlisted'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
