import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

const FILTERS = [
  { key: 'all', label: 'All Events' },
  { key: 'with', label: 'With Rewards' },
  { key: 'without', label: 'No Rewards' },
]

export default function Rewards() {
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api
      .get('/events')
      .then((res) => setEvents(res.data.data ?? []))
      .catch(() => {})
  }, [])

  // reward_type is freeform and often saved as an empty string, not null.
  const rewardOf = (event) => event.reward_type?.trim() || 'None'

  const withRewards = events.filter((e) => rewardOf(e) !== 'None').length
  const counts = { all: events.length, with: withRewards, without: events.length - withRewards }

  const filtered = events.filter((e) => {
    const hasReward = rewardOf(e) !== 'None'
    const matchesFilter = filter === 'all' || (filter === 'with') === hasReward
    return matchesFilter && (!search || e.title?.toLowerCase().includes(search.toLowerCase()))
  })

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto w-full">
      <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm p-8 flex flex-col gap-1">
        <h1 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface tracking-tight">Rewards</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Recognition type attached to each event created on the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">Total Events</span>
          <span className="font-headline-lg text-headline-lg text-on-surface font-bold block mt-1">{events.length}</span>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">Events with Rewards</span>
          <span className="font-headline-lg text-headline-lg text-on-surface font-bold block mt-1">{withRewards}</span>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg font-label-md text-label-md whitespace-nowrap transition-colors flex items-center gap-2 ${
                  filter === f.key ? 'bg-primary-container text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm ${
                    filter === f.key ? 'bg-surface-container-lowest/30' : 'bg-surface-container-low'
                  }`}
                >
                  {counts[f.key]}
                </span>
              </button>
            ))}
          </div>
          <div className="relative w-full lg:max-w-xs lg:ml-auto">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search events..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
                <th className="py-3 px-5">Created Events</th>
                <th className="py-3 px-4 text-right">Rewards</th>
              </tr>
            </thead>
            <tbody className="text-body-sm font-body-sm text-on-surface">
              {filtered.length === 0 && (
                <tr>
                  <td className="py-6 px-5 text-on-surface-variant" colSpan={2}>
                    {events.length === 0 ? 'No events yet.' : 'No events match this filter.'}
                  </td>
                </tr>
              )}
              {filtered.map((event) => {
                const reward = rewardOf(event)
                return (
                  <tr key={event.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-label-md text-on-surface font-semibold truncate">{event.title}</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {event.event_category ?? 'Uncategorised'}
                          {event.start_date
                            ? ` · ${new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                            : ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold ${
                          reward === 'None' ? 'bg-surface-container text-on-surface-variant' : 'bg-secondary-container text-on-secondary-container'
                        }`}
                      >
                        {reward}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
