'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Neon's serverless Postgres auto-suspends when idle and can take a few seconds to wake
// on the next query. Prisma's default transaction maxWait (2s) is too short to survive
// that cold start, causing a P2028 "Unable to start a transaction" error — so every
// $transaction here gets a longer budget.
const TX_OPTS = { maxWait: 10000, timeout: 15000 }

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
        durationUnit: s.durationUnit || "MIN",
        description: s.description || null,
        isPopular: s.isPopular,
        isActive: s.isActive ?? true,
        order: i,
      }))
    })
  }, TX_OPTS)

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
  }, TX_OPTS)

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
  facebookUrl: string,
  instagramUrl: string,
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
        facebookUrl: data.facebookUrl,
        instagramUrl: data.instagramUrl,
      }
    })
    
    for (const h of data.hours) {
      await tx.businessHour.upsert({
        where: { day: h.day },
        update: { openTime: h.openTime, closeTime: h.closeTime, isClosed: h.isClosed },
        create: { day: h.day, openTime: h.openTime, closeTime: h.closeTime, isClosed: h.isClosed }
      })
    }
  }, TX_OPTS)

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

export async function updateBanners(banners: {
  imageUrl: string
  publicId: string
  title?: string
  subtitle?: string
  linkUrl?: string
  isActive?: boolean
}[]) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const valid = banners.filter((b) => b.imageUrl)

  await prisma.$transaction(async (tx) => {
    await tx.banner.deleteMany()
    if (valid.length > 0) {
      await tx.banner.createMany({
        data: valid.map((b, i) => ({
          imageUrl: b.imageUrl,
          publicId: b.publicId,
          title: b.title || null,
          subtitle: b.subtitle || null,
          linkUrl: b.linkUrl || null,
          isActive: b.isActive ?? true,
          order: i,
        }))
      })
    }
  }, TX_OPTS)

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateCertifications(certifications: { title: string, issuer?: string, year?: string, imageUrl?: string, isActive?: boolean }[]) {
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
        isActive: cert.isActive ?? true,
        order: i,
      }))
    })
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateTestimonials(testimonials: {
  name: string
  location?: string
  rating: number
  message: string
  imageUrl?: string
  isActive?: boolean
}[]) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const valid = testimonials.filter((t) => t.name && t.message)

  await prisma.$transaction(async (tx) => {
    await tx.testimonial.deleteMany()
    if (valid.length > 0) {
      await tx.testimonial.createMany({
        data: valid.map((t, i) => ({
          name: t.name,
          location: t.location || null,
          rating: Math.min(5, Math.max(1, t.rating || 5)),
          message: t.message,
          imageUrl: t.imageUrl || null,
          isActive: t.isActive ?? true,
          order: i,
        }))
      })
    }
  }, TX_OPTS)

  revalidatePath('/', 'layout')
  return { success: true }
}
