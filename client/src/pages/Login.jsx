import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { api, getApiErrorMessage } from '../services/api.js'
import { useAuth } from '../context/useAuth.js'
export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setPending(true)
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      login(data.data.token, data.data.user)
      navigate(from, { replace: true })
    } catch (err) {
      const apiMsg = await getApiErrorMessage(err).catch(() => '')
      setError(
        apiMsg && String(apiMsg).trim()
          ? String(apiMsg).trim()
          : 'Could not log in. Check the API is running and server/.env (MySQL, JWT_SECRET).'
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-2xl font-bold text-white">Log in</h1>
      <p className="mt-2 text-sm text-slate-400">
        No account?{' '}
        <Link to="/register" className="text-brand-400 hover:underline">
          Sign up
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400">
            Email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-brand-500 focus:ring-2"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400">
            Password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-brand-500 focus:ring-2"
          />
        </div>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
