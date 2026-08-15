import { ReactNode } from "react"
import { Navbar } from "@/components/public/Navbar"
import { Footer } from "@/components/public/Footer"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

const getSettings = unstable_cache(
  async () => prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ['site-settings'],
  { tags: ['site-data'] }
)

const getHours = unstable_cache(
  async () => prisma.businessHour.findMany({ orderBy: { day: 'asc' } }),
  ['business-hours'],
  { tags: ['site-data'] }
)

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings()
  const hours = await getHours()

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-gold-500 selection:text-white">
      <Navbar 
        businessName={settings?.businessName} 
        phone={settings?.phone || undefined} 
      />
      <main className="pt-20">
        {children}
      </main>
      <Footer 
        businessName={settings?.businessName}
        address={settings?.address || undefined}
        phone={settings?.phone || undefined}
        email={settings?.email || undefined}
        whatsapp={settings?.whatsapp || undefined}
        hours={hours}
      />
    </div>
  )
}
