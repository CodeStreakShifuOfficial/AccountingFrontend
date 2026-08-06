import { useState } from 'react'
import Logo from '../assets/logo.png'

import{CircleUser} from 'lucide-react'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 shadow-slate-950/20 backdrop-blur-xl transition-shadow duration-300">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900/90">
            <img src={Logo} alt="Amarillo Accounting Logo" className="h-80 w-80 object-contain rounded-4xl" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">Amarillo Accounting</p>
            <p className="text-xs text-slate-400">Secure financial portal</p>
          </div>
        </div>

        <nav className="hidden items-center gap-5 md:flex">
          <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-white">
            <span className="text-sky-300">•</span>
            Overview
          </a>
          
          <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4 text-slate-400">
              <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M7 20V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M17 20V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Clients
          </a>
          <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4 text-slate-400">
              <path d="M12 4v16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Support
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-900/90 text-slate-300 transition duration-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            aria-label="Notifications"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
              <path d="M15 17h5l-1.405-1.405C18.79 14.79 18 13.5 18 12.25V10c0-3.165-2.135-5.832-5-6.708V3a1 1 0 1 0-2 0v.292C8.135 4.168 6 6.835 6 10v2.25c0 1.25-.79 2.54-1.595 3.345L3 17h5m4 0v1a3 3 0 0 0 6 0v-1m-6 0H9"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-900/90 text-slate-300 transition duration-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            aria-label="Settings"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19.4 15a1.75 1.75 0 0 0 .29 1.9l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.75 1.75 0 0 0-1.9-.29 1.75 1.75 0 0 0-1.05 1.6V21a2 2 0 0 1-4 0v-.18a1.75 1.75 0 0 0-1.05-1.6 1.75 1.75 0 0 0-1.9.29l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.75 1.75 0 0 0 .29-1.9 1.75 1.75 0 0 0-1.6-1.05H3a2 2 0 0 1 0-4h.18a1.75 1.75 0 0 0 1.6-1.05 1.75 1.75 0 0 0-.29-1.9l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.75 1.75 0 0 0 1.9.29h.01A1.75 1.75 0 0 0 8 4.18V4a2 2 0 0 1 4 0v.18c0 .76.44 1.45 1.15 1.7a1.75 1.75 0 0 0 1.9-.29l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.75 1.75 0 0 0-.29 1.9v.01c.25.71.94 1.15 1.7 1.15H21a2 2 0 0 1 0 4h-.18a1.75 1.75 0 0 0-1.6 1.05Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((current) => !current)}
              className="inline-flex items-center gap-3 rounded-full border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-slate-200 transition duration-300 hover:border-slate-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <span className="inline-flex h-9 w-5 items-center justify-center text-slate-200">
                <CircleUser className="text-md font-semibold"/>
              </span>
              <span className="hidden sm:inline">Your Name</span>
            </button>

             {profileOpen ? (
              <div className="absolute right-0 mt-3 w-56 rounded-3xl border border-white/10 bg-slate-950/95 p-3 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
                <a href="#" className="block rounded-2xl px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
                  Profile
                </a>
                <a href="#" className="mt-2 block rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800">
                  Settings
                </a>
                <a href="#" className="mt-2 block rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800">
                  Sign out
                </a>
              </div>
            ) : null} 
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-900/90 text-slate-200 transition duration-300 hover:border-slate-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/50 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
            <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-white/10 bg-slate-950/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <nav className="space-y-3">
            <a href="#" className="flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-900/80">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300">O</span>
              Overview
            </a>
            <a href="#" className="flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900/80 hover:text-white">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">S</span>
              Security
            </a>
            <a href="#" className="flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900/80 hover:text-white">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">C</span>
              Clients
            </a>
            <a href="#" className="flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900/80 hover:text-white">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">S</span>
              Support
            </a>
          </nav>

          <div className="mt-4 flex flex-col gap-3">
            <button className="rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800">
              Contact sales
            </button>
            <button className="rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800">
              Profile settings
            </button>
          </div>
        </div>
      ) : null}
    </header>
  )
}
