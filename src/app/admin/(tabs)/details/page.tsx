import { prisma } from "@/lib/prisma"
import { DetailsForm } from "./DetailsForm"

export default async function DetailsTab() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" }
  })

  if (!settings) return <div>Settings not found</div>

  return (
    <div>
      <h2 className="text-2xl font-black mb-6">Your Details</h2>
      <DetailsForm settings={settings} />
    </div>
  )
}
