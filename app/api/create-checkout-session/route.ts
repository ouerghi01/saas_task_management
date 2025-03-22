import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/config'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in.' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const priceId = formData.get('priceId') as string
    const plan = formData.get('plan') as string
    const isTrial = formData.get('trial') === 'true'

    // Get the base URL from the request
    const baseUrl = request.headers.get('origin') || 'http://localhost:3000'

    if (isTrial) {
      // Check if user already has a trial subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId: session.user.id,
          status: 'ACTIVE',
        },
      })

      if (existingSubscription) {
        return NextResponse.json(
          { error: 'You already have an active subscription.' },
          { status: 400 }
        )
      }

      // Create a trial subscription in the database
      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + 7)

      const subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          plan: 'FREE',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEndDate,
          trialEndsAt: trialEndDate,
        },
      })

      // Redirect to dashboard
      return NextResponse.json({ url: `${baseUrl}/dashboard` })
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required.' },
        { status: 400 }
      )
    }

    // Create or retrieve Stripe customer
    const customer = await stripe.customers.create({
      email: session.user.email,
      metadata: {
        userId: session.user.id,
      },
    })

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: {
        userId: session.user.id,
        plan: plan || 'starter',
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creating checkout session.' },
      { status: 500 }
    )
  }
} 