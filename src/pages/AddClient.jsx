import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, Save } from 'lucide-react'
import { createClient } from '../api/clients.js'

const initialForm = {
  clientCode: '',
  companyName: '',
  contactPerson: '',
  email: '',
  tin: '',
  phone: '',
  address: '',
  birthdate: '',
  dateOfIncorporation: '',
  status: 'ACTIVE',
}

export default function AddClient() {
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (
      !form.clientCode.trim() ||
      !form.companyName.trim() ||
      !form.email.trim()
    ) {
      setError('Client code, company name, and email are required.')
      return
    }

    setIsSubmitting(true)

    try {
      await createClient({
        clientCode: form.clientCode.trim(),
        companyName: form.companyName.trim(),
        contactPerson: form.contactPerson.trim(),
        email: form.email.trim(),
        tin: form.tin.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),

        // Send birthdate to the Spring Boot backend.
        birthdate: form.birthdate || null,

        // Send date of incorporation to the Spring Boot backend.
        dateOfIncorporation: form.dateOfIncorporation || null,

        status: form.status,
      })

      setSuccess('Client created successfully.')

      window.setTimeout(() => {
        navigate('/clients')
      }, 700)
    } catch (requestError) {
      const message = requestError.response?.data?.message

      setError(
        message ||
          'Unable to create client. Please check the form and try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-50 via-slate-100 to-sky-50 p-8 shadow-md shadow-slate-200/50 sm:p-10">

          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-sky-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Clients
          </button>

          <div className="mt-6 flex items-center gap-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
              <Building2 className="h-7 w-7" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
                Client Management
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Add Client
              </h1>
            </div>
          </div>
        </section>

        {/* Client Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70 sm:p-8"
        >
          <div className="grid gap-6 md:grid-cols-2">

            {/* Client Code */}
            <label>
              <span className="text-sm font-medium text-slate-700">
                Client Code <span className="text-rose-500">*</span>
              </span>

              <input
                name="clientCode"
                value={form.clientCode}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
            </label>

            {/* Company Name */}
            <label>
              <span className="text-sm font-medium text-slate-700">
                Company Name <span className="text-rose-500">*</span>
              </span>

              <input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
            </label>

            {/* Contact Person */}
            <label>
              <span className="text-sm font-medium text-slate-700">
                Contact Person
              </span>

              <input
                name="contactPerson"
                value={form.contactPerson}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
            </label>

            {/* Email */}
            <label>
              <span className="text-sm font-medium text-slate-700">
                Email <span className="text-rose-500">*</span>
              </span>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
            </label>

            {/* TIN */}
            <label>
              <span className="text-sm font-medium text-slate-700">
                TIN
              </span>

              <input
                name="tin"
                value={form.tin}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
            </label>

            {/* Phone */}
            <label>
              <span className="text-sm font-medium text-slate-700">
                Phone Number
              </span>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
            </label>

            {/* Birthdate */}
            <label>
              <span className="text-sm font-medium text-slate-700">
                Birthdate
              </span>

              <input
                type="date"
                name="birthdate"
                value={form.birthdate}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
            </label>

            {/* Date of Incorporation */}
            <label>
              <span className="text-sm font-medium text-slate-700">
                Date of Incorporation
              </span>

              <input
                type="date"
                name="dateOfIncorporation"
                value={form.dateOfIncorporation}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
            </label>

            {/* Address */}
            <label className="md:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                Address
              </span>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="3"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
            </label>

            {/* Status */}
            <label>
              <span className="text-sm font-medium text-slate-700">
                Status
              </span>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </label>
          </div>

          {/* Error Message */}
          {error ? (
            <p
              role="alert"
              className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </p>
          ) : null}

          {/* Success Message */}
          {success ? (
            <p
              role="status"
              className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              {success}
            </p>
          ) : null}

          {/* Buttons */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() => navigate('/clients')}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save className="h-4 w-4" />

              {isSubmitting ? 'Saving...' : 'Save Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}