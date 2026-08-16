import { prisma } from "@/lib/prisma"
import { reconcileSectionOrder } from "@/lib/sections"
import { LayoutForm } from "./LayoutForm"

export default async function LayoutTab() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } })
  const reconciled = reconcileSectionOrder(settings?.sectionOrder ?? [])

  const initialVisibility = {
    stats: settings?.showStats ?? true,
    whyChoose: settings?.showWhyChoose ?? true,
    about: settings?.showAbout ?? true,
    services: settings?.showServices ?? true,
    certifications: settings?.showCertifications ?? true,
    banners: settings?.showBanners ?? true,
    testimonials: settings?.showTestimonials ?? true,
    media: settings?.showMedia ?? true,
    faq: settings?.showFaq ?? true,
    cta: settings?.showCta ?? true,
  }

  return (
    <div>
      <h2 className="text-2xl font-black mb-6">Page Layout</h2>
      <LayoutForm initialOrder={reconciled} initialVisibility={initialVisibility} />
    </div>
  )
}
