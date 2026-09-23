import { NavLink } from 'react-router-dom'

export default function Sidebar({ title, subtitle, badgeLabel, badgeIcon = 'corporate_fare', links }) {
  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 hidden lg:flex flex-col justify-between">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm shrink-0">
              <svg className="w-5 h-5 text-on-primary" fill="none" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 18L10 6H14L8 18H4Z" fill="currentColor" />
                <path d="M12 18L18 6H22L16 18H12Z" fill="currentColor" fillOpacity="0.85" />
                <circle cx="20" cy="18" fill="#8BF5B1" r="3" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight leading-none">Bayanihan</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium tracking-wide uppercase mt-1">
                {subtitle}
              </span>
            </div>
          </div>
          {badgeLabel && (
            <div className="mt-4 p-2 bg-surface-container-low rounded-xl flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-fixed shrink-0">
                <span className="material-symbols-outlined text-[18px]">{badgeIcon}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-on-surface-variant">{title}</span>
                <span className="font-label-md text-label-md text-on-surface truncate">{badgeLabel}</span>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-lg text-label-lg transition-colors ${
                  isActive ? 'bg-primary-container text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 m-4 rounded-xl bg-surface-container-low flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">volunteer_activism</span>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant">CSR Drive</span>
            <span className="font-label-md text-label-md text-on-surface font-semibold">Bayanihan 2026</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
