'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateSiteSettings(data: Partial<Parameters<typeof prisma.siteSettings.update>[0]['data']>) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  await prisma.siteSettings.update({
    where: { id: "singleton" },
    data,
  })

  revalidatePath('/', 'layout')
  
  return { success: true }
}

export async function updateServices(services: any[]) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  await prisma.$transaction(async (tx) => {
    await tx.service.deleteMany()
    await tx.service.createMany({
      data: services.map((s, i) => ({
        title: s.title,
        mode: s.mode,
        price: s.price,
        originalPrice: s.originalPrice,
        durationMin: s.durationMin,
        description: s.description || null,
        isPopular: s.isPopular,
        isActive: s.isActive ?? true,
        order: i,
      }))
    })
  })

  revalidatePath('/', 'layout')
  
  return { success: true }
}


export async function updateAboutData(data: { title: string, body: string, stats: any[], aboutImageUrl: string }) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  await prisma.$transaction(async (tx) => {
    await tx.siteSettings.update({
      where: { id: "singleton" },
      data: {
        aboutTitle: data.title,
        aboutBody: data.body,
        aboutImageUrl: data.aboutImageUrl,
      }
    })
    await tx.stat.deleteMany()
    await tx.stat.createMany({
      data: data.stats.map((s, i) => ({
        label: s.label,
        value: s.value,
        icon: s.icon,
        order: i,
      }))
    })
  })

  revalidatePath('/', 'layout')
  
  return { success: true }
}

export async function updateContactData(data: {
  phone: string,
  whatsapp: string,
  email: string,
  upiNumber: string,
  address: string,
  mapEmbedUrl: string,
  hours: any[]
}) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  await prisma.$transaction(async (tx) => {
    await tx.siteSettings.update({
      where: { id: "singleton" },
      data: {
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        upiNumber: data.upiNumber,
        address: data.address,
        mapEmbedUrl: data.mapEmbedUrl,
      }
    })
    
    for (const h of data.hours) {
      await tx.businessHour.upsert({
        where: { day: h.day },
        update: { openTime: h.openTime, closeTime: h.closeTime, isClosed: h.isClosed },
        create: { day: h.day, openTime: h.openTime, closeTime: h.closeTime, isClosed: h.isClosed }
      })
    }
  })

  revalidatePath('/', 'layout')
  
  return { success: true }
}

export async function updateMedia(data: { 
  images: { imageUrl: string, publicId: string }[], 
  videos: { youtubeUrl: string, videoId: string, title?: string }[] 
}) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  // Gallery
  await prisma.galleryItem.deleteMany()
  if (data.images.length > 0) {
    await prisma.galleryItem.createMany({
      data: data.images.map((img, i) => ({
        imageUrl: img.imageUrl,
        publicId: img.publicId,
        order: i,
      }))
    })
  }

  // Videos
  await prisma.video.deleteMany()
  if (data.videos.length > 0) {
    await prisma.video.createMany({
      data: data.videos.map((vid, i) => ({
        youtubeUrl: vid.youtubeUrl,
        videoId: vid.videoId,
        title: vid.title,
        order: i,
      }))
    })
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateCertifications(certifications: { title: string, issuer?: string, year?: string, imageUrl?: string }[]) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.certification.deleteMany()
  
  if (certifications.length > 0) {
    await prisma.certification.createMany({
      data: certifications.map((cert, i) => ({
        title: cert.title,
        issuer: cert.issuer,
        year: cert.year,
        imageUrl: cert.imageUrl,
        order: i,
      }))
    })
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
