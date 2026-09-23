import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout({ subtitle, links }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === '1')

  function toggleSidebar() {
    setCollapsed((c) => {
      localStorage.setItem('sidebar-collapsed', c ? '0' : '1')
      return !c
    })
  }

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar subtitle={subtitle} links={links} collapsed={collapsed} onToggle={toggleSidebar} />

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

      <div className={`flex flex-col min-h-screen transition-[padding] duration-200 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <Navbar collapsed={collapsed} />
        <main className="w-full pt-28 lg:pt-24 flex-1 bg-surface px-4 lg:px-10 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
