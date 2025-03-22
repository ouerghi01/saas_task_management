import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/config'
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

    const now = new Date();
    console.log(user.subscription.trialEndsAt);

    const trialEnd = new Date(user.subscription.trialEndsAt); // Convert to Date object
    const timeLeft: number = trialEnd.getTime() - now.getTime(); // Difference in milliseconds

    if (timeLeft <= 0) {
        console.log("Trial expired.");
    } else {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        console.log(`Trial ends in: ${days}d ${hours}h ${minutes}m ${seconds}s`);
    }

    const isTrialActive = user.subscription.trialEndsAt && user.subscription.trialEndsAt > now
    console.log(isTrialActive)
    const isSubscriptionActive = user.subscription.status === 'active'

    if (!isSubscriptionActive && !isTrialActive) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 403 }
      )
    }
    if (!isTrialActive && isSubscriptionActive){
      return NextResponse.json(
        { error: 'Trial has ended' },
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