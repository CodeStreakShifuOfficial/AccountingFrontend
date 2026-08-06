const STORAGE_KEY = 'amarillo_pending_tasks'

export const defaultPendingTasks = [
  {
    id: 'PT-01',
    client: 'ABC Corporation',
    task: 'Submit BIR Forms',
    category: 'BIR Files',
    dueDate: 'Today',
    priority: 'High',
    assignedTo: 'John',
    status: 'Pending',
  },
  {
    id: 'PT-02',
    client: 'XYZ Trading',
    task: 'Payroll Processing',
    category: 'Payroll Documents',
    dueDate: 'Tomorrow',
    priority: 'Medium',
    assignedTo: 'Maria',
    status: 'In Progress',
  },
  {
    id: 'PT-03',
    client: 'Prime Holdings',
    task: 'Annual Financial Report',
    category: 'Financial Statements',
    dueDate: 'Aug 15',
    priority: 'Low',
    assignedTo: 'James',
    status: 'Pending',
  },
]

export function loadPendingTasks() {
  if (typeof window === 'undefined') {
    return defaultPendingTasks
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return defaultPendingTasks
    }

    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : defaultPendingTasks
  } catch (error) {
    return defaultPendingTasks
  }
}

export function savePendingTasks(tasks) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function addPendingTask(task) {
  const tasks = loadPendingTasks()
  const lastId = tasks.length ? tasks[0]?.id || tasks[tasks.length - 1]?.id : 'PT-00'
  const nextNumber = tasks.length + 1
  const nextId = `PT-${String(nextNumber).padStart(2, '0')}`

  const newTask = {
    id: nextId,
    client: task.client,
    task: task.title,
    category: task.category || 'General',
    dueDate: task.dueDate || 'TBD',
    priority: task.priority || 'Medium',
    assignedTo: task.assignTo || 'Unassigned',
    status: task.status || 'Pending',
  }

  const updated = [newTask, ...tasks]
  savePendingTasks(updated)
  return updated
}
