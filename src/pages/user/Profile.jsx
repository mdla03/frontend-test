import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../lib/api'

function initials(name) {
  return (name ?? '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const STATUS_COPY = {
  none: null,
  pending: { text: 'Your organizer application is pending admin approval.', tone: 'bg-secondary-container/50 text-on-secondary-container' },
  approved: { text: 'Your organizer application was approved.', tone: 'bg-primary-container/50 text-on-primary-container' },
  rejected: { text: 'Your organizer application was rejected. You can re-apply below.', tone: 'bg-error-container/50 text-on-error-container' },
}

const REGISTRATION_BADGE = {
  registered: 'bg-secondary-container text-on-secondary-fixed',
  waitlisted: 'bg-surface-container text-on-surface-variant',
  rejected: 'bg-error-container/50 text-on-error-container',
  cancelled: 'bg-surface-container text-on-surface-variant',
}

export default function Profile() {
  const { user, login } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [rewards, setRewards] = useState([])
  const [rewardTotal, setRewardTotal] = useState(0)

  useEffect(() => {
    api
      .get('/me/registrations')
      .then((res) => setRegistrations(res.data.data ?? []))
      .catch(() => {})

    api
      .get('/me/rewards')
      .then((res) => {
        setRewardTotal(res.data.data.total ?? 0)
        setRewards(res.data.data.rewards ?? [])
      })
      .catch(() => {})
  }, [])

  const seenKey = user ? `organizer-approval-seen:${user.id}` : null
  const [approvalSeen] = useState(() => (seenKey ? localStorage.getItem(seenKey) === '1' : false))

  useEffect(() => {
    if (!seenKey) return
    if (user.organizer_status === 'approved') localStorage.setItem(seenKey, '1')
    else localStorage.removeItem(seenKey)
  }, [seenKey, user?.organizer_status])

  async function handleApply() {
    setSubmitting(true)
    setError(null)
    try {
      const { data } = await api.post('/me/apply-organizer')
      login(localStorage.getItem('token'), data.data)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to submit application.')
    } finally {
      setSubmitting(false)
    }
  }

  const status = STATUS_COPY[user?.organizer_status ?? 'none']
  const canApply = user?.role === 'user' && (!user?.organizer_status || user.organizer_status === 'none' || user.organizer_status === 'rejected')
  // The approval notice is a one-time announcement; a demotion resets the flag
  // so a future approval announces itself again.
  const showOrganizerCard = user?.role === 'user' || (user?.organizer_status === 'approved' && !approvalSeen)

  return (
    <div className="w-full max-w-3xl mx-auto px-6 lg:px-12 py-10 space-y-6">
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xl font-bold shrink-0">
          {initials(user?.name)}
        </div>
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">{user?.name}</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{user?.email}</p>
          <span className="inline-block mt-1 font-label-sm text-label-sm text-primary capitalize bg-secondary-container/40 px-2.5 py-0.5 rounded-full">
            {user?.role}
          </span>
        </div>
      </div>

      <div className={`bg-surface-container-lowest rounded-xl shadow-sm p-6 space-y-4 ${showOrganizerCard ? '' : 'hidden'}`}>
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Become an Organizer</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Apply to create and manage your own events. An admin will review your request.
          </p>
        </div>

        {status && (
          <div className={`p-3 rounded-lg font-label-md text-label-md ${status.tone}`}>{status.text}</div>
        )}

        {error && <div className="p-3 rounded-lg font-label-md text-label-md bg-error-container/50 text-on-error-container">{error}</div>}

        {canApply && (
          <button
            type="button"
            onClick={handleApply}
            disabled={submitting}
            className="bg-primary hover:bg-surface-tint text-on-primary py-2.5 px-5 rounded-lg font-label-md text-label-md transition duration-200 shadow-sm disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Apply as Organizer'}
          </button>
        )}
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Registered Sessions</h2>
          <span className="font-label-sm text-label-sm text-on-surface-variant">{registrations.length} total</span>
        </div>

        {registrations.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">You haven&apos;t joined any events yet.</p>
        ) : (
          <ul className="divide-y divide-surface-container-low">
            {registrations.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-on-surface font-semibold truncate">{r.events?.title}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {r.events?.start_date
                      ? new Date(r.events.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Date TBA'}
                  </span>
                </div>
                <span
                  className={`shrink-0 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold capitalize ${
                    REGISTRATION_BADGE[r.status] ?? REGISTRATION_BADGE.cancelled
                  }`}
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Rewards</h2>
          <span className="font-headline-sm text-headline-sm text-primary font-bold">{rewardTotal} pts</span>
        </div>

        {rewards.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">No rewards earned yet. Join and attend events to collect points.</p>
        ) : (
          <ul className="divide-y divide-surface-container-low">
            {rewards.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-on-surface font-semibold truncate capitalize">{r.type}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                    {r.events?.title ?? 'General'}
                    {r.status === 'pending' && ' · Pending'}
                  </span>
                </div>
                <span className="shrink-0 font-label-md text-label-md text-primary font-bold">+{r.amount}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
