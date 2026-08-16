import { prisma } from "@/lib/prisma"
import { CertificationsForm } from "./CertificationsForm"

export default async function CertificationsTab() {
  const [certifications, settings] = await Promise.all([
    prisma.certification.findMany({ orderBy: { order: 'asc' } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" }, select: { showCertifications: true } }),
  ])

  return (
    <div>
      <h2 className="text-2xl font-black mb-6">Certifications</h2>
      <CertificationsForm
        initialCertifications={certifications}
        initialShowSection={settings?.showCertifications ?? true}
      />
    </div>
  )
}
