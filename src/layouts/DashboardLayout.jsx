import { NavLink, Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout({ subtitle, badgeLabel, badgeIcon, links, primaryAction }) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar title="Bayanihan" subtitle={subtitle} badgeLabel={badgeLabel} badgeIcon={badgeIcon} links={links} />

      <nav className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-surface-container-lowest shadow-sm flex items-center gap-1 overflow-x-auto px-2 py-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-sm text-label-sm whitespace-nowrap ${
                isActive ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant'
              }`
            }
          >
            <span className="material-symbols-outlined text-[16px]">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="lg:pl-72 flex flex-col min-h-screen">
        <Navbar primaryAction={primaryAction} />
        <main className="w-full pt-28 lg:pt-24 flex-1 bg-surface px-4 lg:px-10 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
