import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Hash the admin password
  const passwordHash = await bcrypt.hash('admin123', 10)

  // Admin user
  await prisma.adminUser.upsert({
    where: { email: 'drrahuljainastrology@gmail.com' },
    update: {},
    create: {
      email: 'drrahuljainastrology@gmail.com',
      passwordHash,
    },
  })

  // SiteSettings singleton
  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      businessName: 'Lunawat Astro Point',
      personName: 'Dr Rahul Jain',
      credentials: 'B.A.M.S., PGDip. in Ayu. Drug Standardisation (BHU), MBA',
      tagline: 'Specialisation: Vastu & Jyotish, K.P. system, Jyotish Vaachaspathi',
      heroHeadline: 'Unlock Your Cosmic Potential',
      heroSubtext: 'Expert astrology and Vastu consultations by Dr Rahul Jain with 23 years of experience.',
      languages: ['hindi', 'english', 'marathi'],
      experience: 23,
      phone: '+917775817080',
      whatsapp: '+917775817080',
      email: 'drrahuljain143@gmail.com',
      upiNumber: '', // User specified UPI not visible
      address: '', // City any for now
      aboutTitle: 'About Dr Rahul Jain',
      aboutBody: 'Dr Rahul Jain is a renowned astrologer and Vastu expert with over 23 years of experience. Specializing in Jyotish and the K.P. system, he has helped thousands of clients navigate life\'s challenges.',
      ctaTitle: 'Ready for a consultation?',
      ctaSubtext: 'Book your session today and gain clarity on your life\'s path.',
      isPublished: true,
    },
  })

  // Business Hours (0=Sun ... 6=Sat)
  const hours = [
    { day: 1, openTime: '10:00', closeTime: '19:00', isClosed: false },
    { day: 2, openTime: '10:00', closeTime: '19:00', isClosed: false },
    { day: 3, openTime: '10:00', closeTime: '19:00', isClosed: false },
    { day: 4, openTime: '10:00', closeTime: '19:00', isClosed: false },
    { day: 5, openTime: '10:00', closeTime: '19:00', isClosed: false },
    { day: 6, openTime: '10:00', closeTime: '19:00', isClosed: false },
    { day: 0, openTime: '10:00', closeTime: '19:00', isClosed: true }, // Sunday closed
  ]
  for (const h of hours) {
    await prisma.businessHour.upsert({
      where: { day: h.day },
      update: {},
      create: h,
    })
  }

  // 3 Services
  const services = [
    { title: 'Normal Consultation', mode: 'VIDEO_CALL', price: 501, originalPrice: 1100, durationMin: 30, isPopular: true, order: 1 },
    { title: 'Premium Consultation', mode: 'VIDEO_CALL', price: 1100, originalPrice: 2100, durationMin: 45, isPopular: false, order: 2 },
    { title: 'VIP Consultation', mode: 'IN_PERSON', price: 2100, originalPrice: 5100, durationMin: 60, isPopular: false, order: 3 },
  ]
  for (const s of services) {
    const existing = await prisma.service.findFirst({ where: { title: s.title } })
    if (!existing) {
      await prisma.service.create({ data: s })
    }
  }

  // 2 Stats
  const stats = [
    { label: 'Happy Clients', value: '1,000+', icon: 'smile', order: 1 },
    { label: 'Consultations Done', value: '2,000+', icon: 'check-circle', order: 2 },
  ]
  for (const st of stats) {
    const existing = await prisma.stat.findFirst({ where: { label: st.label } })
    if (!existing) {
      await prisma.stat.create({ data: st })
    }
  }

  console.log('Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
