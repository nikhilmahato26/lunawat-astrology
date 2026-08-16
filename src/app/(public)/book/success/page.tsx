import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { FadeIn } from "@/components/public/FadeIn"

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>
}) {
  const { bookingId } = await searchParams

  return (
    <div className="bg-gradient-to-b from-brand-peach to-[#FCF6EC] min-h-screen text-brand-brown font-sans flex items-center justify-center px-4">
      <FadeIn>
        <div className="max-w-md mx-auto bg-white rounded-[2rem] shadow-2xl shadow-brand-brown/5 border border-brand-orange/10 p-10 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="font-serif text-2xl font-bold mb-3">Booking Confirmed!</h1>
          <p className="text-brand-brown/70 mb-4">
            Your payment was successful. We&apos;ll reach out to you shortly to schedule your consultation.
          </p>
          {bookingId && (
            <div className="inline-flex items-center gap-2 bg-brand-peach px-4 py-2 rounded-full mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-brown/50">Booking ID</span>
              <span className="font-mono font-bold text-brand-orange">{bookingId}</span>
            </div>
          )}
          <p className="text-xs text-brand-brown/50 mb-6">
            A confirmation email is on its way — if it doesn&apos;t show up in a few minutes, please check your Spam/Junk folder too.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-14 px-8 bg-brand-orange text-white font-bold rounded-xl hover:bg-gold-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </FadeIn>
    </div>
  )
}
