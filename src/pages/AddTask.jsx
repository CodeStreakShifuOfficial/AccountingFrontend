import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  ClipboardList,
  FolderOpen,
  PlusCircle,
} from 'lucide-react'
import api from '../api/axios'
import { getStoredUser } from '../api/auth'

const categories = [
  'BIR Files',
  'SEC Files',
  'City Hall Files',
  'Company Papers',
  'Financial Statements',
  'Payroll Documents',
]
const priorities = ['Critical', 'High', 'Medium', 'Low']

const todayTasks = [
  {
    client: 'ABC Corporation',
    task: 'Review 1701 filing',
    due: 'Today',
    priority: 'High',
  },
  {
    client: 'XYZ Trading',
    task: 'Approve payroll package',
    due: 'Tomorrow',
    priority: 'Medium',
  },
  {
    client: 'Prime Holdings',
    task: 'Sign SEC submission',
    due: 'Aug 15',
    priority: 'Critical',
  },
]

const priorityBadge = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-slate-100 text-slate-700',
}

export default function AddTask() {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [users, setUsers] = useState([])
  const [clientId, setClientId] = useState('')
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [assignedToId, setAssignedToId] = useState('')
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [optionsError, setOptionsError] = useState('')
  const currentUser = getStoredUser()

  useEffect(() => {
    let isMounted = true

    const loadFormOptions = async () => {
      try {
        const [clientsResponse, usersResponse] = await Promise.all([
          api.get('/clients'),
          api.get('/users'),
        ])

        if (isMounted) {
          setClients(Array.isArray(clientsResponse.data) ? clientsResponse.data : [])
          setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : [])
        }
      } catch (requestError) {
        if (isMounted) {
          setOptionsError(requestError.response?.data?.message || 'Unable to load clients and users.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingOptions(false)
        }
      }
    }

    loadFormOptions()

    return () => {
      isMounted = false
    }
  }, [])

  const resetForm = () => {
    setClientId('')
    setCategory('')
    setTitle('')
    setDescription('')
    setPriority('')
    setDueDate('')
    setAssignedToId('')
    setErrors({})
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = {}

    if (!clientId) validationErrors.client = 'Client is required.'
    if (!title.trim()) validationErrors.title = 'Task title is required.'
    if (!priority) validationErrors.priority = 'Priority is required.'
    if (!dueDate) validationErrors.dueDate = 'Due date is required.'
    if (!assignedToId) validationErrors.assignTo = 'Assigned user is required.'
    if (!currentUser?.id) validationErrors.submit = 'Your authenticated user could not be identified.'

    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true)

      try {
        await api.post('/tasks', {
          client: { id: Number(clientId) },
          title: title.trim(),
          description: description.trim(),
          priority: priority.toUpperCase(),
          status: 'PENDING',
          dueDate,
          createdBy: { id: Number(currentUser.id) },
          assignedTo: { id: Number(assignedToId) },
        })

        setErrors({})
        setSuccess(true)
        resetForm()
        window.setTimeout(() => navigate('/pending'), 700)
      } catch (requestError) {
        setErrors({ submit: requestError.response?.data?.message || 'Unable to create task. Please check the information and try again.' })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleClear = () => {
    resetForm()
    setSuccess(false)
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/50 transition-all duration-300 sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-700">
                <PlusCircle className="h-5 w-5 text-sky-600" />
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Add New Task</p>
              </div>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">Create and assign a task for a client.</h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
              <ClipboardList className="h-4 w-4 text-slate-500" />
              Quick task creation
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
            <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm shadow-slate-200/40">
              {success ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      <CheckCircle className="h-4 w-4" />
                      Task added successfully.
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/pending')}
                      className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition duration-300 hover:bg-emerald-500"
                    >
                      View pending tasks
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Client</label>
                  <select
                    value={clientId}
                    onChange={(event) => setClientId(event.target.value)}
                    disabled={isLoadingOptions}
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 ${errors.client ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                  >
                    <option value="">{isLoadingOptions ? 'Loading clients...' : 'Select client'}</option>
                    {!isLoadingOptions && clients.filter((item) => item.status === 'ACTIVE').length === 0 ? (
                      <option value="" disabled>No active clients available</option>
                    ) : null}
                    {clients.filter((item) => item.status === 'ACTIVE').map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.companyName}
                      </option>
                    ))}
                  </select>
                  {errors.client ? <p className="mt-2 text-sm text-rose-600">{errors.client}</p> : null}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Document Category</label>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="">Select category</option>
                    {categories.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Task Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Submit BIR Form 1701"
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 ${errors.title ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                  />
                  {errors.title ? <p className="mt-2 text-sm text-rose-600">{errors.title}</p> : null}
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Add notes or instructions..."
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Priority</label>
                  <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 ${errors.priority ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                  >
                    <option value="">Select priority</option>
                    {priorities.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  {errors.priority ? <p className="mt-2 text-sm text-rose-600">{errors.priority}</p> : null}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 ${errors.dueDate ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                  />
                  {errors.dueDate ? <p className="mt-2 text-sm text-rose-600">{errors.dueDate}</p> : null}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Assign To</label>
                  <select
                    value={assignedToId}
                    onChange={(event) => setAssignedToId(event.target.value)}
                    disabled={isLoadingOptions}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="">{isLoadingOptions ? 'Loading users...' : 'Select assignee'}</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username || [user.firstName, user.lastName].filter(Boolean).join(' ') || `User ${user.id}`}
                      </option>
                    ))}
                  </select>
                  {errors.assignTo ? <p className="mt-2 text-sm text-rose-600">{errors.assignTo}</p> : null}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <input
                    type="text"
                    value="Pending"
                    readOnly
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700 outline-none"
                  />
                </div>
              </div>

              {optionsError ? <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{optionsError}</p> : null}
              {errors.submit ? <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errors.submit}</p> : null}

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500">Use this form to add a task quickly without leaving the dashboard.</div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition duration-300 hover:border-slate-400 hover:bg-slate-50"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isSubmitting ? 'Creating Task...' : 'Save Task'}
                  </button>
                </div>
              </div>
            </form>

            <aside className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
              <div className="flex items-center gap-3 text-slate-900">
                <FolderOpen className="h-5 w-5 text-sky-600" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Today's Tasks</p>
                  <p className="mt-1 text-sm text-slate-600">Quick overview of top work items.</p>
                </div>
              </div>

              <div className="space-y-4">
                {todayTasks.map((task) => (
                  <div key={task.task} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{task.client}</p>
                        <p className="mt-1 text-sm text-slate-600">{task.task}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityBadge[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{task.due}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-slate-800"
              >
                <ArrowRight className="h-4 w-4" />
                View all tasks
              </button>
            </aside>
          </div>
        </section>
      </div>
    </div>
  )
}
