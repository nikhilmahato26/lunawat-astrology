'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createBooking, verifyBookingPayment } from "@/actions/bookings"

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

interface BookingFormProps {
  service: { id: string; title: string; price: number }
  /** Which fields to show. If empty/undefined, shows all (legacy). */
  bookingFields?: string[]
}

export function BookingForm({ service, bookingFields }: BookingFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  // If no config, show everything
  const show = (key: string) =>
    !bookingFields || bookingFields.length === 0 || bookingFields.includes(key)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    const formData = new FormData(e.currentTarget)

    const payload = {
      serviceId: service.id,
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      dob: String(formData.get("dob") || ""),
      tob: String(formData.get("tob") || ""),
      pob: String(formData.get("pob") || ""),
      message: String(formData.get("message") || ""),
    }

    startTransition(async () => {
      const result = await createBooking(payload)

      if (!result.success) {
        setError(result.error)
        return
      }

      if (result.mode === "whatsapp") {
        const digits = result.whatsapp?.replace(/[^0-9]/g, "") || ""
        window.location.href = `https://wa.me/${digits}?text=${encodeURIComponent(result.message)}`
        return
      }

      const loaded = await loadRazorpayScript()
      if (!loaded) {
        setError("Could not load the payment gateway. Please check your connection and try again.")
        return
      }

      const rzp = new window.Razorpay({
        key: result.keyId,
        amount: result.amount,
        currency: result.currency,
        order_id: result.orderId,
        name: "Book a Consultation",
        description: result.serviceTitle,
        prefill: {
          name: result.name,
          email: result.email,
          contact: result.phone,
        },
        theme: { color: "#ea580c" },
        handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          startTransition(async () => {
            const verify = await verifyBookingPayment({
              leadId: result.leadId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            if (verify.success) {
              router.push("/book/success")
            } else {
              setError(verify.error || "Payment verification failed. Please contact us to confirm your booking.")
            }
          })
        },
      })
      rzp.open()
    })
  }

  const inputClass =
    "w-full px-4 py-3 bg-brand-peach/60 border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">{error}</div>}

      {/* Name + Phone — always shown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-brand-brown mb-1">Full Name *</label>
          <input name="name" required className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-bold text-brand-brown mb-1">Phone Number *</label>
          <input name="phone" type="tel" required className={inputClass} />
        </div>
      </div>

      {/* Email — always shown */}
      <div>
        <label className="block text-sm font-bold text-brand-brown mb-1">Email (Optional)</label>
        <input name="email" type="email" className={inputClass} />
      </div>

      {/* DOB + TOB + POB — conditional */}
      {(show("dob") || show("tob") || show("pob")) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {show("dob") && (
            <div>
              <label className="block text-sm font-bold text-brand-brown mb-1">Date of Birth *</label>
              <input name="dob" type="date" required className={inputClass} />
            </div>
          )}
          {show("tob") && (
            <div>
              <label className="block text-sm font-bold text-brand-brown mb-1">Time of Birth *</label>
              <input name="tob" type="time" required className={inputClass} />
            </div>
          )}
          {show("pob") && (
            <div>
              <label className="block text-sm font-bold text-brand-brown mb-1">Place of Birth *</label>
              <input name="pob" required placeholder="City, State" className={inputClass} />
            </div>
          )}
        </div>
      )}

      {/* Message — conditional */}
      {show("message") && (
        <div>
          <label className="block text-sm font-bold text-brand-brown mb-1">Your Concern (Optional)</label>
          <textarea name="message" rows={3} className={`${inputClass} resize-none`} />
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-14 bg-brand-orange text-white font-bold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 mt-2"
      >
        {isPending ? "Processing..." : `Book Now · ₹${service.price}`}
      </button>
    </form>
  )
}
