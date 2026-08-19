import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import { getStoredUser } from '../api/auth'

import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  ChevronLeft,
  Clock3,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  FolderPlus,
  Trash2,
} from 'lucide-react'

/*
|--------------------------------------------------------------------------
| Category Icons
|--------------------------------------------------------------------------
*/

const categoryIcons = {
  'bir files': FolderOpen,
  'sec files': FileText,
  'city hall files': Building2,
  'company papers': FolderOpen,
  'financial statements': BarChart3,
  'payroll documents': FileSpreadsheet,
}

/*
|--------------------------------------------------------------------------
| Category Slugs
|--------------------------------------------------------------------------
*/

const slugAliases = {
  'bir files': 'bir',
  'sec files': 'sec',
  'city hall files': 'city-hall',
  'company papers': 'company',
  'financial statements': 'financial',
  'payroll documents': 'payroll',
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const slugify = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')

const formatDate = (value, fallback = 'Not available') => {
  if (!value) {
    return fallback
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 Bytes'
  }

  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  )

  return `${(bytes / 1024 ** unitIndex).toFixed(
    unitIndex ? 1 : 0
  )} ${units[unitIndex]}`
}

/*
|--------------------------------------------------------------------------
| Date Helpers
|--------------------------------------------------------------------------
*/

const startOfDay = (date) => {
  const result = new Date(date)

  result.setHours(0, 0, 0, 0)

  return result
}

const differenceInDays = (fromDate, toDate) => {
  const from = startOfDay(fromDate)
  const to = startOfDay(toDate)

  const millisecondsPerDay = 1000 * 60 * 60 * 24

  return Math.ceil((to.getTime() - from.getTime()) / millisecondsPerDay)
}

/*
|--------------------------------------------------------------------------
| Deadline Status
|--------------------------------------------------------------------------
*/

const getDeadlineStatus = (dueDate) => {
  if (!dueDate) {
    return {
      type: 'upcoming',
      label: 'Upcoming',
      className:
        'border-slate-200 bg-slate-100 text-slate-600',
      iconClassName: 'bg-slate-200 text-slate-600',
    }
  }

  const today = startOfDay(new Date())
  const deadline = startOfDay(new Date(dueDate))

  if (Number.isNaN(deadline.getTime())) {
    return {
      type: 'upcoming',
      label: 'Upcoming',
      className:
        'border-slate-200 bg-slate-100 text-slate-600',
      iconClassName: 'bg-slate-200 text-slate-600',
    }
  }

  const daysUntilDeadline = differenceInDays(today, deadline)

  /*
  |--------------------------------------------------------------------------
  | Overdue
  |--------------------------------------------------------------------------
  */

  if (daysUntilDeadline < 0) {
    return {
      type: 'overdue',
      label: 'Overdue',
      className:
        'border-rose-200 bg-rose-50 text-rose-700',
      iconClassName:
        'bg-rose-100 text-rose-600',
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Due Today
  |--------------------------------------------------------------------------
  */

  if (daysUntilDeadline === 0) {
    return {
      type: 'today',
      label: 'Due Today',
      className:
        'border-orange-200 bg-orange-50 text-orange-700',
      iconClassName:
        'bg-orange-100 text-orange-600',
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Due Soon - Within 3 Days
  |--------------------------------------------------------------------------
  */

  if (daysUntilDeadline <= 3) {
    return {
      type: 'soon',
      label: 'Due Soon',
      className:
        'border-amber-200 bg-amber-50 text-amber-700',
      iconClassName:
        'bg-amber-100 text-amber-600',
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Upcoming
  |--------------------------------------------------------------------------
  */

  return {
    type: 'upcoming',
    label: 'Upcoming',
    className:
      'border-sky-200 bg-sky-50 text-sky-700',
    iconClassName:
      'bg-sky-100 text-sky-600',
  }
}

/*
|--------------------------------------------------------------------------
| Folder Mapping
|--------------------------------------------------------------------------
*/

const mapFolderCategories = (folders, documents) => {
  const documentCounts = documents.reduce((counts, document) => {
    const folderId = document.folderId

    if (folderId !== null && folderId !== undefined) {
      counts[folderId] = (counts[folderId] || 0) + 1
    }

    return counts
  }, {})

  return folders.map((folder) => {
    const folderName = folder.folderName || 'Unnamed folder'
    const normalizedName = folderName.toLowerCase().trim()

    return {
      id: folder.id,
      name: folderName,
      year: folder.year || null,
      documents: documentCounts[folder.id] || 0,
      description: 'Documents for this client',
      icon: categoryIcons[normalizedName] || FolderOpen,
      slug:
        slugAliases[normalizedName] ||
        slugify(folderName),
    }
  })
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function DocumentCategory() {
  const navigate = useNavigate()
  const { clientId, category } = useParams()

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [client, setClient] = useState(null)

  const [categories, setCategories] = useState([])

  const [recentUploads, setRecentUploads] = useState([])

  const [upcomingDeadlines, setUpcomingDeadlines] =
    useState([])

  const [isLoading, setIsLoading] = useState(true)

  const [error, setError] = useState('')

  /*
  |--------------------------------------------------------------------------
  | Create Folder State
  |--------------------------------------------------------------------------
  */

  const [isCreateFolderOpen, setIsCreateFolderOpen] =
    useState(false)

  const [folderName, setFolderName] = useState('')

  const [folderYear, setFolderYear] = useState(
    String(new Date().getFullYear())
  )

  const [folderError, setFolderError] = useState('')

  const [isFolderSubmitting, setIsFolderSubmitting] =
    useState(false)

  const currentUser = getStoredUser()

  /*
  |--------------------------------------------------------------------------
  | Load Client Documents
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let isMounted = true

    const loadClientDocuments = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [
          clientResponse,
          foldersResponse,
          documentsResponse,
          tasksResponse,
        ] = await Promise.all([
          api.get(`/clients/${clientId}`),

          api.get(
            `/clients/${clientId}/folders/main`
          ),

          api.get(
            `/clients/${clientId}/documents`
          ),

          api.get('/tasks'),
        ])

        if (!isMounted) {
          return
        }

        const clientData = clientResponse.data

        const folders = Array.isArray(
          foldersResponse.data
        )
          ? foldersResponse.data
          : []

        const documents = Array.isArray(
          documentsResponse.data
        )
          ? documentsResponse.data
          : []

        const tasks = Array.isArray(
          tasksResponse.data
        )
          ? tasksResponse.data
          : []

        /*
        |--------------------------------------------------------------------------
        | Map Categories
        |--------------------------------------------------------------------------
        */

        const categoryData = mapFolderCategories(
          folders,
          documents
        )

        /*
        |--------------------------------------------------------------------------
        | Sort Recent Documents
        |--------------------------------------------------------------------------
        */

        const sortedDocuments = [...documents].sort(
          (first, second) =>
            new Date(
              second.createdAt || 0
            ).getTime() -
            new Date(
              first.createdAt || 0
            ).getTime()
        )

        /*
        |--------------------------------------------------------------------------
        | Client Tasks
        |--------------------------------------------------------------------------
        */

        const clientTasks = tasks
          .filter(
            (task) =>
              String(
                task.client?.id ||
                  task.clientId
              ) === String(clientId)
          )
          .filter(
            (task) =>
              String(task.status).toUpperCase() !==
              'COMPLETED'
          )
          .filter(
            (task) => Boolean(task.dueDate)
          )
          .sort(
            (first, second) =>
              new Date(
                first.dueDate
              ).getTime() -
              new Date(
                second.dueDate
              ).getTime()
          )

        /*
        |--------------------------------------------------------------------------
        | Total Storage
        |--------------------------------------------------------------------------
        */

        const totalBytes = documents.reduce(
          (total, document) =>
            total +
            (Number(document.fileSize) || 0),
          0
        )

        /*
        |--------------------------------------------------------------------------
        | Client Information
        |--------------------------------------------------------------------------
        */

        setClient({
          name:
            clientData.companyName ||
            clientData.clientCode ||
            'Client',

          companyName:
            clientData.companyName ||
            'Not available',

          contactPerson:
            clientData.contactPerson ||
            'Not available',

          email:
            clientData.email ||
            'Not available',

          tin:
            clientData.tin ||
            'Not available',

          phone:
            clientData.phone ||
            'Not available',

          address:
            clientData.address ||
            'Not available',

          birthdate:
            clientData.birthdate
              ? formatDate(
                  clientData.birthdate
                )
              : 'Not available',

          dateOfIncorporation:
            clientData.dateOfIncorporation
              ? formatDate(
                  clientData.dateOfIncorporation
                )
              : 'Not available',

          status:
            clientData.status ||
            'Unknown',

          lastUpdated:
            formatDate(
              clientData.updatedAt
            ),

          totalDocuments:
            documents.length.toLocaleString(),

          storageUsed:
            formatBytes(totalBytes),
        })

        /*
        |--------------------------------------------------------------------------
        | Set Categories
        |--------------------------------------------------------------------------
        */

        setCategories(categoryData)

        /*
        |--------------------------------------------------------------------------
        | Recent Uploads
        |--------------------------------------------------------------------------
        */

        setRecentUploads(
          sortedDocuments
            .slice(0, 3)
            .map((document) => ({
              id: document.id,

              name:
                document.originalFilename ||
                'Unnamed file',

              detail: `Uploaded ${formatDate(
                document.createdAt
              )}`,
            }))
        )

        /*
        |--------------------------------------------------------------------------
        | Upcoming Deadlines
        |--------------------------------------------------------------------------
        */

        setUpcomingDeadlines(
          clientTasks
            .slice(0, 3)
            .map((task) => ({
              id: task.id,

              title:
                task.title ||
                'Untitled task',

              date: formatDate(
                task.dueDate
              ),

              dueDate: task.dueDate,

              status:
                getDeadlineStatus(
                  task.dueDate
                ),
            }))
        )
      } catch (requestError) {
        if (!isMounted) {
          return
        }

        setError(
          requestError.response?.data
            ?.message ||
            'Unable to load client documents.'
        )

        setClient(null)
        setCategories([])
        setRecentUploads([])
        setUpcomingDeadlines([])
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (clientId) {
      loadClientDocuments()
    }

    return () => {
      isMounted = false
    }
  }, [clientId])

  /*
  |--------------------------------------------------------------------------
  | Refresh Folder Data
  |--------------------------------------------------------------------------
  */

  const refreshFolderData =
    useCallback(async () => {
      const [
        foldersResponse,
        documentsResponse,
      ] = await Promise.all([
        api.get(
          `/clients/${clientId}/folders/main`
        ),

        api.get(
          `/clients/${clientId}/documents`
        ),
      ])

      const folders = Array.isArray(
        foldersResponse.data
      )
        ? foldersResponse.data
        : []

      const documents = Array.isArray(
        documentsResponse.data
      )
        ? documentsResponse.data
        : []

      setCategories(
        mapFolderCategories(
          folders,
          documents
        )
      )
    }, [clientId])

  /*
  |--------------------------------------------------------------------------
  | Open Create Folder Modal
  |--------------------------------------------------------------------------
  */

  const openCreateFolderModal = () => {
    setFolderError('')
    setFolderName('')
    setFolderYear(
      String(new Date().getFullYear())
    )
    setIsCreateFolderOpen(true)
  }

  /*
  |--------------------------------------------------------------------------
  | Close Create Folder Modal
  |--------------------------------------------------------------------------
  */

  const closeCreateFolderModal = () => {
    if (isFolderSubmitting) {
      return
    }

    setIsCreateFolderOpen(false)
    setFolderError('')
    setFolderName('')
    setFolderYear(
      String(new Date().getFullYear())
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Create Folder
  |--------------------------------------------------------------------------
  */

  const handleCreateFolder = async (
    event
  ) => {
    event.preventDefault()

    const trimmedName =
      folderName.trim()

    const trimmedYear =
      String(folderYear).trim()

    /*
    |--------------------------------------------------------------------------
    | Validate Folder Name
    |--------------------------------------------------------------------------
    */

    if (!trimmedName) {
      setFolderError(
        'Folder name is required.'
      )

      return
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Year
    |--------------------------------------------------------------------------
    */

    if (!trimmedYear) {
      setFolderError(
        'Folder year is required.'
      )

      return
    }

    if (!/^\d{4}$/.test(trimmedYear)) {
      setFolderError(
        'Please enter a valid 4-digit year.'
      )

      return
    }

    const numericYear =
      Number(trimmedYear)

    if (
      numericYear < 1900 ||
      numericYear > 9999
    ) {
      setFolderError(
        'Please enter a valid year.'
      )

      return
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent Duplicate Folder Name + Year
    |--------------------------------------------------------------------------
    */

    const duplicateFolder =
      categories.some((item) => {
        const sameName =
          item.name
            .trim()
            .toLowerCase() ===
          trimmedName.toLowerCase()

        const sameYear =
          Number(item.year) ===
          numericYear

        return sameName && sameYear
      })

    if (duplicateFolder) {
      setFolderError(
        `A folder named "${trimmedName}" already exists for ${numericYear}.`
      )

      return
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Authenticated User
    |--------------------------------------------------------------------------
    */

    if (!currentUser?.id) {
      setFolderError(
        'Your authenticated user could not be identified.'
      )

      return
    }

    setIsFolderSubmitting(true)
    setFolderError('')

    try {
      /*
      |--------------------------------------------------------------------------
      | Create Folder
      |--------------------------------------------------------------------------
      */

      await api.post(
        `/clients/${clientId}/folders`,
        null,
        {
          params: {
            folderName:
              trimmedName,

            year:
              numericYear,

            userId:
              Number(
                currentUser.id
              ),
          },
        }
      )

      /*
      |--------------------------------------------------------------------------
      | Refresh Folders
      |--------------------------------------------------------------------------
      */

      await refreshFolderData()

      /*
      |--------------------------------------------------------------------------
      | Reset Form
      |--------------------------------------------------------------------------
      */

      setFolderName('')

      setFolderYear(
        String(
          new Date().getFullYear()
        )
      )

      setIsCreateFolderOpen(false)
    } catch (requestError) {
      setFolderError(
        requestError.response?.data
          ?.message ||
          'Unable to create folder.'
      )
    } finally {
      setIsFolderSubmitting(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Delete Folder
  |--------------------------------------------------------------------------
  */

  const handleDeleteFolder =
    async (categoryItem) => {
      /*
      |--------------------------------------------------------------------------
      | Prevent deleting folders containing documents
      |--------------------------------------------------------------------------
      */

      if (categoryItem.documents > 0) {
        setFolderError(
          'This folder contains documents and cannot be deleted.'
        )

        return
      }

      const confirmed =
        window.confirm(
          `Delete the folder "${categoryItem.name}${categoryItem.year ? ` - ${categoryItem.year}` : ''}"?`
        )

      if (!confirmed) {
        return
      }

      setIsFolderSubmitting(true)
      setFolderError('')

      try {
        await api.delete(
          `/folders/${categoryItem.id}`
        )

        await refreshFolderData()
      } catch (requestError) {
        setFolderError(
          requestError.response?.data
            ?.message ||
            'Unable to delete folder.'
        )
      } finally {
        setIsFolderSubmitting(false)
      }
    }

  /*
  |--------------------------------------------------------------------------
  | Selected Category
  |--------------------------------------------------------------------------
  */

  const selectedCategory =
    categories.find(
      (item) =>
        item.slug === category
    ) || {
      name:
        category || 'Documents',

      documents: 0,

      year: null,
    }

  /*
  |--------------------------------------------------------------------------
  | Category Navigation
  |--------------------------------------------------------------------------
  */

  const handleCategoryClick = (
    slug
  ) => {
    navigate(
      `/documents/${clientId}/${slug}/list`
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading client documents...
          </p>
        </div>
      </div>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Error State
  |--------------------------------------------------------------------------
  */

  if (error || !client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            !
          </div>

          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            Unable to Load Client
          </h2>

          <p className="mt-2 text-sm text-rose-700">
            {error ||
              'Client not found.'}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate('/clients')
            }
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Clients
          </button>
        </div>
      </div>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ================================================================
            HEADER
        ================================================================= */}

        <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-50 via-slate-100 to-sky-50 p-8 shadow-md shadow-slate-200/60 sm:p-10">

          <button
            type="button"
            onClick={() =>
              navigate('/clients')
            }
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition duration-300 hover:border-sky-300 hover:text-sky-600"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Clients
          </button>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
                Client Document Center
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {client.name}
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Select a document category to manage this client&apos;s files.
              </p>

              <nav className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span>Dashboard</span>

                <span>/</span>

                <span>Clients</span>

                <span>/</span>

                <span className="font-semibold text-slate-900">
                  {client.name}
                </span>
              </nav>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm">
              <p className="font-semibold text-slate-900">
                Current Focus
              </p>

              <p className="mt-1">
                {selectedCategory.name}
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================
            MAIN CONTENT
        ================================================================= */}

        <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">

          <div className="space-y-6">

            {/* ============================================================
                CLIENT INFO
            ============================================================= */}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70 sm:p-8">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Client Info
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    {client.companyName}
                  </h2>
                </div>

                <div
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold ${
                    String(client.status).toUpperCase() ===
                    'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {client.status}
                </div>
              </div>

              {/* Client Information Grid */}

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {/* Company Name */}

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Company Name
                  </p>

                  <p className="mt-2 break-words font-semibold text-slate-900">
                    {client.companyName}
                  </p>
                </div>

                {/* Contact Person */}

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contact Person
                  </p>

                  <p className="mt-2 break-words font-semibold text-slate-900">
                    {client.contactPerson}
                  </p>
                </div>

                {/* Email */}

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </p>

                  <p className="mt-2 break-words font-semibold text-slate-900">
                    {client.email}
                  </p>
                </div>

                {/* TIN */}

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    TIN
                  </p>

                  <p className="mt-2 break-words font-semibold text-slate-900">
                    {client.tin}
                  </p>
                </div>

                {/* Phone */}

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </p>

                  <p className="mt-2 break-words font-semibold text-slate-900">
                    {client.phone}
                  </p>
                </div>

                {/* Address */}

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Address
                  </p>

                  <p className="mt-2 break-words font-semibold text-slate-900">
                    {client.address}
                  </p>
                </div>

                {/* Date of Birth */}

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date of Birth
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {client.birthdate}
                  </p>
                </div>

                {/* Date of Incorporation */}

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date of Incorporation
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {client.dateOfIncorporation}
                  </p>
                </div>

                {/* Last Updated */}

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Last Updated
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {client.lastUpdated}
                  </p>
                </div>
              </div>

              {/* Document Statistics */}

              <div className="mt-4 grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                  <p className="text-sm text-sky-700">
                    Total Documents
                  </p>

                  <p className="mt-2 text-2xl font-bold text-sky-900">
                    {client.totalDocuments}
                  </p>
                </div>

                <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                  <p className="text-sm text-violet-700">
                    Storage Used
                  </p>

                  <p className="mt-2 text-2xl font-bold text-violet-900">
                    {client.storageUsed}
                  </p>
                </div>

              </div>
            </section>

            {/* ============================================================
                DOCUMENT CATEGORIES
            ============================================================= */}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70 sm:p-8">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Document Categories
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Manage file groups
                  </h2>
                </div>

                <div className="w-fit rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
                  {categories.length}{' '}
                  {categories.length === 1
                    ? 'Category'
                    : 'Categories'}
                </div>
              </div>

              {folderError ? (
                <div
                  role="alert"
                  className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                  {folderError}
                </div>
              ) : null}

              {categories.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                    <FolderOpen className="h-7 w-7" />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    No folders yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Create a folder to start organizing this client&apos;s documents.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">

                  {categories.map(
                    (categoryItem) => {
                      const Icon =
                        categoryItem.icon

                      const isActive =
                        selectedCategory.slug ===
                        categoryItem.slug

                      return (
                        <div
                          key={
                            categoryItem.id ||
                            `${categoryItem.slug}-${categoryItem.year || 'none'}`
                          }
                          onClick={() =>
                            handleCategoryClick(
                              categoryItem.slug
                            )
                          }
                          onKeyDown={(
                            event
                          ) => {
                            if (
                              event.key ===
                                'Enter' ||
                              event.key ===
                                ' '
                            ) {
                              event.preventDefault()

                              handleCategoryClick(
                                categoryItem.slug
                              )
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          className={`group rounded-2xl border p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                            isActive
                              ? 'border-sky-400 bg-sky-50 shadow-sky-100'
                              : 'border-slate-200 bg-white hover:border-sky-300'
                          }`}
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div
                              className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
                                isActive
                                  ? 'bg-sky-600 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <Icon className="h-6 w-6" />
                            </div>

                            <div className="flex items-center gap-2">

                              <ArrowRight
                                className={`mt-1 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 ${
                                  isActive
                                    ? 'text-sky-600'
                                    : 'text-slate-400'
                                }`}
                              />

                              <button
                                type="button"
                                onClick={(
                                  event
                                ) => {
                                  event.stopPropagation()

                                  handleDeleteFolder(
                                    categoryItem
                                  )
                                }}
                                onKeyDown={(
                                  event
                                ) =>
                                  event.stopPropagation()
                                }
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label={`Delete ${categoryItem.name}`}
                                disabled={
                                  isFolderSubmitting
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap items-center gap-2">

                            <p className="text-lg font-semibold text-slate-900">
                              {categoryItem.name}
                            </p>

                            {categoryItem.year ? (
                              <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                {categoryItem.year}
                              </span>
                            ) : null}

                          </div>

                          <p className="mt-2 text-sm font-semibold text-sky-700">
                            {categoryItem.documents}{' '}
                            {categoryItem.documents === 1
                              ? 'Document'
                              : 'Documents'}
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {categoryItem.description}
                          </p>
                        </div>
                      )
                    }
                  )}

                </div>
              )}
            </section>
          </div>

          {/* ==============================================================
              SIDEBAR
          ============================================================== */}

          <aside className="space-y-6">

            {/* ============================================================
                RECENT UPLOADS
            ============================================================= */}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70">

              <div className="flex items-center gap-3">

                <div className="rounded-2xl bg-slate-100 p-2 text-slate-600">
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Recent Uploads
                  </p>

                  <h3 className="mt-1 text-xl font-semibold text-slate-950">
                    Latest files
                  </h3>
                </div>
              </div>

              <div className="mt-6 space-y-3">

                {recentUploads.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                    <p className="text-sm font-medium text-slate-600">
                      No documents uploaded yet.
                    </p>
                  </div>
                ) : (
                  recentUploads.map(
                    (item) => (
                      <div
                        key={
                          item.id ||
                          item.name
                        }
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <p className="break-words font-semibold text-slate-900">
                          {item.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.detail}
                        </p>
                      </div>
                    )
                  )
                )}

              </div>
            </section>

            {/* ============================================================
                UPCOMING DEADLINES
            ============================================================= */}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70">

              <div className="flex items-center gap-3">

                <div className="rounded-2xl bg-amber-100 p-2 text-amber-700">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Upcoming Deadlines
                  </p>

                  <h3 className="mt-1 text-xl font-semibold text-slate-950">
                    Stay prepared
                  </h3>
                </div>
              </div>

              <div className="mt-6 space-y-3">

                {upcomingDeadlines.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                      ✓
                    </div>

                    <p className="mt-3 font-semibold text-slate-900">
                      No upcoming deadlines
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      You&apos;re all caught up for this client.
                    </p>

                  </div>
                ) : (
                  upcomingDeadlines.map(
                    (item) => {
                      const deadlineStatus =
                        item.status ||
                        getDeadlineStatus(
                          item.dueDate
                        )

                      return (
                        <div
                          key={
                            item.id ||
                            `${item.title}-${item.dueDate}`
                          }
                          className={`rounded-2xl border p-4 transition ${deadlineStatus.className}`}
                        >

                          <div className="flex items-start gap-3">

                            <div
                              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${deadlineStatus.iconClassName}`}
                            >
                              <Clock3 className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">

                              <p className="break-words font-semibold text-slate-900">
                                {item.title}
                              </p>

                              <div className="mt-2 flex flex-wrap items-center gap-2">

                                <span className="text-sm font-semibold">
                                  {deadlineStatus.label}
                                </span>

                                <span className="text-slate-300">
                                  •
                                </span>

                                <span className="text-sm text-slate-600">
                                  {item.date}
                                </span>

                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    }
                  )
                )}

              </div>
            </section>

            {/* ============================================================
                QUICK ACTIONS
            ============================================================= */}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70">

              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Quick Actions
              </p>

              <div className="mt-4 space-y-3">

                {/* Upload button intentionally removed */}

                <button
                  type="button"
                  onClick={
                    openCreateFolderModal
                  }
                  disabled={
                    isFolderSubmitting
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <FolderPlus className="h-4 w-4" />
                  Create Folder
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition duration-300 hover:bg-white"
                >
                  <BarChart3 className="h-4 w-4" />
                  Generate Report
                </button>

              </div>
            </section>
          </aside>
        </div>

        {/* ================================================================
            CREATE FOLDER MODAL
        ================================================================= */}

        {isCreateFolderOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8"
            onMouseDown={(
              event
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeCreateFolderModal()
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-folder-title"
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            >

              {/* Modal Header */}

              <div className="flex items-start justify-between gap-4">

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
                    New Folder
                  </p>

                  <h2
                    id="create-folder-title"
                    className="mt-2 text-2xl font-semibold text-slate-950"
                  >
                    Create Folder
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Add a name and year to organize this client&apos;s documents.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeCreateFolderModal
                  }
                  disabled={
                    isFolderSubmitting
                  }
                  className="rounded-xl p-2 text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                  aria-label="Close create folder dialog"
                >
                  ×
                </button>
              </div>

              {/* Form */}

              <form
                onSubmit={
                  handleCreateFolder
                }
                className="mt-6 space-y-5"
              >

                {/* Folder Name */}

                <div>
                  <label
                    htmlFor="folderName"
                    className="text-sm font-medium text-slate-700"
                  >
                    Folder Name
                  </label>

                  <input
                    id="folderName"
                    name="folderName"
                    type="text"
                    value={
                      folderName
                    }
                    onChange={(
                      event
                    ) =>
                      setFolderName(
                        event.target.value
                      )
                    }
                    autoFocus
                    disabled={
                      isFolderSubmitting
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="e.g. BIR Files"
                  />
                </div>

                {/* Year */}

                <div>
                  <label
                    htmlFor="folderYear"
                    className="text-sm font-medium text-slate-700"
                  >
                    Year
                  </label>

                  <input
                    id="folderYear"
                    name="folderYear"
                    type="number"
                    min="1900"
                    max="9999"
                    step="1"
                    value={
                      folderYear
                    }
                    onChange={(
                      event
                    ) =>
                      setFolderYear(
                        event.target.value
                      )
                    }
                    disabled={
                      isFolderSubmitting
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="2026"
                  />
                </div>

                {/* Error */}

                {folderError ? (
                  <div
                    role="alert"
                    className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                  >
                    {folderError}
                  </div>
                ) : null}

                {/* Buttons */}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={
                      closeCreateFolderModal
                    }
                    disabled={
                      isFolderSubmitting
                    }
                    className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      isFolderSubmitting
                    }
                    className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isFolderSubmitting
                      ? 'Creating...'
                      : 'Create Folder'}
                  </button>

                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}