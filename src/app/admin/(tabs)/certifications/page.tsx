import { prisma } from "@/lib/prisma"
import { CertificationsForm } from "./CertificationsForm"

export default async function CertificationsTab() {
  const certifications = await prisma.certification.findMany({
    orderBy: { order: 'asc' }
  })

  return (
    <div>
      <h2 className="text-2xl font-black mb-6">Certifications</h2>
      <CertificationsForm initialCertifications={certifications} />
    </div>
  )
}
