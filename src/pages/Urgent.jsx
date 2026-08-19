import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Building2, CalendarClock, User } from 'lucide-react'
import { loadTasks } from '../utils/taskStorage.js'

const priorityStyles = {
  Critical: 'border-red-500 bg-red-50 text-red-700',
  High: 'border-orange-500 bg-orange-50 text-orange-700',
  Medium: 'border-amber-500 bg-amber-50 text-amber-700',
}

const statusStyles = {
  Pending: 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-sky-100 text-sky-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Overdue: 'bg-rose-100 text-rose-700',
}

export default function Urgent({ compact = false }) {
  const navigate = useNavigate()
  const [urgentMatters, setUrgentMatters] = useState(() => loadTasks().filter((task) => (
    task.status !== 'Completed' && (task.priority === 'Critical' || task.priority === 'High')
  )))

  useEffect(() => {
    const refreshUrgentTasks = () => setUrgentMatters(loadTasks().filter((task) => (
      task.status !== 'Completed' && (task.priority === 'Critical' || task.priority === 'High')
    )))
    window.addEventListener('tasks-updated', refreshUrgentTasks)
    window.addEventListener('storage', refreshUrgentTasks)

    return () => {
      window.removeEventListener('tasks-updated', refreshUrgentTasks)
      window.removeEventListener('storage', refreshUrgentTasks)
    }
  }, [])

  const handleViewClick = (clientId) => {
    navigate(`/documents/${clientId}/bir/list`)
  }

  const renderContent = () => (
    <>
      <div className={`flex flex-col gap-4 ${compact ? 'sm:flex-row sm:items-center sm:justify-between' : 'lg:flex-row lg:items-center lg:justify-between'}`}>
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="text-2xl font-semibold text-slate-950">Urgent Matters</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">Items that require immediate attention.</p>
        </div>
        {compact ? (
          <button
            type="button"
            onClick={() => navigate('/urgent')}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition duration-300 hover:border-sky-300 hover:bg-white"
          >
            View All
          </button>
        ) : null}
      </div>

      {urgentMatters.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <p className="text-lg font-semibold text-emerald-700">✅ No urgent matters today.</p>
          <p className="mt-2 text-sm text-emerald-600">You&apos;re all caught up.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {urgentMatters.map((matter) => (
            <article
              key={matter.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 gap-3">
                  <div className={`mt-1 w-1.5 rounded-full ${priorityStyles[matter.priority].split(' ')[0]} ${priorityStyles[matter.priority].split(' ')[1]}`} />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[matter.priority]}`}>
                        {matter.priority}
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[matter.status]}`}>
                        {matter.status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{matter.client}</p>
                        <p className="mt-1 text-sm text-slate-600">{matter.task}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span>{matter.category}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarClock className="h-4 w-4 text-slate-400" />
                        <span>Due {matter.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="h-4 w-4 text-slate-400" />
                        <span>{matter.assignedTo}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleViewClick(matter.clientId)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-sky-500"
                >
                  View
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )

  if (compact) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70 sm:p-8">
        {renderContent()}
      </section>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Operations Center</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Urgent Matters</h1>
              <p className="mt-2 text-sm text-slate-600">A dedicated view for all high-priority client follow-ups.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition duration-300 hover:border-sky-300 hover:bg-white"
            >
              Back to Dashboard
            </button>
          </div>
          {renderContent()}
        </section>
      </div>
    </div>
  )
}
