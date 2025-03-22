import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { feedbackId, userId } = await request.json()

    // Check if user has already voted
    const existingVote = await prisma.userVote.findUnique({
      where: {
        userId_feedbackId: {
          userId,
          feedbackId,
        },
      },
    })

    if (existingVote) {
      return NextResponse.json(
        { error: 'Already voted' },
        { status: 400 }
      )
    }

    // Create vote and increment feedback votes
    await prisma.$transaction([
      prisma.userVote.create({
        data: {
          userId,
          feedbackId,
        },
      }),
      prisma.feedback.update({
        where: { id: feedbackId },
        data: {
          votes: {
            increment: 1,
          },
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error voting:', error)
    return NextResponse.json(
      { error: 'Error voting' },
      { status: 500 }
    )
  }
} 