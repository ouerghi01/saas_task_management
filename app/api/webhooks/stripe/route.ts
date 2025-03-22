import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const prisma = new PrismaClient()

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature found.' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature.' },
        { status: 400 }
      )
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (!userId) {
          throw new Error('No user ID in session metadata')
        }

        // Update user's subscription status
        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: session.customer as string,
            subscription: {
              upsert: {
                create: {
                  stripeSubscriptionId: session.subscription as string,
                  status: 'active',
                  plan: session.metadata?.plan || 'starter',
                  currentPeriodStart: new Date(),
                  currentPeriodEnd: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days from now
                  ),
                  trialEndsAt: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                  ),
                },
                update: {
                  stripeSubscriptionId: session.subscription as string,
                  status: 'active',
                  plan: session.metadata?.plan || 'starter',
                  currentPeriodStart: new Date(),
                  currentPeriodEnd: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                  ),
                  trialEndsAt: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                  ),
                },
              },
            },
          },
        })
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by Stripe customer ID
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (!user) {
          throw new Error('No user found for customer ID')
        }

        // Update subscription status
        await prisma.subscription.update({
          where: { userId: user.id },
          data: {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Error processing webhook.' },
      { status: 500 }
    )
  }
} 