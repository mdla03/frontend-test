import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

const TABS = [
  { key: 'pending', label: 'Pending Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'changes_requested', label: 'Needs Revision' },
]

export default function EventApprovals() {
  const [events, setEvents] = useState([])
  const [users, setUsers] = useState([])
  const [tab, setTab] = useState('pending')
  const [busyId, setBusyId] = useState(null)

  function loadEvents() {
    api
      .get('/events')
      .then((res) => setEvents(res.data.data ?? []))
      .catch(() => {})
  }

  useEffect(() => {
    loadEvents()
    api
      .get('/admin/users')
      .then((res) => setUsers(res.data.data ?? []))
      .catch(() => {})
  }, [])

  const organizerName = (id) => users.find((u) => u.id === id)?.name ?? 'Unknown organizer'

  async function setStatus(id, approval_status) {
    setBusyId(id)
    try {
      await api.patch(`/events/${id}/status`, { approval_status })
      loadEvents()
    } catch {
      // no-op — event stays in current list, admin can retry
    } finally {
      setBusyId(null)
    }
  }

  const filtered = events.filter((e) => e.approval_status === tab)

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col gap-1">
        <span className="px-3 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider font-semibold w-fit">
          Governance Operations
        </span>
        <h1 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface tracking-tight">
          Event Approvals
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Review events submitted by organizers before they appear in the employee discovery feed.
        </p>
      </div>

      <div className="bg-surface-container-lowest p-2 rounded-xl shadow-sm flex items-center gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`px-4 py-2 rounded-lg font-label-md text-label-md whitespace-nowrap transition-all flex items-center gap-2 ${
              tab === t.key ? 'bg-primary-container text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
            onClick={() => setTab(t.key)}
          >
            <span>{t.label}</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs">
              {events.filter((e) => e.approval_status === t.key).length}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filtered.length === 0 && (
          <p className="font-body-sm text-body-sm text-on-surface-variant py-8 text-center bg-surface-container-lowest rounded-xl shadow-sm">
            No events in this queue.
          </p>
        )}

        {filtered.map((event) => (
          <div key={event.id} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex flex-wrap items-center gap-2">
                {event.event_category && (
                  <span className="px-3 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm font-semibold">
                    {event.event_category}
                  </span>
                )}
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Submitted{' '}
                  {event.created_at
                    ? new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>

            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">{event.title}</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Organized by <strong className="text-on-surface">{organizerName(event.organizer_id)}</strong>
              </p>
              {event.description && (
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 line-clamp-2">{event.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-container-low p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">calendar_clock</span>
                <span className="font-label-md text-label-md text-on-surface truncate">
                  {event.start_date}
                  {event.start_time ? ` • ${event.start_time}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">location_on</span>
                <span className="font-label-md text-label-md text-on-surface truncate">{event.address ?? 'TBA'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">groups</span>
                <span className="font-label-md text-label-md text-on-surface">{event.capacity ?? '—'} capacity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">devices</span>
                <span className="font-label-md text-label-md text-on-surface capitalize">{event.modality ?? '—'}</span>
              </div>
            </div>

            {tab === 'pending' && (
              <div className="flex items-center justify-end gap-2 flex-wrap">
                <button
                  className="px-4 py-2 rounded-lg text-error hover:bg-error-container hover:text-on-error-container font-label-md text-label-md transition-colors disabled:opacity-50"
                  disabled={busyId === event.id}
                  onClick={() => setStatus(event.id, 'rejected')}
                >
                  Reject
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors disabled:opacity-50"
                  disabled={busyId === event.id}
                  onClick={() => setStatus(event.id, 'changes_requested')}
                >
                  Request Changes
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-secondary transition-all flex items-center gap-2 disabled:opacity-50"
                  disabled={busyId === event.id}
                  onClick={() => setStatus(event.id, 'approved')}
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Approve Event</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
