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
  } catch {
    return defaultPendingTasks
  }
}

export function savePendingTasks(tasks) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  window.dispatchEvent(new Event('tasks-updated'))
}

export const loadTasks = loadPendingTasks
export const saveTasks = savePendingTasks

export function updateTask(taskId, updates) {
  const tasks = loadPendingTasks()
  const updatedTasks = tasks.map((task) => (
    task.id === taskId ? { ...task, ...updates } : task
  ))

  savePendingTasks(updatedTasks)
  return updatedTasks
}

export function completeTask(taskId) {
  return updateTask(taskId, {
    status: 'Completed',
    completedAt: new Date().toISOString(),
  })
}

export function addPendingTask(task) {
  const tasks = loadPendingTasks()
  const nextNumber = tasks.length + 1
  const nextId = `PT-${String(nextNumber).padStart(2, '0')}`

  const newTask = {
    id: nextId,
    client: task.client,
    task: task.title,
    description: task.description || '',
    category: task.category || 'General',
    dueDate: task.dueDate || 'TBD',
    priority: task.priority || 'Medium',
    assignedTo: task.assignTo || 'Unassigned',
    status: task.status || 'Pending',
    createdAt: new Date().toISOString(),
    ...(task.status === 'Completed' ? { completedAt: new Date().toISOString() } : {}),
  }

  const updated = [newTask, ...tasks]
  savePendingTasks(updated)
  return updated
}
