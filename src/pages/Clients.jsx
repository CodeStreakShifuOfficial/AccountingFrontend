import { useNavigate } from 'react-router-dom'
import {
  Edit3,
  Eye,
  Plus,
  Search,
  Trash2,
  Upload,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react'

const summaryCards = [
  {
    title: 'Total Clients',
    value: '152',
    description: 'All active and retained accounts',
    icon: Users,
    color: 'text-sky-600 bg-sky-100',
  },
  {
    title: 'Active Clients',
    value: '127',
    description: 'Currently engaged this month',
    icon: UserCheck,
    color: 'text-emerald-600 bg-emerald-100',
  },
  {
    title: 'Inactive Clients',
    value: '25',
    description: 'Waiting for follow-up',
    icon: UserX,
    color: 'text-amber-600 bg-amber-100',
  },
  {
    title: 'New Clients This Month',
    value: '14',
    description: 'Fresh onboardings in the last 30 days',
    icon: Plus,
    color: 'text-violet-600 bg-violet-100',
  },
]

const clientRows = [
  {
    id: 'CL-1024',
    name: 'Alicia Morgan',
    company: 'Northstar Labs',
    contact: 'Derek Chen',
    email: 'alicia@northstarlabs.com',
    phone: '+63 917 828 1111',
    status: 'Active',
    documents: '12',
    updated: '2 hours ago',
  },
  {
    id: 'CL-1025',
    name: 'Marcus Lee',
    company: 'Brightline Retail',
    contact: 'Nina Ortiz',
    email: 'marcus@brightline.com',
    phone: '+63 915 205 7744',
    status: 'Active',
    documents: '8',
    updated: 'Today',
  },
  {
    id: 'CL-1026',
    name: 'Ella Santos',
    company: 'Harbor & Co.',
    contact: 'Rafael Cruz',
    email: 'ella@harborco.com',
    phone: '+63 929 812 4450',
    status: 'Inactive',
    documents: '4',
    updated: '3 days ago',
  },
  {
    id: 'CL-1027',
    name: 'Noah Alvarez',
    company: 'Vertex Holdings',
    contact: 'Sofia Kim',
    email: 'noah@vertexholdings.com',
    phone: '+63 922 341 6719',
    status: 'Active',
    documents: '15',
    updated: 'Yesterday',
  },
]

const statusStyles = {
  Active: 'bg-emerald-100 text-emerald-700',
  Inactive: 'bg-slate-100 text-slate-700',
}

export default function Clients() {
  const navigate = useNavigate()

  const handleViewClient = (clientId) => {
    navigate(`/documents/${clientId}/bir`)
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-50 via-slate-100 to-sky-50 p-8 shadow-md shadow-slate-200/50 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Client Management</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Clients</h1>
              <nav className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="font-medium text-slate-500">Dashboard</span>
                <span>/</span>
                <span className="font-semibold text-slate-900">Clients</span>
              </nav>
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-300 hover:bg-sky-500">
              <Plus className="h-4 w-4" />
              Add Client
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon
            return (
              <article key={card.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-6 text-sm font-medium text-slate-500">{card.title}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</p>
                <p className="mt-2 text-sm text-slate-500">{card.description}</p>
              </article>
            )
          })}
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search clients"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition duration-300 hover:border-slate-300 hover:bg-white">
              <Plus className="h-4 w-4" />
              New Client
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3 text-left">
              <thead>
                <tr className="text-sm text-slate-500">
                  <th className="px-4 py-3">Client ID</th>
                  <th className="px-4 py-3">Client Name</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Contact Person</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone Number</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Documents</th>
                  <th className="px-4 py-3">Last Updated</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clientRows.map((client) => (
                  <tr key={client.id} className="rounded-2xl bg-slate-50 shadow-sm">
                    <td className="px-4 py-4 align-middle text-sm font-medium text-slate-900">{client.id}</td>
                    <td className="px-4 py-4 align-middle text-sm text-slate-700">{client.name}</td>
                    <td className="px-4 py-4 align-middle text-sm text-slate-700">{client.company}</td>
                    <td className="px-4 py-4 align-middle text-sm text-slate-700">{client.contact}</td>
                    <td className="px-4 py-4 align-middle text-sm text-slate-700">{client.email}</td>
                    <td className="px-4 py-4 align-middle text-sm text-slate-700">{client.phone}</td>
                    <td className="px-4 py-4 align-middle">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[client.status]}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-middle text-sm text-slate-700">{client.documents}</td>
                    <td className="px-4 py-4 align-middle text-sm text-slate-700">{client.updated}</td>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewClient(client.id)}
                          className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 transition duration-300 hover:border-sky-300 hover:text-sky-600"
                          aria-label={`View ${client.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 transition duration-300 hover:border-sky-300 hover:text-sky-600" aria-label={`Edit ${client.name}`}>
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 transition duration-300 hover:border-sky-300 hover:text-sky-600" aria-label={`Upload documents for ${client.name}`}>
                          <Upload className="h-4 w-4" />
                        </button>
                        <button className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 transition duration-300 hover:border-rose-300 hover:text-rose-600" aria-label={`Delete ${client.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </button>
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
