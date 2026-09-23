import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar({ collapsed }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-4 lg:px-10 gap-4 transition-[left] duration-200 ${
        collapsed ? 'lg:left-20' : 'lg:left-72'
      }`}
    >
      <div className="flex items-center gap-4 ml-auto">
        <div className="dropdown dropdown-end pl-2">
          <div tabIndex={0} role="button" className="flex items-center gap-2 cursor-pointer">
            <div className="flex flex-col text-right">
              <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight">{user?.name}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium capitalize">{user?.role}</span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">expand_more</span>
          </div>
          <ul tabIndex={0} className="dropdown-content menu z-50 mt-2 w-56 rounded-xl bg-surface-container-lowest shadow-lg p-2 gap-1">
            {user?.role === 'organizer' && (
              <>
                <li>
                  <NavLink to="/profile" className="font-label-md text-label-md text-on-surface rounded-lg">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    Profile
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/events" className="font-label-md text-label-md text-on-surface rounded-lg">
                    <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                    Switch to User Portal
                  </NavLink>
                </li>
              </>
            )}
            <li>
              <button type="button" onClick={handleLogout} className="font-label-md text-label-md text-error rounded-lg">
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Log out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}
