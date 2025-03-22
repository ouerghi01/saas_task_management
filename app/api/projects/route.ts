import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        client: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Project fetch error:', error)
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, description, clientId } = await request.json()

    // Validate input
    if (!name) {
      return NextResponse.json(
        { message: 'Project name is required' },
        { status: 400 }
      )
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId: session.user.id,
        ...(clientId ? { clientId } : {}),
      },
      include: {
        client: true,
      },
    })

    return NextResponse.json({
      message: 'Project created successfully',
      project,
    })
  } catch (error) {
    console.error('Project creation error:', error)
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
} 