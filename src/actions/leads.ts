'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function markLeadRead(id: string, isRead: boolean) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  await prisma.lead.update({ where: { id }, data: { isRead } })

  revalidatePath('/admin/bookings')

  return { success: true }
}

export async function deleteLead(id: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  await prisma.lead.delete({ where: { id } })

  revalidatePath('/admin/bookings')

  return { success: true }
}
