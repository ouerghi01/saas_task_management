import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, email, company } = await request.json()

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { message: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Create client
    const client = await prisma.client.create({
      data: {
        name,
        email,
        company,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      message: 'Client created successfully',
      client,
    })
  } catch (error) {
    console.error('Client creation error:', error)
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const clients = await prisma.client.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        projects: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Client fetch error:', error)
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
} 