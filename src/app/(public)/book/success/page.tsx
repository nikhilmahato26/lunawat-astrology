import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { FadeIn } from "@/components/public/FadeIn"

export default function BookingSuccessPage() {
  return (
    <div className="bg-gradient-to-b from-brand-peach to-[#FFFDF9] min-h-screen text-brand-brown font-sans flex items-center justify-center px-4">
      <FadeIn>
        <div className="max-w-md mx-auto bg-white rounded-[2rem] shadow-2xl shadow-brand-orange/5 border border-orange-50 p-10 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl font-black mb-3">Booking Confirmed!</h1>
          <p className="text-brand-brown/70 mb-8">
            Your payment was successful. We&apos;ll reach out to you shortly to schedule your consultation.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-14 px-8 bg-brand-orange text-white font-bold rounded-xl hover:bg-orange-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </FadeIn>
    </div>
  )
}
