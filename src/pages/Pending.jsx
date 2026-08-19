    import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ClipboardList, Eye, Search } from 'lucide-react'
    import api from '../api/axios'

const statusStyles = {
  Pending: 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-sky-100 text-sky-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Overdue: 'bg-rose-100 text-rose-700',
}

const statusLabels = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  OVERDUE: 'Overdue',
}

const priorityStyles = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-amber-100 text-amber-700',
  CRITICAL: 'bg-red-100 text-red-700',
}

const priorityLabels = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
}

export default function Pending() {
  const navigate = useNavigate()
  const [pendingTasks, setPendingTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const refreshTasks = async () => {
      try {
        const response = await api.get('/tasks')
        const tasks = Array.isArray(response.data) ? response.data : []
        const activeTasks = tasks
          .filter((task) => ['PENDING', 'IN_PROGRESS', 'OVERDUE'].includes(String(task.status).toUpperCase()))
          .map((task) => ({
            ...task,
            task: task.title || task.task || 'Untitled task',
            clientName: task.client?.companyName || task.client?.name || task.client || 'No client',
            assignedToName: task.assignedTo?.username || task.assignedTo?.firstName || task.assignedTo || 'Unassigned',
            dueDate: task.dueDate || 'Not set',
            statusKey: String(task.status).toUpperCase(),
            priorityKey: String(task.priority || 'LOW').toUpperCase(),
          }))

        if (isMounted) {
          setPendingTasks(activeTasks)
          setError('')
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || 'Unable to load pending tasks.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    refreshTasks()
    window.addEventListener('tasks-updated', refreshTasks)
    window.addEventListener('storage', refreshTasks)

    return () => {
      isMounted = false
      window.removeEventListener('tasks-updated', refreshTasks)
      window.removeEventListener('storage', refreshTasks)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70 sm:p-8">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition duration-300 hover:border-sky-300 hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Pending Operations</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Pending Tasks</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Review and resolve the most important client tasks currently awaiting action.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-sm">
              <p className="font-semibold text-slate-900">Pending items</p>
              <p className="mt-1">{pendingTasks.length} tasks</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 text-slate-700">
              <ClipboardList className="h-5 w-5 text-sky-600" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Task summary</p>
                <p className="mt-1 text-sm text-slate-600">Current pending workload across clients.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search pending tasks"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 sm:w-72"
                />
              </div>
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-sky-500">
                <Eye className="h-4 w-4" />
                Review All
              </button>
            </div>
          </div>

          {error ? <p role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : null}
          {isLoading ? <p className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">Loading pending tasks...</p> : null}

          {!isLoading && !error && pendingTasks.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center text-sm text-emerald-700">
              No pending tasks.
            </p>
          ) : !isLoading && !error ? (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3 text-left">
              <thead>
                <tr className="text-sm text-slate-500">
                  <th className="px-4 py-3">Task ID</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Assigned</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
                <tbody>
                  {pendingTasks.map((task) => (
                    <tr key={task.id} className="rounded-3xl bg-slate-50 shadow-sm">
                      <td className="px-4 py-4 text-sm font-semibold text-slate-900">{task.id}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{task.clientName}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{task.task}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{task.category || 'General'}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{task.dueDate}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{task.assignedToName}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[task.priorityKey] || priorityStyles.LOW}`}>
                          {priorityLabels[task.priorityKey] || 'Low'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[statusLabels[task.statusKey]] || statusStyles.Pending}`}>
                          {statusLabels[task.statusKey] || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
