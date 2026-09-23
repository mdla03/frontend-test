import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

export default function Overview() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api
      .get('/admin/analytics')
      .then((res) => setData(res.data.data))
      .catch(() => {})
  }, [])

  const months = data?.registrationsByMonth ?? []
  const maxCount = Math.max(1, ...months.map((m) => Number(m.count)))

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-primary">
          <span className="material-symbols-outlined text-[14px]">corporate_fare</span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Governance &amp; Pulse Monitor</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface tracking-tight">
          Company-wide Engagement &amp; Admin Overview
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Monitoring event volume and registrations across Manulife Philippines.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">event_available</span>
            </div>
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">Total Events</span>
          </div>
          <span className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-3 block">
            {data?.totalEvents ?? '—'}
          </span>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            </div>
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">Total Registrations</span>
          </div>
          <span className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-3 block">
            {data?.totalRegistrations ?? '—'}
          </span>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Monthly Registrations</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Registration volume per month, company-wide.</p>
        </div>

        {months.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant py-8 text-center">No registration data yet.</p>
        ) : (
          <div className="flex items-end gap-3 h-48 px-2">
            {months.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">{m.count}</span>
                <div
                  className="w-full max-w-10 bg-primary-container rounded-t-md hover:bg-primary transition-colors"
                  style={{ height: `${Math.max(4, (Number(m.count) / maxCount) * 140)}px` }}
                />
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {new Date(m.month).toLocaleDateString('en-US', { month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
