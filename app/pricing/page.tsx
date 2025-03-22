'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Try our platform free for 30 days',
    features: [
      '30-day free trial',
      'Up to 2 projects',
      'Basic task management',
      'Basic time tracking',
      'Email support',
      'Basic reporting',
    ],
    priceId: undefined,
    trial: true,
  },
  {
    name: 'Starter',
    price: '$29',
    description: 'Perfect for small teams and startups',
    features: [
      'Up to 5 projects',
      'Advanced task management',
      'Advanced time tracking',
      'Email support',
      'Basic integrations',
      'Advanced reporting',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
  },
  {
    name: 'Professional',
    price: '$79',
    description: 'For growing businesses',
    features: [
      'Up to 15 projects',
      'Advanced task management',
      'Advanced time tracking',
      'Priority support',
      'Custom integrations',
      'Advanced reporting',
      'Team collaboration tools',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID,
  },
  {
    name: 'Business',
    price: '$199',
    description: 'For large organizations',
    features: [
      'Unlimited projects',
      'Enterprise task management',
      'Advanced time tracking',
      '24/7 support',
      'Custom integrations',
      'Advanced reporting',
      'Team collaboration tools',
      'Dedicated account manager',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID,
  },
]

export default function PricingPage() {
  const { data: session } = useSession()
  console.log(session)
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string | undefined, plan: string, isTrial: boolean = false) => {
    
    if (isTrial) {
      try {
        setLoading(plan)
        setError(null)
        
        // Start the trial by creating a subscription with trial period
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            plan: 'free',
            trial: 'true',
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to start trial')
        }

        const { url } = await response.json()
        if (url) {
          window.location.href = url
        }
      } catch (error) {
        console.error('Error starting trial:', error)
        setError(error instanceof Error ? error.message : 'An error occurred')
        setLoading(null)
      }
      return
    }

    if (!priceId) {
      setError('Price ID not found. Please try again later.')
      return
    }

    try {
      setLoading(plan)
      setError(null)

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          priceId,
          plan,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
      setLoading(null)
    }
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            Pricing
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose the right plan for your team
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Start with our free 30-day trial and upgrade as you grow. No credit card required.
          </p>
        </div>
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-4 lg:gap-x-8 xl:gap-x-12">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10 ${
                tier.name === 'Free' ? 'ring-2 ring-indigo-600' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3
                    id={tier.name}
                    className="text-lg font-semibold leading-8 text-gray-900"
                  >
                    {tier.name}
                  </h3>
                  {tier.name === 'Free' && (
                    <span className="rounded-full bg-indigo-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-indigo-600">
                      Most popular
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    {tier.price}
                  </span>
                  {tier.price !== '$0' && (
                    <span className="text-sm font-semibold leading-6 text-gray-600">
                      /month
                    </span>
                  )}
                </p>
                <ul
                  role="list"
                  className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <svg
                        className="h-6 w-5 flex-none text-indigo-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleSubscribe(tier.priceId, tier.name.toLowerCase(), tier.trial)}
                disabled={loading === tier.name}
                className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${
                  tier.name === 'Free'
                    ? 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600'
                    : 'bg-gray-600 hover:bg-gray-500 focus-visible:outline-gray-600'
                }`}
              >
                {loading === tier.name ? 'Processing...' : tier.name === 'Free' ? 'Start Free Trial' : 'Get started'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 