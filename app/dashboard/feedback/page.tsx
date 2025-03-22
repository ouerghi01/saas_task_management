import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/config'
import { PrismaClient } from '@prisma/client'
import { FeedbackForm } from '@/components/feedback/FeedbackForm'
import { FeedbackList } from '@/components/feedback/FeedbackList'

const prisma = new PrismaClient()

export default async function FeedbackPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    redirect('/auth/signin')
  }

  const feedback = await prisma.feedback.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      votes: 'desc',
    },
  })

  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Feedback & Feature Requests
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Share your thoughts and help us improve the platform
            </p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <FeedbackForm userId={user.id} />
          </div>
          <div>
            <FeedbackList feedback={feedback} userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  )
} 