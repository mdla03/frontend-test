import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../lib/api'

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
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">{event.title}</h1>
            <p className="mt-3 font-body-md text-body-md text-on-surface-variant leading-relaxed">{event.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 bg-surface-container-lowest rounded-xl p-4 shadow-sm">
              <span className="material-symbols-outlined text-primary">calendar_today</span>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Date & time</p>
                <p className="font-label-lg text-label-lg text-on-surface">
                  {event.start_date}
                  {event.start_time ? ` · ${event.start_time}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-lowest rounded-xl p-4 shadow-sm">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Venue</p>
                <p className="font-label-lg text-label-lg text-on-surface">{event.address ?? 'TBA'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-lowest rounded-xl p-4 shadow-sm">
              <span className="material-symbols-outlined text-primary">groups</span>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Slots</p>
                <p className="font-label-lg text-label-lg text-on-surface">
                  {event.capacity ? `${Math.max(0, event.capacity - (event.taken ?? 0))} of ${event.capacity} left` : 'Open'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-lowest rounded-xl p-4 shadow-sm">
              <span className="material-symbols-outlined text-primary">devices</span>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Modality</p>
                <p className="font-label-lg text-label-lg text-on-surface capitalize">{event.modality ?? 'In-person'}</p>
              </div>
            </div>
          </div>

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
