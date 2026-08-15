import { prisma } from "@/lib/prisma"
import { ContactForm } from "./ContactForm"

export default async function ContactTab() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" }
  })
  const hours = await prisma.businessHour.findMany({
    orderBy: { day: 'asc' }
  })

  if (!settings) return <div>Settings not found</div>

  return (
    <div>
      <h2 className="text-2xl font-black mb-6">Contact & Hours</h2>
      <ContactForm settings={settings} initialHours={hours} />
    </div>
  )
}
