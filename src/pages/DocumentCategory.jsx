import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  ChevronLeft,
  Clock3,
  FolderOpen,
  FolderPlus,
  FileSpreadsheet,
  FileText,
  Upload,
} from 'lucide-react'

const categories = [
  {
    name: 'BIR Files',
    documents: 24,
    description: 'Tax forms, returns and BIR submissions',
    icon: FolderOpen,
    slug: 'bir',
  },
  {
    name: 'SEC Files',
    documents: 12,
    description: 'SEC registrations and annual reports',
    icon: FileText,
    slug: 'sec',
  },
  {
    name: 'City Hall Files',
    documents: 8,
    description: 'Business permits and local government requirements',
    icon: Building2,
    slug: 'city-hall',
  },
  {
    name: 'Company Papers',
    documents: 15,
    description: 'Articles, contracts and company records',
    icon: FolderOpen,
    slug: 'company',
  },
  {
    name: 'Financial Statements',
    documents: 10,
    description: 'Income statements, balance sheets and reports',
    icon: BarChart3,
    slug: 'financial',
  },
  {
    name: 'Payroll Documents',
    documents: 18,
    description: 'Payroll summaries and employee reports',
    icon: FileSpreadsheet,
    slug: 'payroll',
  },
]

const recentUploads = [
  { name: '1701.pdf', detail: 'Uploaded Today' },
  { name: 'Payroll.xlsx', detail: 'Yesterday' },
  { name: 'Business Permit.pdf', detail: '3 Days Ago' },
]

const upcomingDeadlines = [
  { title: 'BIR Filing', date: 'Tomorrow' },
  { title: 'SEC Renewal', date: 'Aug 15' },
  { title: 'Business Permit', date: 'Aug 20' },
]

const clientProfiles = {
  'CL-1024': {
    name: 'Alicia Morgan',
    company: 'Northstar Labs',
    status: 'Active',
    contactPerson: 'Derek Chen',
    lastUpdated: '2 hours ago',
    totalDocuments: '124',
    storageUsed: '68 GB',
  },
  'CL-1025': {
    name: 'Marcus Lee',
    company: 'Brightline Retail',
    status: 'Active',
    contactPerson: 'Nina Ortiz',
    lastUpdated: 'Today',
    totalDocuments: '89',
    storageUsed: '41 GB',
  },
  'CL-1026': {
    name: 'Ella Santos',
    company: 'Harbor & Co.',
    status: 'Inactive',
    contactPerson: 'Rafael Cruz',
    lastUpdated: '3 days ago',
    totalDocuments: '57',
    storageUsed: '24 GB',
  },
  'CL-1027': {
    name: 'Noah Alvarez',
    company: 'Vertex Holdings',
    status: 'Active',
    contactPerson: 'Sofia Kim',
    lastUpdated: 'Yesterday',
    totalDocuments: '103',
    storageUsed: '53 GB',
  },
}

export default function DocumentCategory() {
  const navigate = useNavigate()
  const { clientId, category } = useParams()
  const client = clientProfiles[clientId] ?? {
    name: 'ABC Corporation',
    company: 'Client Account',
    status: 'Active',
    contactPerson: 'Jordan Rivera',
    lastUpdated: 'Today',
    totalDocuments: '96',
    storageUsed: '44 GB',
  }

  const selectedCategory = categories.find((item) => item.slug === category) ?? categories[0]

  const handleCategoryClick = (slug) => {
    navigate(`/documents/${clientId}/${slug}/list`)
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-50 via-slate-100 to-sky-50 p-8 shadow-md shadow-slate-200/60 sm:p-10">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition duration-300 hover:border-sky-300 hover:text-sky-600"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Clients
          </button>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Client Document Center</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{client.name}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Select a document category to manage this client&apos;s files.
              </p>
              <nav className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span>Dashboard</span>
                <span>/</span>
                <span>Clients</span>
                <span>/</span>
                <span className="font-semibold text-slate-900">{client.name}</span>
              </nav>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm">
              <p className="font-semibold text-slate-900">Current Focus</p>
              <p className="mt-1">{selectedCategory.name}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Client Summary</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">{client.name}</h2>
                </div>
                <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                  {client.status}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Contact Person</p>
                  <p className="mt-2 font-semibold text-slate-900">{client.contactPerson}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Last Updated</p>
                  <p className="mt-2 font-semibold text-slate-900">{client.lastUpdated}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Total Documents</p>
                  <p className="mt-2 font-semibold text-slate-900">{client.totalDocuments}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Storage Used</p>
                  <p className="mt-2 font-semibold text-slate-900">{client.storageUsed}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Document Categories</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">Manage file groups</h2>
                </div>
                <div className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
                  {categories.length} Categories
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {categories.map((categoryItem) => {
                  const Icon = categoryItem.icon
                  const isActive = selectedCategory.slug === categoryItem.slug

                  return (
                    <button
                      key={categoryItem.name}
                      type="button"
                      onClick={() => handleCategoryClick(categoryItem.slug)}
                      className={`group rounded-2xl border p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isActive ? 'border-sky-400 bg-sky-50 shadow-sky-100' : 'border-slate-200 bg-white hover:border-sky-300'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${isActive ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <ArrowRight className={`mt-1 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                      </div>
                      <p className="mt-5 text-lg font-semibold text-slate-900">{categoryItem.name}</p>
                      <p className="mt-2 text-sm font-medium text-sky-700">{categoryItem.documents} Documents</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{categoryItem.description}</p>
                    </button>
                  )
                })}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-2 text-slate-600">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Recent Uploads</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-950">Latest files</h3>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {recentUploads.map((item) => (
                  <div key={item.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-100 p-2 text-amber-700">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Upcoming Deadlines</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-950">Stay prepared</h3>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {upcomingDeadlines.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        <Clock3 className="h-3.5 w-3.5" />
                        {item.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Quick Actions</p>
              <div className="mt-4 space-y-3">
                <button type="button" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-sky-500">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </button>
                <button type="button" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition duration-300 hover:bg-white">
                  <FolderPlus className="h-4 w-4" />
                  Create Folder
                </button>
                <button type="button" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition duration-300 hover:bg-white">
                  <BarChart3 className="h-4 w-4" />
                  Generate Report
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
