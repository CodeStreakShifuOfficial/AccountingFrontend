import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Urgent from './Urgent.jsx'
import api from '../api/axios'
import {
  AlertCircle,
  AlertTriangle,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  Edit3,
  Folder,
  PlusCircle,
  Users,
  Eye,
} from 'lucide-react'

const statisticCards = [
  {
    title: 'Total Documents',
    description: 'All secured files',
    icon: Folder,
    color: 'text-sky-600 bg-sky-100',
  },
  {
    title: 'Total Clients',
    description: 'All clients',
    icon: Users,
    color: 'text-emerald-600 bg-emerald-100',
  },
  {
    title: 'Pending',
    description: 'Tasks awaiting completion',
    icon: Clock,
    color: 'text-amber-600 bg-amber-100',
  },
  {
    title: 'Completed Tasks',
    description: 'Tasks completed',
    icon: CheckCircle2,
    color: 'text-emerald-600 bg-emerald-100',
  },
  // {
  //   title: 'Add Task',
  //   button: true,
  //   description: 'Create a new workflow item',
  //   icon: PlusCircle,
  //   color: 'text-sky-600 bg-sky-100',
  // },
  {
    title: 'Add Client',
    button: true,
    description: 'Register a new client',
    icon: Users,
    color: 'text-emerald-600 bg-emerald-100',
  },
  {
    title: 'Urgent Matters',
    description: 'Require immediate attention',
    icon: AlertTriangle,
    color: 'text-red-600 bg-red-100',
  },
]

const priorityStyles = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-amber-100 text-amber-700',
  Medium: 'bg-slate-100 text-slate-700',
  Low: 'bg-slate-100 text-slate-500',
}

const statusStyles = {
  Pending: 'bg-amber-100 text-amber-800',
  'In Progress': 'bg-sky-100 text-sky-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Overdue: 'bg-red-100 text-red-700',
}

const parseTaskDate = (value) => {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (value === 'Today' || value === 'Tomorrow') {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    if (value === 'Tomorrow') {
      date.setDate(date.getDate() + 1)
    }
    return date
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const monthDayMatch = /^([A-Za-z]+)\s+(\d{1,2})$/.exec(value)
  if (monthDayMatch) {
    const date = new Date(`${monthDayMatch[1]} ${monthDayMatch[2]}, ${new Date().getFullYear()}`)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const isOverdue = (value) => {
  const dueDate = parseTaskDate(value)
  if (!dueDate) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)
  return dueDate < today
}

const getDaysOverdue = (value) => {
  const dueDate = parseTaskDate(value)
  if (!dueDate) {
    return 0
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((today - dueDate) / 86400000))
}

const formatTaskDate = (value) => {
  const date = parseTaskDate(value)
  return date
    ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : value || 'Date not available'
}

const normalizeTask = (task) => ({
  ...task,
  task: task.title || task.task || 'Untitled task',
  client: task.client?.companyName || task.client?.name || (typeof task.client === 'string' ? task.client : 'No client'),
  clientId: task.client?.id,
  assignedTo: task.assignedTo?.username || [task.assignedTo?.firstName, task.assignedTo?.lastName].filter(Boolean).join(' ') || (typeof task.assignedTo === 'string' ? task.assignedTo : 'Unassigned'),
  assignedToId: task.assignedTo?.id,
  dueDate: task.dueDate || 'Not set',
  priority: String(task.priority || 'MEDIUM').toLowerCase().replace(/^./, (letter) => letter.toUpperCase()),
  status: String(task.status || 'PENDING').toLowerCase().replace(/(^|_)(\w)/g, (_, separator, letter) => `${separator ? ' ' : ''}${letter.toUpperCase()}`),
})

export default function Dashboard() {
  const navigate = useNavigate()
  const [allTasks, setAllTasks] = useState([])
  const [totalClients, setTotalClients] = useState(null)
  const [totalDocuments, setTotalDocuments] = useState(null)
  const [isStatisticsLoading, setIsStatisticsLoading] = useState(true)
  const [statisticsError, setStatisticsError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTask, setSelectedTask] = useState(null)
  const [modalMode, setModalMode] = useState(null)
  const [editForm, setEditForm] = useState({})

  const refreshTasks = useCallback(async () => {
    try {
      const response = await api.get('/tasks')
      setAllTasks(Array.isArray(response.data) ? response.data.map(normalizeTask) : [])
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load dashboard tasks.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshStatistics = useCallback(async () => {
    setIsStatisticsLoading(true)
    setStatisticsError('')

    try {
      const clientsResponse = await api.get('/clients')
      const clients = Array.isArray(clientsResponse.data) ? clientsResponse.data : []
      setTotalClients(clients.length)

      const documentResults = await Promise.allSettled(
        clients.map(async (client) => {
          const documentsResponse = await api.get(`/clients/${client.id}/documents`)
          return Array.isArray(documentsResponse.data) ? documentsResponse.data.length : 0
        }),
      )

      const hasDocumentFailure = documentResults.some(
        (result) => result.status === 'rejected',
      )

      if (hasDocumentFailure) {
        setTotalDocuments(null)
        setStatisticsError('Some document statistics could not be loaded.')
      } else {
        setTotalDocuments(
          documentResults.reduce(
            (total, result) => total + result.value,
            0,
          ),
        )
      }
    } catch (requestError) {
      console.error('Failed to fetch dashboard statistics:', requestError)
      setTotalClients(null)
      setTotalDocuments(null)
      setStatisticsError(
        requestError.response?.data?.message ||
          'Unable to load dashboard statistics.',
      )
    } finally {
      setIsStatisticsLoading(false)
    }
  }, [])

  const activeTasks = allTasks.filter((task) => task.status !== 'Completed')
  const pendingTasks = activeTasks
  const completedTasks = allTasks.filter((task) => task.status === 'Completed')
  const urgentTasks = activeTasks.filter((task) => task.priority === 'Critical' || task.priority === 'High')
  const overdueTasks = activeTasks.filter((task) => isOverdue(task.dueDate))
  const completedTasksByClient = completedTasks.reduce((groups, task) => {
    const client = task.client || 'Unassigned client'

    if (!groups[client]) {
      groups[client] = []
    }

    groups[client].push(task)
    return groups
  }, {})

  useEffect(() => {
    const initialLoad = window.setTimeout(() => refreshTasks(), 0)
    const initialStatisticsLoad = window.setTimeout(() => refreshStatistics(), 0)
    window.addEventListener('tasks-updated', refreshTasks)
    window.addEventListener('storage', refreshTasks)
    window.addEventListener('tasks-updated', refreshStatistics)
    window.addEventListener('storage', refreshStatistics)

    return () => {
      window.clearTimeout(initialLoad)
      window.clearTimeout(initialStatisticsLoad)
      window.removeEventListener('tasks-updated', refreshTasks)
      window.removeEventListener('storage', refreshTasks)
      window.removeEventListener('tasks-updated', refreshStatistics)
      window.removeEventListener('storage', refreshStatistics)
    }
  }, [refreshStatistics, refreshTasks])

  const closeTaskModal = () => {
    setSelectedTask(null)
    setModalMode(null)
  }

  const handleViewTask = (task) => {
    setSelectedTask(task)
    setModalMode('view')
  }

  const handleEditTask = (task) => {
    setSelectedTask(task)
    setEditForm({
      task: task.task || '',
      client: task.client || '',
      dueDate: task.dueDate || '',
      status: task.status || 'Pending',
      description: task.description || '',
      assignedTo: task.assignedTo || '',
    })
    setModalMode('edit')
  }

  const handleEditFormChange = (event) => {
    const { name, value } = event.target
    setEditForm((current) => ({ ...current, [name]: value }))
  }

  const handleSaveTask = (event) => {
    event.preventDefault()

    const saveTask = async () => {
      try {
        await api.put(`/tasks/${selectedTask.id}`, {
          client: selectedTask.clientId ? { id: Number(selectedTask.clientId) } : undefined,
          title: editForm.task.trim(),
          description: editForm.description.trim(),
          status: editForm.status.toUpperCase().replace(' ', '_'),
          dueDate: editForm.dueDate,
          assignedTo: selectedTask.assignedToId ? { id: Number(selectedTask.assignedToId) } : undefined,
        })
        await refreshTasks()
        closeTaskModal()
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to update task.')
      }
    }

    saveTask()
  }

  const handleCompleteTask = (task) => {
    const completeSelectedTask = async () => {
      try {
        await api.put(`/tasks/${task.id}/complete`)
        await refreshTasks()
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to complete task.')
      }
    }

    completeSelectedTask()
  }

  const handleClientsCardAction = () => {
    navigate('/clients')
  }

  const handlePendingCardAction = () => {
    navigate('/pending')
  }

  const handleUrgentCardAction = () => {
    navigate('/urgent')
  }

  const handleAddTaskCardAction = () => {
    navigate('/add-task')
  }

  const handleAddClientCardAction = () => {
    navigate('/clients')
  }

  const handleClientsCardKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClientsCardAction()
    }
  }

  const handlePendingCardKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handlePendingCardAction()
    }
  }

  const handleUrgentCardKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleUrgentCardAction()
    }
  }

  const handleAddTaskCardKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleAddTaskCardAction()
    }
  }

  const handleAddClientCardKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleAddClientCardAction()
    }
  }

  const formatStatisticValue = (value, loading) => {
    if (loading) {
      return '...'
    }

    if (value === null || value === undefined || Number.isNaN(value)) {
      return '—'
    }

    return value.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-50 via-slate-100 to-sky-50 p-8 shadow-md shadow-slate-200/50 transition-all duration-300 sm:p-10 lg:flex lg:items-center lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Accounting Document Hub</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Welcome back, Boss!
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              You currently manage{' '}
              {formatStatisticValue(totalClients, isStatisticsLoading)} clients and{' '}
              {formatStatisticValue(totalDocuments, isStatisticsLoading)} secured documents.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center rounded-3xl bg-white/80 p-6 shadow-sm shadow-slate-200/80 ring-1 ring-slate-200/80 lg:mt-0">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-sky-100 text-sky-600">
              <Folder className="h-10 w-10" />
            </div>
          </div>
        </section>

        {statisticsError ? (
          <p role="alert" className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-800">
            {statisticsError}
          </p>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[repeat(6,minmax(0,1fr))]">
          {statisticCards.map((card) => {
            const Icon = card.icon
            const isClientsCard = card.title === 'Total Clients'
            const isPendingCard = card.title === 'Pending'
            const isCompletedCard = card.title === 'Completed Tasks'
            const isUrgentCard = card.title === 'Urgent Matters'
            const isAddTaskCard = card.title === 'Add Task'
            const isAddClientCard = card.title === 'Add Client'
            const isInteractiveCard = isClientsCard || isPendingCard || isUrgentCard || isAddTaskCard || isAddClientCard

            return (
              <article
                key={card.title}
                role={isInteractiveCard ? 'button' : undefined}
                tabIndex={isInteractiveCard ? 0 : undefined}
                onClick={
                  isClientsCard
                    ? handleClientsCardAction
                    : isPendingCard
                      ? handlePendingCardAction
                      : isUrgentCard
                        ? handleUrgentCardAction
                        : isAddTaskCard
                          ? handleAddTaskCardAction
                          : isAddClientCard
                            ? handleAddClientCardAction
                            : undefined
                }
                onKeyDown={
                  isClientsCard
                    ? handleClientsCardKeyDown
                    : isPendingCard
                      ? handlePendingCardKeyDown
                      : isUrgentCard
                        ? handleUrgentCardKeyDown
                        : isAddTaskCard
                          ? handleAddTaskCardKeyDown
                          : isAddClientCard
                            ? handleAddClientCardKeyDown
                            : undefined
                }
                aria-label={
                  isClientsCard
                    ? 'View clients page'
                    : isPendingCard
                      ? 'View pending tasks page'
                      : isUrgentCard
                        ? 'View urgent matters page'
                        : isAddTaskCard
                          ? 'Create a new task'
                          : isAddClientCard
                            ? 'Create a new client'
                            : undefined
                }
                className={`group rounded-3xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isInteractiveCard ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 hover:scale-[1.01] hover:shadow-xl' : ''
                  }`}
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-6 text-sm font-medium text-slate-500">{card.title}</p>
                {card.button ? (
                  <button
                    type="button"
                    onClick={isAddClientCard ? handleAddClientCardAction : handleAddTaskCardAction}
                    className="mt-5 inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-sky-500"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {isAddClientCard ? 'New Client' : 'New Task'}
                  </button>
                ) : (
                  <p className="mt-4 text-3xl font-semibold text-slate-950">
                    {card.title === 'Total Documents'
                      ? formatStatisticValue(totalDocuments, isStatisticsLoading)
                      : card.title === 'Total Clients'
                        ? formatStatisticValue(totalClients, isStatisticsLoading)
                        : isPendingCard
                          ? formatStatisticValue(pendingTasks.length, isLoading || Boolean(error))
                          : isCompletedCard
                            ? formatStatisticValue(completedTasks.length, isLoading || Boolean(error))
                            : card.title === 'Urgent Matters'
                              ? formatStatisticValue(urgentTasks.length, isLoading || Boolean(error))
                              : '—'}
                  </p>
                )}
                <p className="mt-3 text-sm text-slate-500">{card.description}</p>
              </article>
            )
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <article className="rounded-3xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Pending Tasks</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Task queue</h2>
              </div>
              <button
                type="button"
                onClick={handleAddTaskCardAction}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                <PlusCircle className="h-4 w-4" />
                New Task
              </button>
            </div>

            <div className="mt-6 overflow-x-auto">
              {isLoading ? <p className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-600">Loading tasks...</p> : null}
              {error ? <p role="alert" className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-12 text-center text-sm text-rose-700">{error}</p> : null}
              {!isLoading && !error && pendingTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">No pending tasks</h3>
                  <p className="mt-2 text-sm text-slate-500">You're all caught up.</p>
                  <button
                    type="button"
                    onClick={handleAddTaskCardAction}
                    className="mt-6 inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-sky-500"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Task
                  </button>
                </div>
              ) : !isLoading && !error ? (
                <table className="min-w-full border-separate border-spacing-y-3 text-left">
                  <thead>
                    <tr className="text-sm text-slate-500">
                      <th className="px-4 py-3">Task</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTasks.map((item, index) => (
                      <tr key={item.id || `pending-task-${index}`} className="rounded-3xl bg-slate-50 shadow-sm">
                        <td className="px-4 py-4 align-middle text-sm text-slate-700">{item.task || 'Untitled task'}</td>
                        <td className="px-4 py-4 align-middle text-sm text-slate-600">{item.client || 'No client'}</td>
                        <td className="px-4 py-4 align-middle text-sm text-slate-600">{item.dueDate || 'Not set'}</td>
                        <td className="px-4 py-4 align-middle">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[item.priority || 'Medium'] || priorityStyles.Medium}`}>
                            {item.priority || 'Medium'}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status] || statusStyles.Pending}`}>
                            {item.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-middle text-sm text-slate-600">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewTask(item)}
                              aria-label={`View ${item.task || 'task'}`}
                              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition duration-300 hover:border-slate-300 hover:bg-white"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditTask(item)}
                              aria-label={`Edit ${item.task || 'task'}`}
                              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition duration-300 hover:border-slate-300 hover:bg-white"
                            >
                              <Edit3 className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCompleteTask(item)}
                              aria-label={`Complete ${item.task || 'task'}`}
                              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition duration-300 hover:bg-emerald-500"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </div>
          </article>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Urgent Matters</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">Critical tasks</h2>
                </div>
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>

              {urgentTasks.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center text-sm text-emerald-700">
                  No urgent matters.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {urgentTasks.map((item, index) => (
                    <div key={item.id || `${item.task || 'urgent-task'}-${index}`} className="rounded-3xl border border-red-100 bg-red-50/70 p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{item.client || 'No client'}</p>
                          <p className="mt-2 text-base font-semibold text-slate-700">{item.task || 'Untitled task'}</p>
                        </div>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[item.priority] || priorityStyles.Medium}`}>
                          {item.priority || 'Medium'}
                        </span>
                      </div>
                      <p className="mt-4 text-sm text-slate-600">Due {formatTaskDate(item.dueDate)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Completed Tasks</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Sorted by Client</h2>
          </div>

          {completedTasks.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <h3 className="mt-4 text-lg font-semibold text-slate-950">No completed tasks yet</h3>
              <p className="mt-2 text-sm text-slate-500">Completed work will appear here.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {Object.entries(completedTasksByClient)
                .sort(([firstClient], [secondClient]) => firstClient.localeCompare(secondClient))
                .map(([client, tasks]) => (
                  <article key={client} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-950">{client}</h3>
                    <div className="mt-4 space-y-3">
                      {tasks.map((task, index) => (
                        <div key={task.id || `${task.task || 'completed-task'}-${index}`} className="rounded-2xl bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                              <div>
                                <p className="font-medium text-slate-900">{task.task || 'Untitled task'}</p>
                                <p className="mt-1 text-sm text-slate-500">
                                  Completed {task.completedAt
                                    ? formatTaskDate(task.completedAt)
                                    : 'No completion date available.'}
                                </p>
                              </div>
                            </div>
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[task.priority || 'Medium'] || priorityStyles.Medium}`}>
                              {task.priority || 'Medium'}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-slate-600">Assigned to: {task.assignedTo || task.assignedUser || 'Unassigned'}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Beyond Deadlines</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Overdue items</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
              <AlertTriangle className="h-4 w-4" /> Prioritize now
            </div>
          </div>

          {overdueTasks.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center text-sm text-emerald-700">
              No overdue items.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Task</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Days Overdue</th>
                    <th className="px-4 py-3">Assigned To</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="space-y-3">
                  {overdueTasks.map((item, index) => (
                    <tr key={item.id || `${item.task || 'overdue-task'}-${index}`} className="border-y border-slate-200 bg-white shadow-sm">
                      <td className="px-4 py-4 font-medium text-slate-900">{item.client || 'No client'}</td>
                      <td className="px-4 py-4 text-slate-700">{item.task || 'Untitled task'}</td>
                      <td className="px-4 py-4 text-slate-600">{formatTaskDate(item.dueDate)}</td>
                      <td className="px-4 py-4 text-slate-600">{getDaysOverdue(item.dueDate)} Days</td>
                      <td className="px-4 py-4 text-slate-600">{item.assignedTo || item.owner || 'Unassigned'}</td>
                      <td className="px-4 py-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {item.status || 'Pending'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <Urgent compact />

        {modalMode && selectedTask ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8" role="presentation">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="task-modal-title"
              className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            >
              {modalMode === 'view' ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Task Details</p>
                      <h2 id="task-modal-title" className="mt-2 text-2xl font-semibold text-slate-950">
                        {selectedTask.task || 'Untitled task'}
                      </h2>
                    </div>
                    <CalendarCheck className="h-6 w-6 text-sky-600" />
                  </div>

                  <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm text-slate-500">Client</dt>
                      <dd className="mt-1 font-medium text-slate-900">{selectedTask.client || 'No client'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-slate-500">Due Date</dt>
                      <dd className="mt-1 font-medium text-slate-900">{selectedTask.dueDate || 'Not set'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-slate-500">Priority</dt>
                      <dd className="mt-1 font-medium text-slate-900">{selectedTask.priority || 'Medium'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-slate-500">Status</dt>
                      <dd className="mt-1 font-medium text-slate-900">{selectedTask.status || 'Pending'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-slate-500">Assigned To</dt>
                      <dd className="mt-1 font-medium text-slate-900">{selectedTask.assignedTo || selectedTask.assignedUser || 'Unassigned'}</dd>
                    </div>
                  </dl>

                  <div className="mt-6">
                    <p className="text-sm text-slate-500">Description</p>
                    <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      {selectedTask.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={closeTaskModal}
                      className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSaveTask}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Edit Task</p>
                      <h2 id="task-modal-title" className="mt-2 text-2xl font-semibold text-slate-950">Task details</h2>
                    </div>
                    <Edit3 className="h-6 w-6 text-sky-600" />
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="sm:col-span-2">
                      <span className="text-sm font-medium text-slate-700">Task name</span>
                      <input
                        name="task"
                        value={editForm.task || ''}
                        onChange={handleEditFormChange}
                        required
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      />
                    </label>
                    <label>
                      <span className="text-sm font-medium text-slate-700">Client</span>
                      <input
                        name="client"
                        value={editForm.client || ''}
                        onChange={handleEditFormChange}
                        required
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      />
                    </label>
                    <label>
                      <span className="text-sm font-medium text-slate-700">Due date</span>
                      <input
                        name="dueDate"
                        value={editForm.dueDate || ''}
                        onChange={handleEditFormChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      />
                    </label>
                    <label>
                      <span className="text-sm font-medium text-slate-700">Status</span>
                      <select
                        name="status"
                        value={editForm.status || 'Pending'}
                        onChange={handleEditFormChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      >
                        {['Pending', 'In Progress', 'Completed'].map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </label>
                    <label>
                      <span className="text-sm font-medium text-slate-700">Assigned To</span>
                      <input
                        name="assignedTo"
                        value={editForm.assignedTo || ''}
                        onChange={handleEditFormChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      />
                    </label>
                    <label className="sm:col-span-2">
                      <span className="text-sm font-medium text-slate-700">Description</span>
                      <textarea
                        name="description"
                        value={editForm.description || ''}
                        onChange={handleEditFormChange}
                        rows="4"
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      />
                    </label>
                  </div>

                  <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeTaskModal}
                      className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
