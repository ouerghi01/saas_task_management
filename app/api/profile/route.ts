import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]/config'
import { compare, hash } from 'bcryptjs'

const prisma = new PrismaClient()

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { currentPassword, newPassword, ...updateData } = data

    // If trying to update password
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })

      if (!user?.password) {
        return NextResponse.json(
          { error: 'Password update not supported for this account' },
          { status: 400 }
        )
      }

      const isValid = await compare(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      updateData.password = await hash(newPassword, 12)
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    })

    // Remove sensitive data
    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
} 