import { NavLink } from 'react-router-dom'

export default function Sidebar({ subtitle, links, collapsed, onToggle }) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 hidden lg:flex flex-col justify-between transition-[width] duration-200 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="flex flex-col flex-1 min-h-0">
        <div className={`pt-6 pb-4 ${collapsed ? 'px-4' : 'px-6'}`}>
          <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
            {/* The logo is the only toggle — no separate collapse button. */}
            <button
              type="button"
              onClick={onToggle}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
              className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5 text-on-primary" fill="none" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 18L10 6H14L8 18H4Z" fill="currentColor" />
                <path d="M12 18L18 6H22L16 18H12Z" fill="currentColor" fillOpacity="0.85" />
                <circle cx="20" cy="18" fill="#8BF5B1" r="3" />
              </svg>
            </button>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-headline-sm text-headline-sm text-primary tracking-tight leading-none">Bayanihan</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium tracking-wide uppercase mt-1 truncate">
                  {subtitle}
                </span>
              </div>
            )}
          </div>
        </div>

        <nav className={`flex-1 space-y-1 overflow-y-auto ${collapsed ? 'px-3' : 'px-4'}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              title={link.label}
              className={({ isActive }) =>
                `flex items-center gap-2 py-2.5 rounded-xl font-label-lg text-label-lg transition-colors ${
                  collapsed ? 'justify-center px-2' : 'px-4'
                } ${
                  isActive ? 'bg-primary-container text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">{link.icon}</span>
              {!collapsed && <span className="truncate">{link.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}
