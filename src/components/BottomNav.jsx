import { NavLink } from 'react-router-dom'

const links = [
  { to: '/events', label: 'Events', icon: 'event' },
  { to: '/map', label: 'Map', icon: 'map' },
  { to: '/rewards', label: 'Impact', icon: 'volunteer_activism' },
]

export default function BottomNav() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.04)] px-4 py-2">
      <nav className="flex items-center justify-around">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 font-label-sm text-label-sm ${
                isActive ? 'text-primary font-label-md' : 'text-on-surface-variant'
              }`
            }
          >
            <span className="material-symbols-outlined text-[22px]">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
