import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Download,
  Eye,
  FileText,
  FolderOpen,
  Search,
  Upload,
} from 'lucide-react'

const categoryMeta = {
  bir: {
    title: 'BIR Files',
    description: 'Tax forms, returns and BIR submissions',
  },
  sec: {
    title: 'SEC Files',
    description: 'SEC registrations and annual reports',
  },
  'city-hall': {
    title: 'City Hall Files',
    description: 'Business permits and local government requirements',
  },
  company: {
    title: 'Company Papers',
    description: 'Articles, contracts and company records',
  },
  financial: {
    title: 'Financial Statements',
    description: 'Income statements, balance sheets and reports',
  },
  payroll: {
    title: 'Payroll Documents',
    description: 'Payroll summaries and employee reports',
  },
}

const folders = [
  {
    id: '2025',
    label: '2025 Archive',
    description: 'Tax year document archive',
    year: '2025',
    files: [
      {
        name: '2025-Q1-Return.pdf',
        type: 'Tax Return',
        uploaded: 'Today',
        size: '2.4 MB',
        status: 'Verified',
      },
      {
        name: 'Annual-Registration.pdf',
        type: 'Registration',
        uploaded: 'Yesterday',
        size: '1.8 MB',
        status: 'Pending Review',
      },
      {
        name: 'Permit-Approval.pdf',
        type: 'Permit',
        uploaded: '2 days ago',
        size: '3.1 MB',
        status: 'Verified',
      },
      {
        name: 'Payroll-Summary.xlsx',
        type: 'Payroll',
        uploaded: '3 days ago',
        size: '840 KB',
        status: 'Draft',
      },
    ],
  },
  {
    id: '2024',
    label: '2024 Archive',
    description: 'Last year uploaded documents',
    year: '2024',
    files: [
      {
        name: '2024-Q4-Report.pdf',
        type: 'Tax Return',
        uploaded: 'Last month',
        size: '2.1 MB',
        status: 'Verified',
      },
      {
        name: '2024-Audit-Pack.zip',
        type: 'Audit Pack',
        uploaded: '2 weeks ago',
        size: '5.8 MB',
        status: 'Draft',
      },
    ],
  },
]

export default function DocumentList() {
  const navigate = useNavigate()
  const { clientId, category } = useParams()
  const [selectedFolderId, setSelectedFolderId] = useState(folders[0].id)

  const meta = categoryMeta[category] ?? categoryMeta.bir
  const selectedFolder = folders.find((folder) => folder.id === selectedFolderId) ?? folders[0]

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-50 via-slate-100 to-sky-50 p-8 shadow-md shadow-slate-200/60 sm:p-10">
          <button
            type="button"
            onClick={() => navigate(`/documents/${clientId}/bir`)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition duration-300 hover:border-sky-300 hover:text-sky-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </button>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Document Library</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {meta.title}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{meta.description}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm">
              <p className="font-semibold text-slate-900">Client</p>
              <p className="mt-1">{clientId}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70 sm:p-8">
          <div className="flex flex-col gap-6 lg:gap-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Documents</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Files ready for review</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition duration-300 hover:border-sky-300 hover:text-sky-600">
                  <FolderOpen className="h-4 w-4" />
                  Create Folder
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-sky-500">
                  <Upload className="h-4 w-4" />
                  Upload File
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`group flex flex-col justify-between rounded-3xl border p-5 text-left transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                    selectedFolderId === folder.id
                      ? 'border-sky-300 bg-sky-50 shadow-lg'
                      : 'border-slate-200 bg-white shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-100 text-sky-700">
                      <FolderOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{folder.label}</p>
                      <p className="mt-1 text-sm text-slate-500">{folder.description}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{folder.year}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{folder.files.length} Files</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-100 text-sky-700">
                    <FolderOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Folder</p>
                    <p className="text-xl font-semibold text-slate-950">{selectedFolder.label}</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">Year</span>
                  {selectedFolder.year}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search documents"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div className="flex gap-3">
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-300 hover:border-slate-300 hover:bg-slate-50">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  {selectedFolder.year} Folder
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3 text-left">
              <thead>
                <tr className="text-sm text-slate-500">
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Uploaded</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedFolder.files.map((file) => (
                  <tr key={file.name} className="rounded-2xl bg-slate-50 shadow-sm">
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-sky-100 p-2 text-sky-700">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{file.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle text-sm text-slate-700">{file.type}</td>
                    <td className="px-4 py-4 align-middle text-sm text-slate-700">{file.uploaded}</td>
                    <td className="px-4 py-4 align-middle text-sm text-slate-700">{file.size}</td>
                    <td className="px-4 py-4 align-middle">
                      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {file.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 transition duration-300 hover:border-sky-300 hover:text-sky-600" aria-label={`View ${file.name}`}>
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 transition duration-300 hover:border-sky-300 hover:text-sky-600" aria-label={`Download ${file.name}`}>
                          <Download className="h-4 w-4" />
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
