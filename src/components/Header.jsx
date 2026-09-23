import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navLinks = [
  { to: '/events', label: 'Events' },
  { to: '/map', label: 'Map' },
  { to: '/rewards', label: 'Impact' },
]

function initials(name) {
  return (name ?? '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Header() {
  const { user } = useAuth()

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-on-primary" fill="none" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 18L10 6H14L8 18H4Z" fill="currentColor" />
              <path d="M12 18L18 6H22L16 18H12Z" fill="currentColor" fillOpacity="0.85" />
              <circle cx="20" cy="18" fill="#8BF5B1" r="3" />
            </svg>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface leading-tight">Bayanihan</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Manulife Philippines CSR
            </span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1 bg-surface-container-low px-2 py-1.5 rounded-xl">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-4 py-2 transition-colors font-label-md text-label-md rounded-xl ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container font-label-lg'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="relative p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
          </button>
          <div className="flex items-center gap-3 pl-2">
            <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold">
              {initials(user?.name)}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="font-label-md text-label-md text-on-surface leading-tight">{user?.name}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant capitalize">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
