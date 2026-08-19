import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deactivateClient, getClients, updateClient } from '../api/clients.js'
import {
  AlertCircle,
  ChevronDown,
  Edit3,
  Eye,
  LoaderCircle,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react'

const normalizeStatus = (value) => {
  const normalized = String(value ?? '').trim().toUpperCase()
  return normalized === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'
}

const formatDate = (value) => {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  const textValue = String(value).trim()
  if (
    !textValue ||
    textValue.toLowerCase() === 'null' ||
    textValue.toLowerCase() === 'undefined'
  ) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatCellValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  return String(value)
}

const normalizeDateInput = (value) => {
  if (!value) {
    return ''
  }

  const textValue = String(value)

  if (/^\d{4}-\d{2}-\d{2}$/.test(textValue)) {
    return textValue
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 10)
}

const isNewClientThisMonth = (createdAt) => {
  if (!createdAt) {
    return false
  }

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) {
    return false
  }

  const now = new Date()

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  )
}

export default function Clients() {
  const navigate = useNavigate()
  const [clientRows, setClientRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [successMessage, setSuccessMessage] = useState('')
  const [clientToDeactivate, setClientToDeactivate] = useState(null)
  const [clientToEdit, setClientToEdit] = useState(null)
  const [editForm, setEditForm] = useState({
    clientCode: '',
    companyName: '',
    contactPerson: '',
    email: '',
    tin: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    dateOfIncorporation: '',
    status: 'ACTIVE',
  })
  const [editError, setEditError] = useState('')
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)

  const loadClients = useCallback(async (options = {}) => {
    const { preserveSuccessMessage = false } = options

    setError('')
    if (!preserveSuccessMessage) {
      setSuccessMessage('')
    }
    setIsLoading(true)

    try {
      const data = await getClients()
      setClientRows(Array.isArray(data) ? data : [])
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to load clients. Please try again.',
      )
      setClientRows([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // The initial client fetch synchronizes this page with the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClients({ preserveSuccessMessage: true })
  }, [loadClients])

  const summaryCards = useMemo(() => {
    const totalClients = clientRows.length
    const activeClients = clientRows.filter(
      (client) => normalizeStatus(client.status) === 'ACTIVE',
    ).length
    const inactiveClients = clientRows.filter(
      (client) => normalizeStatus(client.status) === 'INACTIVE',
    ).length
    const newClientsThisMonth = clientRows.filter((client) =>
      isNewClientThisMonth(client.createdAt),
    ).length

    return [
      {
        title: 'Total Clients',
        value: totalClients,
        description: 'All retained clients',
        icon: Users,
        color: 'text-sky-600 bg-sky-100',
      },
      {
        title: 'Active Clients',
        value: activeClients,
        description: 'Currently active accounts',
        icon: UserCheck,
        color: 'text-emerald-600 bg-emerald-100',
      },
      {
        title: 'Inactive Clients',
        value: inactiveClients,
        description: 'Awaiting follow-up',
        icon: UserX,
        color: 'text-amber-600 bg-amber-100',
      },
      {
        title: 'New Clients This Month',
        value: newClientsThisMonth,
        description: 'Fresh onboardings',
        icon: Plus,
        color: 'text-violet-600 bg-violet-100',
      },
    ]
  }, [clientRows])

  const filteredClients = useMemo(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase()

    return clientRows.filter((client) => {
      const status = normalizeStatus(client.status)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && status === 'ACTIVE') ||
        (statusFilter === 'inactive' && status === 'INACTIVE')

      if (!matchesStatus) {
        return false
      }

      if (!trimmedSearch) {
        return true
      }

      const searchableText = [
        client.clientCode,
        client.companyName,
        client.contactPerson,
        client.email,
        client.tin,
        client.phone,
        client.address,
      ]
        .filter((value) => value !== null && value !== undefined && value !== '')
        .join(' ')
        .toLowerCase()

      return searchableText.includes(trimmedSearch)
    })
  }, [clientRows, searchTerm, statusFilter])

  const handleViewClient = (clientId) => {
    navigate(`/documents/${clientId}/bir`)
  }

  const handleAddClient = () => {
    navigate('/add-client')
  }

  const handleDeactivateClick = (client) => {
    setClientToDeactivate(client)
  }

  const handleConfirmDeactivate = async () => {
    if (!clientToDeactivate || !clientToDeactivate.id) {
      return
    }

    try {
      await deactivateClient(clientToDeactivate.id)
      const companyName =
        clientToDeactivate.companyName ||
        clientToDeactivate.clientCode ||
        'Client'
      setClientToDeactivate(null)
      setError('')
      setSuccessMessage(`${companyName} has been deactivated.`)
      await loadClients({ preserveSuccessMessage: true })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to deactivate client. Please try again.',
      )
      setClientToDeactivate(null)
    }
  }

  const handleEditClient = (client) => {
    setClientToEdit(client)
    setEditForm({
      clientCode: client.clientCode ?? '',
      companyName: client.companyName ?? '',
      contactPerson: client.contactPerson ?? '',
      email: client.email ?? '',
      tin: client.tin ?? '',
      phone: client.phone ?? '',
      address: client.address ?? '',
      dateOfBirth: normalizeDateInput(client.birthdate ?? client.dateOfBirth),
      dateOfIncorporation: normalizeDateInput(client.dateOfIncorporation),
      status: normalizeStatus(client.status),
    })
    setEditError('')
    setSuccessMessage('')
  }

  const closeEditModal = () => {
    if (isEditSubmitting) {
      return
    }

    setClientToEdit(null)
    setEditError('')
  }

  const handleEditFormChange = (event) => {
    const { name, value } = event.target
    setEditForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleUpdateClient = async (event) => {
    event.preventDefault()

    const companyName = editForm.companyName.trim()
    const email = editForm.email.trim()

    if (!clientToEdit?.id) {
      setEditError('The selected client could not be identified.')
      return
    }

    if (!companyName) {
      setEditError('Company Name is required.')
      return
    }

    if (!email) {
      setEditError('Email is required.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEditError('Please enter a valid email address.')
      return
    }

    setIsEditSubmitting(true)
    setEditError('')

    const payload = {
      clientCode: editForm.clientCode,
      companyName,
      contactPerson: editForm.contactPerson.trim(),
      email,
      tin: editForm.tin.trim(),
      phone: editForm.phone.trim(),
      address: editForm.address.trim(),
      birthdate: editForm.dateOfBirth || null,
      dateOfIncorporation: editForm.dateOfIncorporation || null,
      status: editForm.status,
    }

    try {
      const updatedClient = await updateClient(clientToEdit.id, payload)

      setClientRows((currentRows) =>
        currentRows.map((client) =>
          client.id === clientToEdit.id
            ? { ...client, ...(updatedClient || payload), birthdate: updatedClient?.birthdate ?? payload.birthdate }
            : client,
        ),
      )
      setClientToEdit(null)
      setEditError('')
      setSuccessMessage('Client information updated successfully.')
    } catch (requestError) {
      setEditError(
        requestError.response?.data?.message ||
          'Unable to update client. Please try again.',
      )
    } finally {
      setIsEditSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-50 via-slate-100 to-sky-50 p-8 shadow-md shadow-slate-200/50 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
                Client Management
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Clients
              </h1>

              <nav className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="font-medium text-slate-500">Dashboard</span>
                <span>/</span>
                <span className="font-semibold text-slate-900">Clients</span>
              </nav>
            </div>

            <button
              type="button"
              onClick={handleAddClient}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Add Client
            </button>
          </div>
        </section>

        {isLoading ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={`loading-card-${index}`}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70"
              >
                <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
                <div className="mt-6 h-4 w-24 animate-pulse rounded-full bg-slate-200" />
                <div className="mt-4 h-9 w-20 animate-pulse rounded-xl bg-slate-200" />
                <div className="mt-3 h-4 w-32 animate-pulse rounded-full bg-slate-200" />
              </div>
            ))}
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon

              return (
                <article
                  key={card.title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${card.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <p className="mt-6 text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                    {card.value}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">{card.description}</p>
                </article>
              )
            })}
          </section>
        )}

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search clients"
                aria-label="Search clients"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter clients by status"
                  className="appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>

              <button
                type="button"
                onClick={handleAddClient}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <Plus className="h-4 w-4" />
                New Client
              </button>
            </div>
          </div>

          {successMessage ? (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <UserCheck className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>
                <p className="font-semibold">Unable to load clients</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          ) : null}

          {!isLoading && !error ? (
            <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-600">
              <p>
                Showing <span className="font-semibold text-slate-900">{filteredClients.length}</span> of{' '}
                <span className="font-semibold text-slate-900">{clientRows.length}</span> clients
              </p>
            </div>
          ) : null}

          {isLoading ? (
            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-500">
                <LoaderCircle className="h-4 w-4 animate-spin text-sky-600" />
                Loading client data...
              </div>
              <div className="space-y-3 p-4">
                {Array.from({ length: 5 }, (_, index) => (
                  <div
                    key={`loading-row-${index}`}
                    className="grid grid-cols-11 gap-4 rounded-2xl border border-slate-200 bg-white p-3"
                  >
                    {Array.from({ length: 11 }, (_, rowIndex) => (
                      <div
                        key={`loading-cell-${index}-${rowIndex}`}
                        className="h-5 animate-pulse rounded-full bg-slate-200"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {!isLoading && !error && filteredClients.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">No clients found</h3>
              <p className="mt-2 text-sm text-slate-500">
                Try adjusting your search or status filter.
              </p>
            </div>
          ) : null}

          {!isLoading && !error && filteredClients.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-[1200px] w-full border-separate border-spacing-y-2 text-left">
                <thead>
                  <tr className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    <th className="px-4 py-3">Client Code</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Contact Person</th>
                    {/* <th className="px-4 py-3">Birthdate</th> */}
                    <th className="px-4 py-3">Date of Incorporation</th>
                    {/* <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">TIN</th> */}
                    <th className="px-4 py-3">Phone</th>
                    {/* <th className="px-4 py-3">Address</th> */}
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredClients.map((client) => {
                    const status = normalizeStatus(client.status)
                    const isActive = status === 'ACTIVE'
                    const companyName = formatCellValue(client.companyName)
                    const contactPerson = formatCellValue(client.contactPerson)
                    const clientCode = formatCellValue(client.clientCode)
                    const phone = formatCellValue(client.phone)

                    return (
                      <tr
                        key={client.id ?? `${client.clientCode ?? 'client'}-${client.companyName ?? 'name'}`}
                        className="rounded-2xl bg-slate-50 shadow-sm transition duration-200 hover:bg-slate-100/80"
                      >
                        <td className="rounded-l-2xl border border-slate-200 border-r-0 px-4 py-4 align-middle text-sm font-semibold text-slate-900">
                          <span title={clientCode === '—' ? '' : clientCode} className="block max-w-[120px] truncate">
                            {clientCode}
                          </span>
                        </td>

                        <td className="border border-slate-200 border-l-0 border-r-0 px-4 py-4 align-middle text-sm text-slate-700">
                          <span title={companyName === '—' ? '' : companyName} className="block max-w-[180px] truncate">
                            {companyName}
                          </span>
                        </td>

                        <td className="border border-slate-200 border-l-0 border-r-0 px-4 py-4 align-middle text-sm text-slate-700">
                          <span title={contactPerson === '—' ? '' : contactPerson} className="block max-w-[150px] truncate">
                            {contactPerson}
                          </span>
                        </td>
                        <td className="border border-slate-200 border-l-0 border-r-0 px-4 py-4 align-middle text-sm text-slate-700">
                          {formatDate(client.dateOfIncorporation)}
                        </td>

                        {/* <td className="border border-slate-200 border-l-0 border-r-0 px-4 py-4 align-middle text-sm text-slate-700">
                          {formatDate(client.birthdate)}
                        </td>

                        <td className="border border-slate-200 border-l-0 border-r-0 px-4 py-4 align-middle text-sm text-slate-700">
                          {formatDate(client.dateOfIncorporation)}
                        </td>

                        <td className="border border-slate-200 border-l-0 border-r-0 px-4 py-4 align-middle text-sm text-slate-700">
                          <span title={email === '—' ? '' : email} className="block max-w-[200px] truncate">
                            {email}
                          </span>
                        </td> */}

                        {/* <td className="border border-slate-200 border-l-0 border-r-0 px-4 py-4 align-middle text-sm text-slate-700">
                          <span title={tin === '—' ? '' : tin} className="block max-w-[120px] truncate">
                            {tin}
                          </span>
                        </td> */}

                        <td className="border border-slate-200 border-l-0 border-r-0 px-4 py-4 align-middle text-sm text-slate-700">
                          <span title={phone === '—' ? '' : phone} className="block max-w-[140px] truncate">
                            {phone}
                          </span>
                        </td>

                        {/* <td className="border border-slate-200 border-l-0 border-r-0 px-4 py-4 align-middle text-sm text-slate-700">
                          <span title={address === '—' ? '' : address} className="block max-w-[220px] truncate">
                            {address}
                          </span>
                        </td> */}

                        <td className="border border-slate-200 border-l-0 border-r-0 px-4 py-4 align-middle">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td className="rounded-r-2xl border border-slate-200 border-l-0 px-4 py-4 align-middle">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              title="View client"
                              aria-label={`View ${companyName === '—' ? 'client' : companyName}`}
                              onClick={() => handleViewClient(client.id)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition duration-200 hover:border-sky-300 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              title="Edit client"
                              aria-label={`Edit ${companyName === '—' ? 'client' : companyName}`}
                              onClick={() => handleEditClient(client)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700 transition duration-200 hover:border-sky-300 hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-200"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              title="Delete client"
                              aria-label={`Delete ${companyName === '—' ? 'client' : companyName}`}
                              onClick={() => handleDeactivateClick(client)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition duration-200 hover:border-rose-300 hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>

      {clientToEdit ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEditModal()
            }
          }}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-client-title"
            onSubmit={handleUpdateClient}
            className="my-8 w-full max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                  Client Management
                </p>
                <h2 id="edit-client-title" className="mt-2 text-2xl font-semibold text-slate-950">
                  Edit Client Information
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Update the information for this client.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={isEditSubmitting}
                aria-label="Close edit client dialog"
                className="rounded-xl p-2 text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {editError ? (
              <p role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {editError}
              </p>
            ) : null}

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="edit-client-code" className="text-sm font-medium text-slate-700">
                  Client Code
                </label>
                <input
                  id="edit-client-code"
                  name="clientCode"
                  type="text"
                  value={editForm.clientCode}
                  readOnly
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="edit-company-name" className="text-sm font-medium text-slate-700">
                  Company Name <span className="text-rose-600">*</span>
                </label>
                <input
                  id="edit-company-name"
                  name="companyName"
                  type="text"
                  value={editForm.companyName}
                  onChange={handleEditFormChange}
                  disabled={isEditSubmitting}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor="edit-contact-person" className="text-sm font-medium text-slate-700">
                  Contact Person
                </label>
                <input
                  id="edit-contact-person"
                  name="contactPerson"
                  type="text"
                  value={editForm.contactPerson}
                  onChange={handleEditFormChange}
                  disabled={isEditSubmitting}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor="edit-email" className="text-sm font-medium text-slate-700">
                  Email <span className="text-rose-600">*</span>
                </label>
                <input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                  disabled={isEditSubmitting}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor="edit-tin" className="text-sm font-medium text-slate-700">
                  TIN
                </label>
                <input
                  id="edit-tin"
                  name="tin"
                  type="text"
                  value={editForm.tin}
                  onChange={handleEditFormChange}
                  disabled={isEditSubmitting}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor="edit-phone" className="text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  id="edit-phone"
                  name="phone"
                  type="text"
                  value={editForm.phone}
                  onChange={handleEditFormChange}
                  disabled={isEditSubmitting}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor="edit-date-of-birth" className="text-sm font-medium text-slate-700">
                  Date of Birth
                </label>
                <input
                  id="edit-date-of-birth"
                  name="dateOfBirth"
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={handleEditFormChange}
                  disabled={isEditSubmitting}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor="edit-date-of-incorporation" className="text-sm font-medium text-slate-700">
                  Date of Incorporation
                </label>
                <input
                  id="edit-date-of-incorporation"
                  name="dateOfIncorporation"
                  type="date"
                  value={editForm.dateOfIncorporation}
                  onChange={handleEditFormChange}
                  disabled={isEditSubmitting}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor="edit-status" className="text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  id="edit-status"
                  name="status"
                  value={editForm.status}
                  onChange={handleEditFormChange}
                  disabled={isEditSubmitting}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="edit-address" className="text-sm font-medium text-slate-700">
                  Address
                </label>
                <textarea
                  id="edit-address"
                  name="address"
                  rows="3"
                  value={editForm.address}
                  onChange={handleEditFormChange}
                  disabled={isEditSubmitting}
                  className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
                />
              </div>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeEditModal}
                disabled={isEditSubmitting}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isEditSubmitting}
                className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isEditSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {clientToDeactivate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <AlertCircle className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">Deactivate Client?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Are you sure you want to deactivate{' '}
                  <span className="font-semibold text-slate-900">
                    {clientToDeactivate.companyName || clientToDeactivate.clientCode || 'this client'}
                  </span>
                  ?
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setClientToDeactivate(null)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDeactivate}
                className="rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
