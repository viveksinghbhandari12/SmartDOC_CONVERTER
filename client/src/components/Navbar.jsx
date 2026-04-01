import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-slate-800 text-white'
      : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
  }`

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">
            SD
          </span>
          <span>SmartDoc AI</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/upload" className={linkClass}>
                Upload
              </NavLink>
              <span className="hidden text-slate-600 sm:inline">|</span>
              <span className="max-w-[140px] truncate text-xs text-slate-500 sm:max-w-[200px]">
                {user.email}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
