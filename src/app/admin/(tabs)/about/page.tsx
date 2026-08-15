import { prisma } from "@/lib/prisma"
import { AboutForm } from "./AboutForm"

export default async function AboutTab() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" }
  })
  const stats = await prisma.stat.findMany({
    orderBy: { order: 'asc' }
  })

  if (!settings) return <div>Settings not found</div>

  return (
    <div>
      <h2 className="text-2xl font-black mb-6">About, Trust & FAQ</h2>
      <AboutForm settings={settings} initialStats={stats} />
    </div>
  )
}
