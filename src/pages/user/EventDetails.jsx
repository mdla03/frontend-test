import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../lib/api'

// Dates arrive as plain `date` / `time` strings — parse them as local, never
// through `new Date('YYYY-MM-DD')`, which is UTC and shifts the day.
function fmtDate(value) {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function fmtTime(value) {
  if (!value) return null
  const [h, m] = value.split(':').map(Number)
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function InfoCard({ icon, label, children }) {
  return (
    <div className="flex items-center gap-3 bg-surface-container-lowest rounded-xl p-4 shadow-sm">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="font-label-sm text-label-sm text-on-surface-variant">{label}</p>
        <div className="font-label-lg text-label-lg text-on-surface">{children}</div>
      </div>
    </div>
  )
}

export default function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [hoveringLeave, setHoveringLeave] = useState(false)
  const [confirmingLeave, setConfirmingLeave] = useState(false)

  useEffect(() => {
    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data.data))
      .catch(() => setError('Could not load this event — the backend may not be seeded yet.'))

    api
      .get('/me/registrations')
      .then((res) => setRegistered((res.data.data ?? []).some((r) => r.event_id === id && r.status !== 'cancelled')))
      .catch(() => {})
  }, [id])

  async function handleRegister() {
    setSubmitting(true)
    try {
      await api.post(`/events/${id}/register`)
      navigate(`/events/${id}/joined`)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUnregister() {
    setSubmitting(true)
    setError(null)
    try {
      await api.delete(`/events/${id}/register`)
      setRegistered(false)
      setConfirmingLeave(false)
      setHoveringLeave(false)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Could not cancel your registration')
    } finally {
      setSubmitting(false)
    }
  }

  const isVirtual = event?.modality === 'virtual'
  // Virtual events store their meeting link in `address` (see CreateEvent).
  const meetingLink = isVirtual && /^https?:\/\//i.test(event?.address ?? '') ? event.address : null
  const dateLabel =
    event && [fmtDate(event.start_date), event.end_date && event.end_date !== event.start_date ? fmtDate(event.end_date) : null]
      .filter(Boolean)
      .join(' – ')
  const timeLabel =
    event && [fmtTime(event.start_time), fmtTime(event.end_time)].filter(Boolean).join(' – ')

  return (
    <div className="w-full max-w-3xl mx-auto px-6 lg:px-12 py-8">
      <button
        className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface font-label-md text-label-md mb-4"
        onClick={() => navigate(-1)}
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back
      </button>

      <div className="relative w-full h-56 rounded-xl overflow-hidden bg-gradient-to-br from-primary/15 to-primary-container/10 flex items-center justify-center">
        {event?.img_url ? (
          <img
            src={event.img_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <span className="material-symbols-outlined text-[80px] text-primary/25">event</span>
        )}
        {event?.event_category && (
          <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold shadow">
            {event.event_category}
          </span>
        )}
      </div>

      {!event && !error && <p className="mt-6 font-body-md text-body-md text-on-surface-variant">Loading event…</p>}

      {error && (
        <div className="mt-6 bg-error-container text-on-error-container rounded-lg p-4 font-body-sm text-body-sm">{error}</div>
      )}

      {event && (
        <div className="mt-6 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                  event.fee_type === 'paid'
                    ? 'bg-tertiary-container text-on-tertiary-container'
                    : 'bg-secondary-container text-on-secondary-container'
                }`}
              >
                {event.fee_type === 'paid' ? 'Paid event' : 'Free'}
              </span>
              {event.status !== 'submitted' && (
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm capitalize">
                  {event.status}
                </span>
              )}
            </div>
            <h1 className="mt-3 font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">{event.title}</h1>
            <p className="mt-3 font-body-md text-body-md text-on-surface-variant leading-relaxed">{event.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoCard icon="calendar_today" label={event.end_date && event.end_date !== event.start_date ? 'Dates' : 'Date'}>
              {dateLabel || 'TBA'}
            </InfoCard>
            <InfoCard icon="schedule" label="Time">
              {timeLabel || 'TBA'}
            </InfoCard>
            <InfoCard icon={isVirtual ? 'videocam' : 'location_on'} label={isVirtual ? 'Meeting link' : 'Venue'}>
              <span className="block truncate" title={event.address ?? ''}>
                {event.address ?? 'TBA'}
              </span>
            </InfoCard>
            <InfoCard icon="groups" label="Slots">
              {event.capacity ? `${Math.max(0, event.capacity - (event.taken ?? 0))} of ${event.capacity} left` : 'Open'}
            </InfoCard>
            <InfoCard icon="devices" label="Modality">
              <span className="capitalize">{event.modality ?? 'in-person'}</span>
            </InfoCard>
            <InfoCard icon={event.fee_type === 'paid' ? 'payments' : 'volunteer_activism'} label="Fee">
              {event.fee_type === 'paid' ? 'Paid — settle with the organizer' : 'Free to join'}
            </InfoCard>
            {event.reward_type && (
              <InfoCard icon="redeem" label="Reward">
                {event.reward_type}
              </InfoCard>
            )}
          </div>

          {meetingLink && (
            <a
              className="w-full py-3.5 bg-secondary-container text-on-secondary-container rounded-lg font-label-lg text-label-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              href={meetingLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="material-symbols-outlined text-[18px]">videocam</span>
              Join virtual meeting
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            </a>
          )}

          {!registered && (
            <button
              className="w-full py-3.5 bg-primary hover:bg-secondary text-on-primary rounded-lg font-label-lg text-label-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              onClick={handleRegister}
              disabled={submitting}
            >
              <span>{submitting ? 'Registering…' : 'Register Attendance'}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          )}

          {registered && !confirmingLeave && (
            // Hovering turns the status pill into the exit affordance.
            <button
              className={`w-full py-3.5 rounded-lg font-label-lg text-label-lg flex items-center justify-center gap-2 transition-colors ${
                hoveringLeave ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'
              }`}
              onMouseEnter={() => setHoveringLeave(true)}
              onMouseLeave={() => setHoveringLeave(false)}
              onFocus={() => setHoveringLeave(true)}
              onBlur={() => setHoveringLeave(false)}
              onClick={() => setConfirmingLeave(true)}
            >
              <span className="material-symbols-outlined text-[18px]">{hoveringLeave ? 'logout' : 'check_circle'}</span>
              <span>{hoveringLeave ? 'Unregister from this event?' : 'Registered'}</span>
            </button>
          )}

          {registered && confirmingLeave && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="font-body-md text-body-md text-on-surface flex-1">
                Give up your slot for <span className="font-semibold">{event.title}</span>?
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  className="px-4 py-2.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors disabled:opacity-50"
                  onClick={() => setConfirmingLeave(false)}
                  disabled={submitting}
                >
                  Keep my slot
                </button>
                <button
                  className="px-4 py-2.5 rounded-lg bg-error text-on-error font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50"
                  onClick={handleUnregister}
                  disabled={submitting}
                >
                  {submitting ? 'Cancelling…' : 'Yes, unregister'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
