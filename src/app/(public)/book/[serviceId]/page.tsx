import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Sparkles } from "lucide-react"
import { FadeIn } from "@/components/public/FadeIn"
import { BookingForm } from "@/components/public/BookingForm"
import { getDiscountLabel, type DiscountBadgeFormat } from "@/lib/pricing"
import { formatDuration } from "@/lib/duration"

export default async function BookServicePage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params

  const [service, settings] = await Promise.all([
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" }, select: { bookingFields: true, consultationCategories: true, discountBadgeFormat: true } }),
  ])

  if (!service || !service.isActive) notFound()

  const discountLabel = getDiscountLabel(service, (settings?.discountBadgeFormat as DiscountBadgeFormat) || "PERCENT")

  return (
    <div className="bg-gradient-to-b from-brand-peach to-[#FCF6EC] min-h-screen text-brand-brown font-sans">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
        <FadeIn>
          <Link href="/#services" className="inline-flex items-center gap-2 text-sm font-bold text-brand-orange mb-8 hover:gap-3 transition-all w-fit">
            <ArrowLeft size={16} /> Back to Services
          </Link>

          <div className="bg-white rounded-[2rem] shadow-2xl shadow-brand-brown/5 border border-brand-orange/10 p-8 md:p-10">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">{service.title}</h1>
            {service.description && (
              <p className="text-brand-brown/70 text-sm leading-relaxed mb-4">{service.description}</p>
            )}
            <div className="flex items-center gap-4 text-brand-brown/60 font-bold mb-8 flex-wrap">
              {service.durationMin && (
                <span className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-brand-orange" /> {formatDuration(service.durationMin, service.durationUnit)}
                </span>
              )}
              <span className="text-2xl font-black text-brand-brown">₹{service.price}</span>
              {service.originalPrice != null && service.originalPrice > service.price && (
                <>
                  <span className="text-lg line-through text-brand-brown/40">₹{service.originalPrice}</span>
                  {discountLabel && (
                    <span className="inline-flex items-center gap-1 bg-brand-teal text-brand-peach px-3 py-1 rounded-full text-xs font-bold">
                      <Sparkles size={12} /> {discountLabel}
                    </span>
                  )}
                </>
              )}
            </div>

            <BookingForm
              service={{ id: service.id, title: service.title, price: service.price }}
              bookingFields={settings?.bookingFields}
              categories={settings?.consultationCategories ?? []}
            />
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
