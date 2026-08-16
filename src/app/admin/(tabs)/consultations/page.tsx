import { prisma } from "@/lib/prisma"
import { ConsultationsForm } from "./ConsultationsForm"
import { ALL_BOOKING_FIELDS } from "@/components/public/BookingForm"

export default async function ConsultationsTab() {
  const [services, settings] = await Promise.all([
    prisma.service.findMany({ orderBy: { order: 'asc' } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ])

  return (
    <div>
      <h2 className="text-2xl font-black mb-6">Consultations</h2>
      <ConsultationsForm
        initialServices={services}
        enablePaymentGateway={settings?.enablePaymentGateway ?? false}
        initialBookingFields={settings?.bookingFields ?? ALL_BOOKING_FIELDS}
        initialCategories={settings?.consultationCategories ?? []}
        initialDiscountBadgeFormat={settings?.discountBadgeFormat ?? "PERCENT"}
      />
    </div>
  )
}
