import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { name, email, company, phone, address, notes, tags, status } = body

    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!client) {
      return new NextResponse('Client not found', { status: 404 })
    }

    const updatedClient = await prisma.client.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        email,
        company,
        phone,
        address,
        notes,
        tags,
        status,
      },
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error('Error updating client:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        projects: true,
      },
    })

    if (!client) {
      return new NextResponse('Client not found', { status: 404 })
    }

    // Delete all projects associated with the client
    await prisma.project.deleteMany({
      where: {
        clientId: params.id,
      },
    })

    // Delete the client
    await prisma.client.delete({
      where: {
        id: params.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting client:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 