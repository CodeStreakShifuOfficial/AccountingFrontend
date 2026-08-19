import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import { getStoredUser } from '../api/auth'
import {
  ArrowLeft,
  CalendarDays,
  Download,
  Eye,
  FileText,
  FolderOpen,
  Pencil,
  Search,
  Upload,
  Trash2,
} from 'lucide-react'

const categoryLabels = {
  bir: 'BIR Files',
  sec: 'SEC Files',
  'city-hall': 'City Hall Files',
  company: 'Company Papers',
  financial: 'Financial Statements',
  payroll: 'Payroll Documents',
}

const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')

const formatDate = (value) => {
  if (!value) return 'Not available'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

const formatBytes = (value) => {
  const bytes = Number(value)
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 Bytes'
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`
}

export default function DocumentList() {
  const navigate = useNavigate()
  const { clientId, category } = useParams()
  const [folders, setFolders] = useState([])
  const [documents, setDocuments] = useState([])
  const [selectedFolderId, setSelectedFolderId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [operationError, setOperationError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [processingDocumentId, setProcessingDocumentId] = useState(null)
  const [processingAction, setProcessingAction] = useState('')
  const [documentToRename, setDocumentToRename] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [documentToDelete, setDocumentToDelete] = useState(null)
  const user = getStoredUser()
  const userRole = String(user?.role || '').toUpperCase()
  const canDelete = ['OWNER', 'ACCOUNTANT', 'ACCOUNT'].includes(userRole)

  const loadData = async (keepSelected = true) => {
    setIsLoading(true)
    setError('')
    try {
      const [mainFoldersResponse, documentsResponse] = await Promise.all([
        api.get(`/clients/${clientId}/folders/main`),
        api.get(`/clients/${clientId}/documents`),
      ])
      const mainFolders = Array.isArray(mainFoldersResponse.data) ? mainFoldersResponse.data : []
      const documentsData = Array.isArray(documentsResponse.data) ? documentsResponse.data : []
      const categoryFolder = mainFolders.find((folder) => {
        const name = String(folder.folderName || '').toLowerCase()
        return (categoryLabels[category] || category).toLowerCase() === name || slugify(name) === category
      })
      const subfoldersResponse = categoryFolder
        ? await api.get(`/folders/${categoryFolder.id}/subfolders`)
        : { data: [] }
      const subfolders = Array.isArray(subfoldersResponse.data) ? subfoldersResponse.data : []
      const availableFolders = subfolders.length ? subfolders : categoryFolder ? [categoryFolder] : []
      setFolders(availableFolders.map((folder) => ({
        ...folder,
        label: folder.folderName || 'Unnamed folder',
        description: 'Documents for this category',
        year: folder.folderName?.match(/\d{4}/)?.[0] || 'Folder',
      })))
      setDocuments(documentsData)
      setSelectedFolderId((current) => keepSelected && availableFolders.some((folder) => folder.id === current)
        ? current
        : availableFolders[0]?.id || null)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load folders and documents.')
      setFolders([])
      setDocuments([])
      setSelectedFolderId(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData(false)
  }, [clientId, category])

  const selectedFolder = folders.find((folder) => folder.id === selectedFolderId) || null
  const meta = { title: selectedFolder?.label || categoryLabels[category] || category || 'Documents', description: selectedFolder?.description || 'Files ready for review.' }
  const selectedDocuments = documents.filter((document) => document.folderId === selectedFolderId)
  const filteredDocuments = selectedDocuments.filter((document) => {
    const term = searchTerm.toLowerCase().trim()
    return !term || `${document.originalFilename || ''} ${document.fileType || ''}`.toLowerCase().includes(term)
  })

  const handleCreateFolder = async (event) => {
    event.preventDefault()
    const name = folderName.trim()
    if (!name) {
      setOperationError('Folder name is required.')
      return
    }
    if (!user?.id) {
      setOperationError('Your authenticated user could not be identified.')
      return
    }
    setIsCreatingFolder(true)
    setOperationError('')
    try {
      const response = await api.post(`/clients/${clientId}/folders`, null, { params: { folderName: name, userId: Number(user.id) } })
      await loadData(false)
      if (response.data?.id) setSelectedFolderId(response.data.id)
      setFolderName('')
      setShowFolderModal(false)
    } catch (requestError) {
      setOperationError(requestError.response?.data?.message || 'Unable to create folder.')
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const handleDeleteFolder = async (event, folder) => {
    event.stopPropagation()
    const folderDocuments = documents.filter((document) => document.folderId === folder.id)
    if (folderDocuments.length) {
      setOperationError('This folder contains documents and cannot be deleted.')
      return
    }
    if (!window.confirm(`Delete the folder "${folder.label}"?`)) return
    try {
      await api.delete(`/folders/${folder.id}`)
      await loadData(false)
    } catch (requestError) {
      setOperationError(requestError.response?.data?.message || 'Unable to delete folder.')
    }
  }

  const handleUploadFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file || !selectedFolder) return
    if (!user?.id) {
      setOperationError('Your authenticated user could not be identified.')
      return
    }
    setIsUploading(true)
    setOperationError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      await api.post(`/clients/${clientId}/folders/${selectedFolder.id}/documents`, formData, {
        params: { userId: Number(user.id) },
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await loadData()
    } catch (requestError) {
      setOperationError(requestError.response?.data?.message || 'Unable to upload file.')
    } finally {
      setIsUploading(false)
      setFileInputKey((current) => current + 1)
    }
  }

  const getDocumentBlob = async (documentId, endpoint) => {
    const response = await api.get(`/documents/${documentId}/${endpoint}`, {
      responseType: 'blob',
    })

    return {
      blob: new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream',
      }),
      filename: response.headers['content-disposition']?.match(/filename="?([^";]+)"?/i)?.[1],
    }
  }

  const isPreviewable = (file) => {
    const fileType = String(file.fileType || '').toLowerCase()
    const filename = String(file.originalFilename || '').toLowerCase()

    return (
      fileType === 'application/pdf' ||
      fileType.startsWith('image/') ||
      fileType.startsWith('text/') ||
      ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.txt', '.svg'].some((extension) =>
        filename.endsWith(extension),
      )
    )
  }

  const runDocumentAction = async (documentId, action, callback) => {
    setProcessingDocumentId(documentId)
    setProcessingAction(action)
    setOperationError('')
    setSuccessMessage('')

    try {
      await callback()
    } catch (requestError) {
      setOperationError(
        requestError.response?.data?.message ||
          `Unable to ${action.toLowerCase()} this document.`,
      )
    } finally {
      setProcessingDocumentId(null)
      setProcessingAction('')
    }
  }

  const handleViewFile = (file) => {
    if (!isPreviewable(file)) {
      setOperationError('This file type cannot be previewed in the browser. Use Download to open it.')
      return
    }

    const previewWindow = window.open('', '_blank', 'noopener,noreferrer')

    if (!previewWindow) {
      setOperationError('Please allow pop-ups to preview this document.')
      return
    }

    runDocumentAction(file.id, 'Viewing', async () => {
      try {
        const { blob } = await getDocumentBlob(file.id, 'content')
        const url = URL.createObjectURL(blob)
        previewWindow.location.href = url
        window.setTimeout(() => URL.revokeObjectURL(url), 60000)
      } catch (requestError) {
        previewWindow.close()
        throw requestError
      }
    })
  }

  const handleDownloadFile = (file) => {
    runDocumentAction(file.id, 'Downloading', async () => {
      const { blob } = await getDocumentBlob(file.id, 'download')
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.originalFilename || 'document'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setSuccessMessage('Document downloaded successfully.')
    })
  }

  const getFileExtension = (filename = '') => {
    const lastDot = filename.lastIndexOf('.')
    return lastDot > 0 ? filename.slice(lastDot) : ''
  }

  const handleRenameDocument = async (event) => {
    event.preventDefault()
    const trimmedName = renameValue.trim()
    const extension = getFileExtension(documentToRename?.originalFilename)

    if (!trimmedName) {
      setOperationError('Filename is required.')
      return
    }

    if (/[\\/:*?"<>|]/.test(trimmedName)) {
      setOperationError('Filename contains invalid characters.')
      return
    }

    const nextFilename = extension && !trimmedName.toLowerCase().endsWith(extension.toLowerCase())
      ? `${trimmedName}${extension}`
      : trimmedName

    await runDocumentAction(documentToRename.id, 'Renaming', async () => {
      const response = await api.put(`/documents/${documentToRename.id}/rename`, null, {
        params: { filename: nextFilename },
      })
      setDocuments((currentDocuments) => currentDocuments.map((document) => (
        document.id === documentToRename.id
          ? { ...document, ...response.data, originalFilename: response.data.originalFilename || nextFilename }
          : document
      )))
      setDocumentToRename(null)
      setRenameValue('')
      setSuccessMessage('Document renamed successfully.')
    })
  }

  const handleDeleteDocument = () => {
    runDocumentAction(documentToDelete.id, 'Deleting', async () => {
      await api.delete(`/documents/${documentToDelete.id}`)
      setDocuments((currentDocuments) => currentDocuments.filter((document) => document.id !== documentToDelete.id))
      setDocumentToDelete(null)
      setSuccessMessage('Document deleted successfully.')
    })
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-50 via-slate-100 to-sky-50 p-8 shadow-md shadow-slate-200/60 sm:p-10">
          <button
            type="button"
            onClick={() => navigate(`/documents/${clientId}/${category}`)}
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
                <button type="button" onClick={() => { setOperationError(''); setFolderName(''); setShowFolderModal(true) }} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition duration-300 hover:border-sky-300 hover:text-sky-600">
                  <FolderOpen className="h-4 w-4" />
                  Create Folder
                </button>
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-sky-500">
                  <Upload className="h-4 w-4" />
                  {isUploading ? 'Uploading...' : 'Upload File'}
                  <input key={fileInputKey} type="file" className="hidden" onChange={handleUploadFile} disabled={isUploading || !selectedFolder} />
                </label>
              </div>
            </div>

            {operationError ? <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{operationError}</p> : null}

            <div className="grid gap-4 md:grid-cols-2">
              {folders.map((folder) => (
                <div
                  key={folder.id}
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
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{folder.label}</p>
                      <p className="mt-1 text-sm text-slate-500">{folder.description}</p>
                    </div>
                    <button type="button" onClick={(event) => handleDeleteFolder(event, folder)} className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${folder.label}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{folder.year}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{documents.filter((document) => document.folderId === folder.id).length} Files</span>
                  </div>
                </div>
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
                    <p className="text-xl font-semibold text-slate-950">{selectedFolder?.label || 'No folder selected'}</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">Year</span>
                  {selectedFolder?.year || 'Folder'}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search documents"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div className="flex gap-3">
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-300 hover:border-slate-300 hover:bg-slate-50">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  {selectedFolder?.year || 'Folder'} Folder
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
                {filteredDocuments.map((file) => (
                  <tr key={file.id} className="rounded-2xl bg-slate-50 shadow-sm">
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-sky-100 p-2 text-sky-700">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{file.originalFilename || 'Unnamed file'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle text-sm text-slate-700">{file.fileType || 'Unknown'}</td>
                    <td className="px-4 py-4 align-middle text-sm text-slate-700">{formatDate(file.createdAt)}</td>
                    <td className="px-4 py-4 align-middle text-sm text-slate-700">{formatBytes(file.fileSize)}</td>
                    <td className="px-4 py-4 align-middle">
                      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Stored
                      </span>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" title="View document" onClick={() => handleViewFile(file)} disabled={processingDocumentId === file.id} className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 transition duration-300 hover:border-sky-300 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-50" aria-label={`View ${file.originalFilename || 'file'}`}>
                          <Eye className="h-4 w-4" />
                        </button>
                        <button type="button" title="Download document" onClick={() => handleDownloadFile(file)} disabled={processingDocumentId === file.id} className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 transition duration-300 hover:border-sky-300 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-50" aria-label={`Download ${file.originalFilename || 'file'}`}>
                          <Download className="h-4 w-4" />
                        </button>
                        <button type="button" title="Rename document" onClick={() => { setOperationError(''); setSuccessMessage(''); setDocumentToRename(file); setRenameValue(file.originalFilename || '') }} disabled={processingDocumentId === file.id} className="rounded-2xl border border-sky-200 bg-sky-50 p-2 text-sky-700 transition duration-300 hover:border-sky-300 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50" aria-label={`Rename ${file.originalFilename || 'file'}`}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        {canDelete ? <button type="button" title="Delete document" onClick={() => { setOperationError(''); setSuccessMessage(''); setDocumentToDelete(file) }} disabled={processingDocumentId === file.id} className="rounded-2xl border border-rose-200 bg-rose-50 p-2 text-rose-600 transition duration-300 hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50" aria-label={`Delete ${file.originalFilename || 'file'}`}>
                          <Trash2 className="h-4 w-4" />
                        </button> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {successMessage ? (
            <p role="status" className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </p>
          ) : null}
        </section>
      </div>

      {documentToRename ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="rename-document-title"
            onSubmit={handleRenameDocument}
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <h2 id="rename-document-title" className="text-xl font-semibold text-slate-950">
              Rename Document
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              The existing file extension will be preserved automatically.
            </p>
            <label htmlFor="document-name" className="mt-5 block text-sm font-medium text-slate-700">
              Filename
            </label>
            <input
              id="document-name"
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              autoFocus
              disabled={processingDocumentId === documentToRename.id}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
            />
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setDocumentToRename(null)} disabled={processingDocumentId === documentToRename.id} className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={processingDocumentId === documentToRename.id} className="rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50">
                {processingDocumentId === documentToRename.id && processingAction === 'Renaming' ? 'Renaming...' : 'Rename'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {documentToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-document-title"
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <h2 id="delete-document-title" className="text-xl font-semibold text-slate-950">
              Delete Document?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-slate-900">&quot;{documentToDelete.originalFilename || 'this document'}&quot;</span>?
            </p>
            <p className="mt-2 text-sm text-rose-600">This action cannot be undone.</p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setDocumentToDelete(null)} disabled={processingDocumentId === documentToDelete.id} className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                Cancel
              </button>
              <button type="button" onClick={handleDeleteDocument} disabled={processingDocumentId === documentToDelete.id} className="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50">
                {processingDocumentId === documentToDelete.id && processingAction === 'Deleting' ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
