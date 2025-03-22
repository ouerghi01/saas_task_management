'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Feedback {
  id: string
  type: string
  title: string
  description: string
  status: string
  priority: string
  votes: number
  createdAt: Date
  user: {
    name: string | null
    email: string | null
  }
}

interface FeedbackListProps {
  feedback: Feedback[]
  userId: string
}

export function FeedbackList({ feedback, userId }: FeedbackListProps) {
  const router = useRouter()
  const [voting, setVoting] = useState<string | null>(null)

  async function handleVote(feedbackId: string) {
    setVoting(feedbackId)
    try {
      const response = await fetch('/api/feedback/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId, userId }),
      })

      if (!response.ok) {
        throw new Error('Failed to vote')
      }

      router.refresh()
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setVoting(null)
    }
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Recent Feedback
        </h3>
        <div className="mt-5 space-y-6">
          {feedback.map((item) => (
            <div
              key={item.id}
              className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {item.description}
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {item.type}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {item.priority}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {item.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleVote(item.id)}
                  disabled={voting === item.id}
                  className="ml-4 flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{item.votes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 