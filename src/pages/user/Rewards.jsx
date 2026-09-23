import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../lib/api'

const GOAL_HOURS = 16

const BADGE_DEFS = [
  { type: 'First Workshop', icon: 'savings', iconWrap: 'bg-secondary-container text-on-secondary-container', description: 'Completed your first Bayanihan workshop session.' },
  { type: 'Social Butterfly', icon: 'flutter_dash', iconWrap: 'bg-surface-container-high text-primary', description: 'Met colleagues across multiple departments.' },
  { type: 'Lifelong Learner', icon: 'local_library', iconWrap: 'bg-primary-fixed text-on-primary-fixed', description: 'Completed 20+ hours of life skills & wellness workshops.' },
  { type: 'Icebreaker Pro', icon: 'celebration', iconWrap: 'bg-surface-container text-primary', description: 'Joined 5 social mixers, trivia, or game nights.' },
]

function initials(name) {
  return (name ?? '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Rewards() {
  const { user } = useAuth()
  const [rewards, setRewards] = useState([])
  const [total, setTotal] = useState(0)
  const [registrations, setRegistrations] = useState([])

  useEffect(() => {
    api
      .get('/me/rewards')
      .then((res) => {
        setTotal(res.data.data.total ?? 0)
        setRewards(res.data.data.rewards ?? [])
      })
      .catch(() => {})

    api
      .get('/me/registrations')
      .then((res) => setRegistrations(res.data.data ?? []))
      .catch(() => {})
  }, [])

  const earnedBadgeTypes = new Set(rewards.map((r) => r.type))
  const rewardsByEvent = new Map(rewards.map((r) => [r.event_id, r.amount]))
  const activeRegistrations = registrations.filter((r) => r.status !== 'cancelled')
  const progressPct = Math.min(100, Math.round((total / GOAL_HOURS) * 100))

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-8 flex flex-col gap-10">
      <section className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm p-6 sm:p-8 lg:p-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-primary-container/10 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-headline-lg text-headline-lg shadow-sm ring-4 ring-surface-container-low">
                {initials(user?.name)}
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-primary text-on-primary shadow-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">{user?.name}</h1>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant flex flex-wrap items-center gap-2">
                <span className="capitalize">{user?.role}</span>
                <span className="text-outline-variant">•</span>
                <span>{user?.email}</span>
              </p>
            </div>
          </div>

          <div className="w-full lg:w-96 bg-surface-container-low rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface">Quarterly Hours Goal</span>
              <span className="font-label-sm text-label-sm text-primary font-semibold">{Math.max(0, GOAL_HOURS - total)} hrs to go</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface">{total} / {GOAL_HOURS} hrs</span>
              <span className="font-label-lg text-label-lg text-on-surface font-bold">{progressPct}%</span>
            </div>
            <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="bg-primary-container h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low">
            <div className="p-3 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">schedule</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md text-on-surface leading-tight">{total}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Learning & Social Hours</span>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low">
            <div className="p-3 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">event_available</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md text-on-surface leading-tight">{activeRegistrations.length}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Events Registered</span>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-primary font-label-md text-label-md">
              <span className="material-symbols-outlined text-[20px]">military_tech</span>
              <span className="uppercase tracking-wider">Social & Skill Credentials</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Badges Earned & Milestones</h2>
          </div>
          <div className="flex items-center gap-2 font-label-md text-label-md text-tertiary">
            <span className="font-bold text-primary">{earnedBadgeTypes.size}</span> Earned
            <span>•</span>
            <span className="font-bold text-on-surface">{BADGE_DEFS.length - earnedBadgeTypes.size}</span> Locked
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {BADGE_DEFS.map((badge) => {
            const earned = earnedBadgeTypes.has(badge.type)
            return (
              <div
                key={badge.type}
                className={`p-6 rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-4 transition-all hover:shadow-md ${earned ? '' : 'opacity-75 hover:opacity-100'}`}
              >
                <div className={`w-14 h-14 shrink-0 rounded-xl flex items-center justify-center shadow-sm ${earned ? badge.iconWrap : 'bg-surface-container-high text-tertiary'}`}>
                  <span className="material-symbols-outlined text-[30px]">{badge.icon}</span>
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-headline-sm text-headline-sm text-on-surface truncate">{badge.type}</h4>
                    {earned ? (
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm shrink-0">Earned</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-tertiary font-label-sm text-label-sm flex items-center gap-1 shrink-0">
                        <span className="material-symbols-outlined text-[12px]">lock</span> Locked
                      </span>
                    )}
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{badge.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary font-label-md text-label-md">
            <span className="material-symbols-outlined text-[20px]">history_edu</span>
            <span className="uppercase tracking-wider">Attendance Log</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface">My Registered Sessions</h2>
        </div>

        <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface font-label-md text-label-md">
                <th className="py-4 px-5">Session Title</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4 text-center">Hours</th>
                <th className="py-4 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md">
              {activeRegistrations.length === 0 && (
                <tr>
                  <td className="py-6 px-5 text-on-surface-variant font-body-sm text-body-sm" colSpan={5}>
                    No registrations yet — browse events to get started.
                  </td>
                </tr>
              )}
              {activeRegistrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-5">
                    <span className="font-semibold text-on-surface">{reg.events?.title}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                      {reg.events?.event_category ?? '—'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-on-surface-variant font-body-sm text-body-sm">{reg.events?.start_date}</td>
                  <td className="py-4 px-4 text-center font-semibold text-on-surface">
                    {rewardsByEvent.get(reg.event_id) ?? '—'}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <span className="inline-flex items-center gap-1 text-primary font-label-md text-label-md capitalize">
                      <span className="material-symbols-outlined text-[16px]">
                        {reg.status === 'registered' ? 'check_circle' : 'hourglass_top'}
                      </span>
                      {reg.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
