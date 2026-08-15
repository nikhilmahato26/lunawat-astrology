import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock } from "lucide-react"
import { FadeIn } from "@/components/public/FadeIn"
import { BookingForm } from "@/components/public/BookingForm"

export default async function BookServicePage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params

  const service = await prisma.service.findUnique({ where: { id: serviceId } })

  if (!service || !service.isActive) notFound()

  return (
    <div className="bg-gradient-to-b from-brand-peach to-[#FFFDF9] min-h-screen text-brand-brown font-sans">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
        <FadeIn>
          <Link href="/#services" className="inline-flex items-center gap-2 text-sm font-bold text-brand-orange mb-8 hover:gap-3 transition-all w-fit">
            <ArrowLeft size={16} /> Back to Services
          </Link>

          <div className="bg-white rounded-[2rem] shadow-2xl shadow-brand-orange/5 border border-orange-50 p-8 md:p-10">
            <h1 className="text-3xl md:text-4xl font-black mb-2">{service.title}</h1>
            {service.category && (
              <span className="inline-block bg-orange-50 text-brand-orange text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-orange-100 mb-3">
                {service.category}
              </span>
            )}
            {service.description && (
              <p className="text-brand-brown/70 text-sm leading-relaxed mb-4">{service.description}</p>
            )}
            <div className="flex items-center gap-4 text-brand-brown/60 font-bold mb-8">
              {service.durationMin && (
                <span className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-brand-orange" /> {service.durationMin} mins
                </span>
              )}
              <span className="text-2xl font-black text-brand-brown">₹{service.price}</span>
            </div>

            <BookingForm
              service={{ id: service.id, title: service.title, price: service.price }}
              bookingFields={service.bookingFields as string[]}
            />
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
