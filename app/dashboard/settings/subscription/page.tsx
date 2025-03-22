import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { subscription: true },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  const subscription = user.subscription

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Subscription Details
            </h3>
            <div className="mt-5">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        subscription?.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {subscription?.status || 'No active subscription'}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Plan</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {subscription?.plan ? (
                      <span className="capitalize">{subscription.plan}</span>
                    ) : (
                      'No plan'
                    )}
                  </dd>
                </div>
                {subscription?.currentPeriodStart && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Current Period
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(
                        subscription.currentPeriodStart
                      ).toLocaleDateString()}{' '}
                      -{' '}
                      {subscription.currentPeriodEnd
                        ? new Date(
                            subscription.currentPeriodEnd
                          ).toLocaleDateString()
                        : 'N/A'}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            <div className="mt-5">
              {subscription?.status === 'active' ? (
                <div className="flex space-x-4">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Change Plan
                  </Link>
                  <form action="/api/cancel-subscription" method="POST">
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Cancel Subscription
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/pricing"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Choose a Plan
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 