import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../lib/api'

export default function JoinedConfirmation() {
  const { id } = useParams()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)

  useEffect(() => {
    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data.data))
      .catch(() => {})
  }, [id])

  return (
    <div className="max-w-5xl mx-auto w-full px-6 lg:px-12 py-8 flex flex-col gap-10">
      <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
        <Link to="/events" className="hover:text-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Outreach & Events</span>
        </Link>
        <span>/</span>
        <span className="text-primary font-semibold">Registration Confirmation</span>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-container p-8 lg:p-10 text-on-primary shadow-lg">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest/15 backdrop-blur-md flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[32px] text-primary-fixed">check_circle</span>
            </div>
            <div className="flex flex-col gap-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 self-start px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Confirmed Spot • Bayanihan
              </div>
              <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg tracking-tight leading-snug">
                Mabuhay! You&apos;re registered for {event?.title ?? 'this event'}!
              </h1>
              <p className="font-body-md text-body-md text-surface-container-lowest/90 leading-relaxed">
                A confirmation has been recorded for{' '}
                <span className="font-semibold underline decoration-white/30 underline-offset-2">{user?.email}</span>. Your
                learning hours will be logged once the organizer marks you as attended.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap lg:flex-col items-start lg:items-end justify-start gap-3 shrink-0 pt-2 lg:pt-0">
            <div className="px-4 py-2 rounded-xl bg-surface-container-lowest/10 backdrop-blur-sm flex flex-col items-start lg:items-end">
              <span className="font-label-sm text-label-sm text-surface-container-lowest/70 uppercase tracking-wider">
                Attendance Status
              </span>
              <span className="font-label-lg text-label-lg font-bold text-primary-fixed">Reserved</span>
            </div>
          </div>
        </div>
        <div className="absolute -right-12 -bottom-16 w-80 h-80 rounded-full bg-surface-container-lowest/5 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-12 w-64 h-64 rounded-full bg-primary-fixed-dim/10 blur-2xl pointer-events-none" />
      </div>

      <div className="rounded-2xl bg-surface-container-lowest p-8 lg:p-10 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-surface-container-high/60">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Event Summary</span>
          </div>
        </div>

        <div className="pt-4">
          <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-widest">
            {event?.event_category ?? 'Community'}
          </span>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mt-1 leading-tight">
            {event?.title ?? 'Event'}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">{event?.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low">
            <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-primary text-[22px]">schedule</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Date & Schedule</span>
              <span className="font-label-lg text-label-lg text-on-surface font-semibold">{event?.start_date}</span>
              {event?.start_time && <span className="font-body-sm text-body-sm text-on-surface-variant">{event.start_time}</span>}
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low">
            <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-primary text-[22px]">apartment</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Venue & Location</span>
              <span className="font-label-lg text-label-lg text-on-surface font-semibold">{event?.address ?? 'TBA'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-widest">Preparation Routine</span>
          <h3 className="font-headline-md text-headline-md text-on-surface">What to expect on the day</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-surface-container-lowest shadow-sm">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-label-md text-label-md font-bold text-primary">01</span>
              <span className="material-symbols-outlined text-tertiary-container text-[24px]">sentiment_satisfied</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Casual & Welcoming</h4>
            <p className="font-body-md text-body-md text-on-surface-variant">
              No prep needed! Bring an open mind — whether you love the topic or just want to connect, there is a spot for
              everyone.
            </p>
          </div>
          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-surface-container-lowest shadow-sm">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-label-md text-label-md font-bold text-primary">02</span>
              <span className="material-symbols-outlined text-tertiary-container text-[24px]">bakery_dining</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Arrive a Bit Early</h4>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Arrive a few minutes ahead for refreshments and a warm welcome before the session kicks off.
            </p>
          </div>
          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-surface-container-lowest shadow-sm">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-label-md text-label-md font-bold text-primary">03</span>
              <span className="material-symbols-outlined text-tertiary-container text-[24px]">how_to_reg</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Attendance Marked for You</h4>
            <p className="font-body-md text-body-md text-on-surface-variant">
              The organizer will mark your attendance at the event — your learning hours log automatically once they do.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 pb-12 border-t border-surface-container-high/70">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-[20px]">explore</span>
          <span>Browse More Sessions</span>
        </Link>
        <Link
          to="/rewards"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-secondary transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">volunteer_activism</span>
          <span>View My Impact</span>
        </Link>
      </div>
    </div>
  )
}
