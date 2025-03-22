import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    })

    if (!user?.subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 403 }
      )
    }

    // Check if subscription is active or if trial hasn't ended
    const now = new Date()
    const isTrialActive = user.subscription.trialEndsAt && user.subscription.trialEndsAt > now
    const isSubscriptionActive = user.subscription.status === 'active'

    if (!isSubscriptionActive && !isTrialActive) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 403 }
      )
    }

    return NextResponse.json({ 
      status: 'active',
      isTrial: isTrialActive,
      trialEndsAt: user.subscription.trialEndsAt
    })
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 