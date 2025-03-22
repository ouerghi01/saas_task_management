import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/config'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const prisma = new PrismaClient()

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in.' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    })

    if (!user?.subscription?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found.' },
        { status: 400 }
      )
    }

    // Cancel the subscription at period end
    await stripe.subscriptions.update(
      user.subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    )

    // Update subscription status in database
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: 'canceled',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Error canceling subscription.' },
      { status: 500 }
    )
  }
} 