'use client'
import React, { useState, useEffect } from 'react'
import { AssistantButton } from './AssistantButton'
import { AssistantModal } from './AssistantModal'

interface AssistantData {
  analysis: string
  recommendations: string
}

export function VirtualAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<AssistantData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchAssistantData() {
    if (loading) return
    
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/assistant')
      if (!response.ok) {
        throw new Error('Failed to fetch assistant data')
      }
      const data = await response.json()
      setData(data)
      setIsOpen(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load assistant data')
      console.error('Error fetching assistant data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Show error in modal if there is one
  useEffect(() => {
    if (error) {
      setIsOpen(true)
    }
  }, [error])

  return (
    <>
      <AssistantButton onClick={fetchAssistantData} isLoading={loading} />
      
      <AssistantModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        analysis={data?.analysis || null}
        recommendations={data?.recommendations || null}
        isLoading={loading}
      />

      {error && isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
            <p className="text-gray-500">{error}</p>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
} 