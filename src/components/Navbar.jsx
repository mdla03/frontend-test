import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar({ primaryAction }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-4 lg:px-10 gap-4">
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">search</span>
          <input
            className="w-full h-10 pl-10 pr-4 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Search…"
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {primaryAction}

        <button
          aria-label="Notifications"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors relative"
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest" />
        </button>

        <div className="flex items-center gap-2 pl-2">
          <div className="flex flex-col text-right">
            <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight">{user?.name}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium capitalize">{user?.role}</span>
          </div>
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
            title="Log out"
            onClick={handleLogout}
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
