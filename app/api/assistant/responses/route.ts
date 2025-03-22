import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../auth/[...nextauth]/config'

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
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const responses = await prisma.assistantResponse.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(responses)
  } catch (error) {
    console.error('Error fetching responses:', error)
    return NextResponse.json(
      { error: 'Error fetching responses' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { message, role, analysis, recommendations } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const response = await prisma.assistantResponse.create({
      data: {
        userId: user.id,
        message,
        role,
        analysis,
        recommendations
      }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error saving response:', error)
    return NextResponse.json(
      { error: 'Error saving response' },
      { status: 500 }
    )
  }
} 