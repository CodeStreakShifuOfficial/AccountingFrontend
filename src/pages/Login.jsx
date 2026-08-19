import { useState } from 'react'
import Logo from '../assets/logo.png'
import { login } from "../api/auth";

export default function Login({ onForgotPassword, onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      setSubmitted(false)
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      const data = await login(username, password)

      const user = {
        id: data.id,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        status: data.status,
      }

      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem('token', data.token)
      storage.setItem('user', JSON.stringify(user))

      setSubmitted(true)

      if (onLoginSuccess) {
        onLoginSuccess(user)
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Invalid username or password.'

      setError(message)
      setSubmitted(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 text-slate-100 sm:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_18%),radial-gradient(circle_at_bottom_right,_rgba(148,163,184,0.12),_transparent_20%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-500/15 via-slate-950 to-transparent blur-3xl" />

      <div className="relative mx-auto w-full max-w-6xl">
        <div className="grid gap-10 xl:grid-cols-[1.05fr_0.95fr] items-center">
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl transition duration-500 ease-out sm:p-10">
            <span className="inline-flex items-center gap-3 rounded-full bg-slate-800/90 px-4 py-2 text-sm font-semibold uppercase tracking-[0.32em] text-sky-300">
              Amarillo Accounting
            </span>
            <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              A premium business hub for accounting teams
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              Sign in to manage workflows, review financial reports, and collaborate securely across clients and teams.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/5 bg-slate-950/80 p-6 shadow-sm shadow-slate-950/10">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Trusted by</p>
                <p className="mt-3 text-2xl font-semibold text-white">100+ Business Owners</p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-slate-950/80 p-6 shadow-sm shadow-slate-950/10">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Secure</p>
                <p className="mt-3 text-2xl font-semibold text-white">SSO-ready</p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-slate-950/80 p-6 shadow-sm shadow-slate-950/10">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Precision</p>
                <p className="mt-3 text-2xl font-semibold text-white">Automated reports</p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-slate-950/80 p-6 shadow-sm shadow-slate-950/10">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Support</p>
                <p className="mt-3 text-2xl font-semibold text-white">24/7 access</p>
              </div>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-slate-700/80 bg-slate-950/95 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl transition duration-500 ease-out sm:p-10">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900/90 ring-1 ring-slate-700/80">
                  <img src={Logo} alt="Amarillo Accounting logo" className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">
                    Amarillo Accounting
                  </p>
                </div>
              </div>
              <div className="rounded-3xl bg-slate-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                Enterprise ready
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-slate-800/80 bg-slate-900/80 p-6 shadow-inner shadow-slate-950/20">
              <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
                <p className="font-medium text-slate-200">Welcome back</p>
                <p className="rounded-full bg-slate-800/90 px-3 py-1 text-slate-400">Secure access</p>
              </div>
              <p className="mt-4 text-base leading-7 text-slate-400">
                Enter your credentials to continue to your accounting dashboard and review the latest financial insights.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-300">
                  Username  
                </label>
                <div className="relative mt-3">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-slate-400">
                      <path d="M3 6.75C3 5.23122 4.23122 4 5.75 4H18.25C19.7688 4 21 5.23122 21 6.75V17.25C21 18.7688 19.7688 20 18.25 20H5.75C4.23122 20 3 18.7688 3 17.25V6.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M3 7.5L12 13.5L21 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="Username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-5 py-4 pl-14 text-white placeholder:text-slate-500 shadow-sm shadow-slate-950/20 transition duration-300 ease-out focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    placeholder="Username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative mt-3">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-slate-400">
                      <path d="M16 11V8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-5 py-4 pl-14 pr-14 text-white placeholder:text-slate-500 shadow-sm shadow-slate-950/20 transition duration-300 ease-out focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-4 flex items-center text-slate-400 transition hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                        <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42M9.88 5.11A10.6 10.6 0 0 1 12 4.9C17.05 4.9 20.5 12 20.5 12a17.7 17.7 0 0 1-3.17 4.13M6.61 6.61C4.37 8.17 3.5 12 3.5 12S6.95 19.1 12 19.1a9.5 9.5 0 0 0 3.12-.53" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                        <path d="M2.75 12S6.2 4.9 12 4.9 21.25 12 21.25 12 17.8 19.1 12 19.1 2.75 12 2.75 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-400">
                <label className="inline-flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="font-medium text-sky-300 transition hover:text-sky-200"
                  aria-label="Go to forgot password page"
                >
                  Forgot password?
                </button>
              </div>

              {error ? (
                <p role="alert" aria-live="polite" className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200 shadow-sm shadow-rose-500/5">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative inline-flex w-full items-center justify-center gap-3 rounded-3xl bg-sky-500 px-5 py-4 text-sm font-semibold text-slate-950 transition duration-300 hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <svg className="h-5 w-5 animate-spin text-slate-950" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                ) : null}
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {submitted ? (
              <div className="mt-7 rounded-3xl border border-slate-700 bg-slate-900/90 p-5 text-sm text-slate-200 shadow-sm shadow-slate-950/20">
                <p className="font-medium text-white">Login submitted successfully!</p>
                <p className="mt-2 text-slate-400">
                  Username: <span className="text-slate-100">{username}</span>
                </p>
              </div>
            ) : null}

            <div className="mt-8 rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 text-sm text-slate-400 shadow-inner shadow-slate-950/10">
              <p className="font-medium text-slate-200">Need access for your accounting team?</p>
              <button type="button" className="mt-3 inline-flex items-center gap-2 text-slate-100 transition hover:text-sky-300">
                Request corporate access
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
