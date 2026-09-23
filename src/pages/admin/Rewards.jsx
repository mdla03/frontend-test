import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

const MEDAL = ['bg-primary text-on-primary', 'bg-surface-container-highest text-on-surface', 'bg-secondary-container text-on-secondary-container']

function initials(name) {
  return (name ?? '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Rewards() {
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    api
      .get('/leaderboard')
      .then((res) => setLeaderboard(res.data.data ?? []))
      .catch(() => {})
  }, [])

  const totalHours = leaderboard.reduce((sum, r) => sum + Number(r.total_amount), 0)

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto w-full">
      <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm p-8 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-primary font-label-sm uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px]">military_tech</span>
          <span>Bayanihan Recognition &amp; Growth Framework</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface tracking-tight">
          Rewards Leaderboard
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Company-wide ranking by granted reward hours and recognitions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">Employees Recognized</span>
          <span className="font-headline-lg text-headline-lg text-on-surface font-bold block mt-1">{leaderboard.length}</span>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">Total Hours Granted</span>
          <span className="font-headline-lg text-headline-lg text-on-surface font-bold block mt-1">{totalHours}</span>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
                <th className="py-3 px-5">Rank</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4 text-right">Total Hours</th>
              </tr>
            </thead>
            <tbody className="text-body-sm font-body-sm text-on-surface">
              {leaderboard.length === 0 && (
                <tr>
                  <td className="py-6 px-5 text-on-surface-variant" colSpan={3}>
                    No rewards granted yet.
                  </td>
                </tr>
              )}
              {leaderboard.map((row, i) => (
                <tr key={row.user_id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3.5 px-5">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-label-sm text-label-sm font-bold ${
                        MEDAL[i] ?? 'bg-surface-container text-on-surface'
                      }`}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-label-sm shrink-0">
                        {initials(row.name)}
                      </div>
                      <span className="font-label-md text-label-md text-on-surface font-semibold">{row.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-label-lg text-label-lg font-bold text-on-surface">
                    {row.total_amount}
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
