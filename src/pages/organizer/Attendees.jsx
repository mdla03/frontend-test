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
  const [search, setSearch] = useState('')

  useEffect(() => {
    api
      .get('/events', { params: { organizer: 'me' } })
      .then((res) => {
        const events = res.data.data ?? []
        setMyEvents(events)
        // Reached from the sidebar tab, which has no event in the URL yet.
        if (!id && events[0]) navigate(`/organizer/events/${events[0].id}/attendees`, { replace: true })
      })
      .catch(() => {})
  }, [id, navigate])

  useEffect(() => {
    if (!id) return
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
  const rows = confirmed.filter((r) => !search || r.users?.name?.toLowerCase().includes(search.toLowerCase()))
  const fillPct = event?.capacity ? Math.min(100, Math.round((confirmed.length / event.capacity) * 100)) : null

  if (!id) {
    return (
      <div className="font-body-md text-body-md text-on-surface-variant">
        {myEvents.length === 0 ? 'Create an event first to manage attendees.' : 'Loading…'}
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface tracking-tight">Attendees</h1>
          <div className="dropdown">
            <div
              tabIndex={0}
              role="button"
              className="flex items-center gap-2 max-w-xs bg-surface-container-low hover:bg-surface-container pl-4 pr-3 py-2 rounded-xl shadow-sm cursor-pointer transition-colors"
            >
              <span className="font-label-lg text-label-lg text-primary font-semibold truncate">{event?.title ?? 'Select an event'}</span>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0">expand_more</span>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu z-50 mt-2 w-[min(20rem,calc(100vw-3rem))] max-h-96 overflow-y-auto flex-nowrap rounded-xl bg-surface-container-lowest shadow-lg p-2 gap-1"
            >
              {myEvents.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => {
                      document.activeElement?.blur()
                      navigate(`/organizer/events/${e.id}/attendees`)
                    }}
                    className={`flex items-start gap-2 rounded-lg ${e.id === id ? 'bg-secondary-container text-on-secondary-container' : ''}`}
                  >
                    <span className={`material-symbols-outlined text-[18px] shrink-0 ${e.id === id ? 'text-primary' : 'text-transparent'}`}>
                      check
                    </span>
                    <span className="flex flex-col min-w-0 text-left">
                      <span className="font-label-md text-label-md text-on-surface font-semibold truncate">{e.title}</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {e.start_date
                          ? new Date(e.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Date TBA'}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
              {myEvents.length === 0 && (
                <li className="px-3 py-2 font-label-sm text-label-sm text-on-surface-variant">No events yet.</li>
              )}
            </ul>
          </div>
        </div>
        {event?.address && (
          <span className="font-label-sm text-label-sm text-on-surface-variant flex items-start gap-1 min-w-0">
            <span className="material-symbols-outlined text-[15px] text-primary shrink-0">
              {event.modality === 'virtual' ? 'videocam' : 'location_on'}
            </span>
            {/* A meeting URL is one unbreakable token — break-all keeps it inside the page. */}
            <span className="break-all">{event.address}</span>
          </span>
        )}
      </div>

      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm max-w-sm">
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

      <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Confirmed Attendees</h2>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant">
              {confirmed.length}
            </span>
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
                <th className="py-3 px-4 font-semibold">Employee Details</th>
                <th className="py-3 px-4 font-semibold">Registered On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm text-on-surface">
              {rows.length === 0 && (
                <tr>
                  <td className="py-6 px-4 text-on-surface-variant" colSpan={2}>
                    No attendees registered yet.
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
