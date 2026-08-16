import { prisma } from "@/lib/prisma"
import { BookingsList } from "./BookingsList"

// New bookings come from the public booking flow, which has no way to know this page
// exists or needs revalidating — so it must always hit the database fresh rather than
// getting statically prerendered at build/deploy time (which would freeze it at whatever
// bookings existed then).
export const dynamic = "force-dynamic"

export default async function BookingsTab() {
  const bookings = await prisma.lead.findMany({
    where: { source: "booking" },
    orderBy: { createdAt: "desc" },
  })

  const serviceIds = [...new Set(bookings.map((b) => b.serviceId).filter((id): id is string => !!id))]
  const services = serviceIds.length
    ? await prisma.service.findMany({ where: { id: { in: serviceIds } }, select: { id: true, title: true } })
    : []
  const serviceTitles = Object.fromEntries(services.map((s) => [s.id, s.title]))

  return (
    <div>
      <h2 className="text-2xl font-black mb-1">Bookings</h2>
      <p className="text-zinc-500 text-sm mb-6">Consultations booked through your website, newest first.</p>
      <BookingsList bookings={bookings} serviceTitles={serviceTitles} />
    </div>
  )
}
