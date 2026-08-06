import Logo from '../assets/logo.png'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/95 px-4 py-10 text-slate-400 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900/90 ring-1 ring-slate-700/80 text-sky-300">
              <img src={Logo} alt="Amarillo Accounting Logo" className="h-80 w-80 object-contain rounded-4xl" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Amarillo Accounting</p>
              <p className="mt-1 text-sm text-slate-500">Invest in our Services and Save Money!</p>
            </div>
          </div>

          <p className="mt-6 text-sm leading-7 text-slate-400">
            Trusted by business owners, reporting, and client management. Our platform keeps your team aligned with a premium experience and reliable data control.
          </p>
        </div>

        <div className="grid w-full gap-8 sm:grid-cols-2 md:w-auto md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Platform</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a href="#" className="transition hover:text-white">Overview</a>
              </li>
              
              <li>
                <a href="#" className="transition hover:text-white">Clients</a>
              </li>
              <li>
                <a href="#" className="transition hover:text-white">Support</a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Company</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a href="#" className="transition hover:text-white">About us</a>
              </li>
              <li>
                <a href="#" className="transition hover:text-white">Contact</a>
              </li>
              <li>
                <a href="#" className="transition hover:text-white">Terms</a>
              </li>
              <li>
                <a href="#" className="transition hover:text-white">Privacy</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex sm:items-center sm:justify-between">
        <p>© 2026 Amarillo Accounting. All rights reserved.</p>
        <div className="mt-4 flex flex-wrap gap-4 sm:mt-0">
          <a href="#" className="transition hover:text-white">Help Center</a>
          <a href="#" className="transition hover:text-white">Status</a>
          <a href="#" className="transition hover:text-white">Privacy</a>
        </div>
      </div>
    </footer>
  )
}
