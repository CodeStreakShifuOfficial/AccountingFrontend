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
    value: '8,431',
    description: 'All secured files',
    icon: Folder,
    color: 'text-sky-600 bg-sky-100',
  },
  {
    title: 'Total Clients',
    value: '152',
    description: 'Active clients',
    icon: Users,
    color: 'text-emerald-600 bg-emerald-100',
  },
  {
    title: 'Pending',
    value: '23',
    description: 'Tasks awaiting completion',
    icon: Clock,
    color: 'text-amber-600 bg-amber-100',
  },
  {
    title: 'Add Task',
    button: true,
    description: 'Create a new workflow item',
    icon: PlusCircle,
    color: 'text-sky-600 bg-sky-100',
  },
  {
    title: 'Urgent Matters',
    value: '6',
    description: 'Require immediate attention',
    icon: AlertTriangle,
    color: 'text-red-600 bg-red-100',
  },
]

const pendingTasks = [
  {
    task: 'Submit BIR Forms',
    client: 'ABC Corporation',
    due: 'Today',
    priority: 'High',
    status: 'Pending',
  },
  {
    task: 'Payroll Processing',
    client: 'XYZ Trading',
    due: 'Tomorrow',
    priority: 'Medium',
    status: 'Pending',
  },
  {
    task: 'Annual Financial Report',
    client: 'Prime Holdings',
    due: 'Aug 15',
    priority: 'Low',
    status: 'In Progress',
  },
]

const urgentList = [
  {
    client: 'ABC Corporation',
    task: 'BIR Filing',
    due: 'Tomorrow',
    priority: 'Critical',
  },
  {
    client: 'XYZ Trading',
    task: 'Payroll Submission',
    due: 'Today',
    priority: 'High',
  },
  {
    client: 'Prime Holdings',
    task: 'Tax Compliance',
    due: '2 Days Left',
    priority: 'Medium',
  },
]

const overdueItems = [
  {
    client: 'ABC Corporation',
    task: 'Quarterly Tax Filing',
    due: 'Aug 1',
    days: '5 Days',
    owner: 'John',
    status: 'Overdue',
  },
  {
    client: 'Trinity Advisors',
    task: 'Client Audit Prep',
    due: 'Jul 29',
    days: '8 Days',
    owner: 'Sarah',
    status: 'Overdue',
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

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-50 via-slate-100 to-sky-50 p-8 shadow-md shadow-slate-200/50 transition-all duration-300 sm:p-10 lg:flex lg:items-center lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Accounting Document Hub</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Welcome back, John!
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              You currently manage 152 clients and 8,431 secured documents.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center rounded-3xl bg-white/80 p-6 shadow-sm shadow-slate-200/80 ring-1 ring-slate-200/80 lg:mt-0">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-sky-100 text-sky-600">
              <Folder className="h-10 w-10" />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[repeat(5,minmax(0,1fr))]">
          {statisticCards.map((card) => {
            const Icon = card.icon
            return (
              <article
                key={card.title}
                className="group rounded-3xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-6 text-sm font-medium text-slate-500">{card.title}</p>
                {card.button ? (
                  <button className="mt-5 inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-sky-500">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Task
                  </button>
                ) : (
                  <p className="mt-4 text-3xl font-semibold text-slate-950">{card.value}</p>
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
              <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
                Updated 5 minutes ago
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
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
                  {pendingTasks.map((item) => (
                    <tr key={item.task} className="rounded-3xl bg-slate-50 shadow-sm">
                      <td className="px-4 py-4 align-middle text-sm text-slate-700">{item.task}</td>
                      <td className="px-4 py-4 align-middle text-sm text-slate-600">{item.client}</td>
                      <td className="px-4 py-4 align-middle text-sm text-slate-600">{item.due}</td>
                      <td className="px-4 py-4 align-middle">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[item.priority]}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status]}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-middle text-sm text-slate-600">
                        <div className="flex flex-wrap gap-2">
                          <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition duration-300 hover:border-slate-300 hover:bg-white">
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                          <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition duration-300 hover:border-slate-300 hover:bg-white">
                            <Edit3 className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition duration-300 hover:bg-emerald-500">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

              <div className="mt-6 space-y-4">
                {urgentList.map((item) => (
                  <div key={item.task} className="rounded-3xl border border-red-100 bg-red-50/70 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{item.client}</p>
                        <p className="mt-2 text-base font-semibold text-slate-700">{item.task}</p>
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[item.priority]}`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-slate-600">Due {item.due}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
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
                {overdueItems.map((item) => (
                  <tr key={item.task} className="border-y border-slate-200 bg-white shadow-sm">
                    <td className="px-4 py-4 font-medium text-slate-900">{item.client}</td>
                    <td className="px-4 py-4 text-slate-700">{item.task}</td>
                    <td className="px-4 py-4 text-slate-600">{item.due}</td>
                    <td className="px-4 py-4 text-slate-600">{item.days}</td>
                    <td className="px-4 py-4 text-slate-600">{item.owner}</td>
                    <td className="px-4 py-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {item.status}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
