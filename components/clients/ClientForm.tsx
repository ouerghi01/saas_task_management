'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

type Client = {
  id: string
  name: string
  email: string
  company: string | null
  phone: string | null
  address: string | null
  notes: string | null
  tags: string[]
  status: string
}

type ClientFormProps = {
  client?: Client
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const company = formData.get('company') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const notes = formData.get('notes') as string
    const tags = (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean)
    const status = formData.get('status') as string

    try {
      const response = await fetch(client ? `/api/clients/${client.id}` : '/api/clients', {
        method: client ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company,
          phone,
          address,
          notes,
          tags,
          status,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Something went wrong')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Client Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="name"
            id="name"
            required
            defaultValue={client?.name}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Enter client name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <div className="mt-1">
          <input
            type="email"
            name="email"
            id="email"
            required
            defaultValue={client?.email}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Enter client email"
          />
        </div>
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700">
          Company
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="company"
            id="company"
            defaultValue={client?.company || ''}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Enter company name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone
        </label>
        <div className="mt-1">
          <input
            type="tel"
            name="phone"
            id="phone"
            defaultValue={client?.phone || ''}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <div className="mt-1">
          <textarea
            name="address"
            id="address"
            rows={3}
            defaultValue={client?.address || ''}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Enter address"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <div className="mt-1">
          <textarea
            name="notes"
            id="notes"
            rows={4}
            defaultValue={client?.notes || ''}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Enter any additional notes"
          />
        </div>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags (comma-separated)
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="tags"
            id="tags"
            defaultValue={client?.tags.join(', ') || ''}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Enter tags (e.g., VIP, Enterprise, etc.)"
          />
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <div className="mt-1">
          <select
            name="status"
            id="status"
            defaultValue={client?.status || 'ACTIVE'}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="LEAD">Lead</option>
            <option value="PROSPECT">Prospect</option>
          </select>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (client ? 'Updating...' : 'Creating...') : (client ? 'Update Client' : 'Create Client')}
        </button>
      </div>
    </form>
  )
} 