import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../auth/[...nextauth]/config'

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

    const { userId, type, title, description, priority, attachments } = await request.json()

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        type,
        title,
        description,
        priority,
        attachments,
      },
    })

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Error creating feedback:', error)
    return NextResponse.json(
      { error: 'Error creating feedback' },
      { status: 500 }
    )
  }
} 