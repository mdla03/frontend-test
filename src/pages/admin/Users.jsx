import { useEffect, useState } from 'react'
import Dropdown from '../../components/Dropdown'
import { api } from '../../lib/api'

const ROLE_OPTIONS = [
  { value: 'user', label: 'Employee' },
  { value: 'organizer', label: 'Organizer' },
  { value: 'admin', label: 'Admin' },
]

const ROLE_BADGE = {
  admin: 'bg-surface-container-highest text-on-surface',
  organizer: 'bg-secondary-container text-on-secondary-container',
  user: 'bg-surface-container text-on-surface',
}

function initials(name) {
  return (name ?? '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [savingId, setSavingId] = useState(null)

  function loadUsers() {
    api
      .get('/admin/users')
      .then((res) => setUsers(res.data.data ?? []))
      .catch(() => {})
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function handleRoleChange(id, role) {
    setSavingId(id)
    try {
      await api.patch(`/admin/users/${id}`, { role })
      loadUsers()
    } catch {
      // no-op — dropdown resets on next load if the change didn't persist
    } finally {
      setSavingId(null)
    }
  }

  async function handleOrganizerDecision(id, approve) {
    setSavingId(id)
    try {
      await api.patch(`/admin/users/${id}`, {
        organizer_status: approve ? 'approved' : 'rejected',
        ...(approve ? { role: 'organizer' } : {}),
      })
      loadUsers()
    } catch {
      // no-op
    } finally {
      setSavingId(null)
    }
  }

  // Derived from `users`, so a role change lands here as soon as loadUsers()
  // resolves — the row leaves or joins the active filter on its own.
  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const term = search.toLowerCase()
    const matchesSearch = !search || u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
    return matchesRole && matchesSearch
  })

  const roleOptions = [
    { value: 'all', label: `All Roles (${users.length})` },
    ...ROLE_OPTIONS.map((o) => ({ ...o, label: `${o.label} (${users.filter((u) => u.role === o.value).length})` })),
  ]

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col gap-1">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold bg-secondary-container/40 px-3 py-0.5 rounded-full w-fit">
          Governance &amp; Access Controls
        </span>
        <h1 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface tracking-tight">
          User &amp; Role Administration
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Manage employee accounts and assign roles across the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">Total Users</span>
          <span className="font-headline-lg text-headline-lg text-on-surface font-bold block mt-1">{users.length}</span>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">Organizers</span>
          <span className="font-headline-lg text-headline-lg text-on-surface font-bold block mt-1">
            {users.filter((u) => u.role === 'organizer').length}
          </span>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">Admins</span>
          <span className="font-headline-lg text-headline-lg text-on-surface font-bold block mt-1">
            {users.filter((u) => u.role === 'admin').length}
          </span>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-xl">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search by name or email..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Dropdown
          label="Filter by role"
          options={roleOptions}
          value={roleFilter}
          onChange={setRoleFilter}
          align="end"
          triggerClassName="h-11 px-4 rounded-xl bg-surface-container-low text-on-surface font-label-md text-label-md shrink-0"
        />
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
                <th className="py-3 px-5">Employee</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Organizer Application</th>
                <th className="py-3 px-4">Joined</th>
              </tr>
            </thead>
            <tbody className="text-body-sm font-body-sm text-on-surface">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-label-md shrink-0">
                        {initials(u.name)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate leading-tight">{u.name}</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant truncate">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Dropdown
                      label={`Role for ${u.name}`}
                      options={ROLE_OPTIONS}
                      value={u.role}
                      disabled={savingId === u.id}
                      onChange={(role) => handleRoleChange(u.id, role)}
                      triggerClassName={`font-label-md text-label-md pl-3 pr-2 py-1 rounded-full font-semibold shadow-sm w-fit ${
                        ROLE_BADGE[u.role] ?? ROLE_BADGE.user
                      }`}
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    {u.organizer_status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={savingId === u.id}
                          onClick={() => handleOrganizerDecision(u.id, true)}
                          className="px-3 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm shadow-sm disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={savingId === u.id}
                          onClick={() => handleOrganizerDecision(u.id, false)}
                          className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm shadow-sm disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="font-label-sm text-label-sm text-on-surface-variant capitalize">{u.organizer_status ?? 'none'}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-on-surface-variant">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="py-6 px-5 text-on-surface-variant" colSpan={4}>
                    No users match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
