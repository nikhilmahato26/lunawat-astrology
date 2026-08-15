import { prisma } from "@/lib/prisma"
import { BannersForm } from "./BannersForm"

export default async function BannersTab() {
  const banners = await prisma.banner.findMany({ orderBy: { order: 'asc' } })

  return (
    <div>
      <h2 className="text-2xl font-black mb-6">Banners</h2>
      <BannersForm initialBanners={banners} />
    </div>
  )
}
