import Logo from '../assets/logo.png'

export default function ForgotPassword({ onBack }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 text-slate-100 sm:py-14">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_18%),radial-gradient(circle_at_bottom_right,_rgba(148,163,184,0.12),_transparent_20%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-500/15 via-slate-950 to-transparent blur-3xl" />

            <div className="relative mx-auto w-full max-w-4xl">
                <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-10">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900/90 ring-1 ring-slate-700/80">
                                    <img src={Logo} alt="Amarillo Accounting logo" className="h-10 w-10 object-contain" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">
                                        Amarillo Accounting
                                    </p>
                                    <p className="text-sm text-slate-400">Forgot password support</p>
                                </div>
                            </div>
                            <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                                Need help signing in?
                            </h1>
                            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-400">
                                Please contact your IT Support for password resets and account recovery. They will help you regain access securely and quickly.
                            </p>
                        </div>


                    </div>

                    <div className="mt-10 grid gap-6 sm:grid-cols-2">
                        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 text-slate-300 shadow-sm shadow-slate-950/10">
                            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Support hours</p>
                            <p className="mt-3 text-lg font-semibold text-white">Mon-Fri, 8am�6pm</p>
                        </div>
                        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 text-slate-300 shadow-sm shadow-slate-950/10">
                            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Response time</p>
                            <p className="mt-3 text-lg font-semibold text-white">Within 24 hours</p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <button
                            type="button"
                            onClick={onBack}
                            className="inline-flex h-10 items-center justify-center rounded-3xl bg-sky-950 px-6 text-sm font-semibold text-slate-250 transition duration-300 hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                        >
                            Back
                        </button>
                    </div>

                </div>

            </div>
        </div>
    )
}
