import React from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/config'
import { PrismaClient } from '@prisma/client'
import { ClientForm } from '@/components/clients/ClientForm'

const prisma = new PrismaClient()

export default async function EditClientPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const client = await prisma.client.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  })

  if (!client) {
    redirect('/dashboard/clients')
  }

  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Edit Client
            </h2>
          </div>
        </div>
        <div className="mt-8">
          <ClientForm client={client} />
        </div>
      </div>
    </div>
  )
} 