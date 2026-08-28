'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createBooking, verifyBookingPayment } from "@/actions/bookings"
import { TimeInput12h } from "@/components/ui/TimeInput12h"
import { Heart, Users } from "lucide-react"

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

// Fallback used only when no SiteSettings row exists at all.
export const ALL_BOOKING_FIELDS = ["email", "category", "dob", "tob", "pob", "education", "address", "message"]

interface BookingFormProps {
  service: { id: string; title: string; price: number }
  /** Which fields to show — a field renders only if its key is present here. */
  bookingFields?: string[]
  /** Admin-configured category options for the Category field. */
  categories?: string[]
}

export function BookingForm({ service, bookingFields, categories = [] }: BookingFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  const serviceIsMatchmaking = /match|milan|couple|marriage/i.test(service.title)
  const [isMatchmaking, setIsMatchmaking] = useState(serviceIsMatchmaking)
  const [selectedCategory, setSelectedCategory] = useState("")

  // Checkbox state is the single source of truth — a field shows only if its key is present.
  const fields = bookingFields ?? ALL_BOOKING_FIELDS
  const show = (key: string) => fields.includes(key)

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedCategory(val)
    if (/match|milan/i.test(val)) {
      setIsMatchmaking(true)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    const formData = new FormData(e.currentTarget)

    const payload = {
      serviceId: service.id,
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      whatsapp: String(formData.get("whatsapp") || ""),
      email: String(formData.get("email") || ""),
      category: String(formData.get("category") || selectedCategory || ""),
      dob: String(formData.get("dob") || ""),
      tob: String(formData.get("tob") || ""),
      pob: String(formData.get("pob") || ""),
      education: String(formData.get("education") || ""),
      address: String(formData.get("address") || ""),
      message: String(formData.get("message") || ""),

      // Matchmaking fields
      isMatchmaking,
      partnerName: isMatchmaking ? String(formData.get("partnerName") || "") : "",
      partnerDob: isMatchmaking ? String(formData.get("partnerDob") || "") : "",
      partnerTob: isMatchmaking ? String(formData.get("partnerTob") || "") : "",
      partnerPob: isMatchmaking ? String(formData.get("partnerPob") || "") : "",
      partnerEducation: isMatchmaking ? String(formData.get("partnerEducation") || "") : "",
      partnerAddress: isMatchmaking ? String(formData.get("partnerAddress") || "") : "",
    }

    startTransition(async () => {
      const result = await createBooking(payload)

      if (!result.success) {
        setError(result.error)
        return
      }

      if (result.mode === "whatsapp") {
        const digits = result.businessWhatsapp?.replace(/[^0-9]/g, "") || ""
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
              const params = new URLSearchParams()
              if (verify.bookingId) params.set("bookingId", verify.bookingId)
              if (result.email) params.set("hasEmail", "1")
              const query = params.toString()
              router.push(`/book/success${query ? `?${query}` : ""}`)
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
    "w-full px-4 py-3 bg-brand-peach/60 border border-brand-orange/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all text-brand-brown placeholder:text-brand-brown/40 text-sm"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">{error}</div>}

      {/* Matchmaking Option Toggle */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange shrink-0">
            <Heart size={16} className="fill-brand-orange/20" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand-brown">Kundli Milan / Matchmaking</p>
            <p className="text-[11px] text-brand-brown/70">Add details for both partners to match horoscope</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isMatchmaking}
            onChange={(e) => setIsMatchmaking(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-orange"></div>
        </label>
      </div>

      {isMatchmaking && (
        <div className="flex items-center gap-2 pt-1 pb-1">
          <Users size={16} className="text-brand-orange" />
          <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
            Person 1 Details
          </span>
        </div>
      )}

      {/* Name + Phone — always required */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-brand-brown mb-1">
            {isMatchmaking ? "Person 1 Full Name *" : "Full Name *"}
          </label>
          <input name="name" required placeholder="e.g. Rahul Sharma" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-bold text-brand-brown mb-1">Phone Number *</label>
          <input name="phone" type="tel" required placeholder="e.g. +91 98765 43210" className={inputClass} />
        </div>
      </div>

      {/* WhatsApp — always required */}
      <div>
        <label className="block text-sm font-bold text-brand-brown mb-1">WhatsApp Number *</label>
        <input name="whatsapp" type="tel" required placeholder="e.g. +91 98765 43210" className={inputClass} />
      </div>

      {/* Email — conditional */}
      {show("email") && (
        <div>
          <label className="block text-sm font-bold text-brand-brown mb-1">Email (Optional)</label>
          <input name="email" type="email" placeholder="e.g. rahul@example.com" className={inputClass} />
        </div>
      )}

      {/* Category — conditional */}
      {show("category") && categories.length > 0 && (
        <div>
          <label className="block text-sm font-bold text-brand-brown mb-1">What is this about? *</label>
          <select
            name="category"
            required
            value={selectedCategory}
            onChange={handleCategoryChange}
            className={inputClass}
          >
            <option value="" disabled>Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      )}

      {/* DOB + TOB + POB — conditional */}
      {(show("dob") || show("tob") || show("pob")) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {show("dob") && (
            <div>
              <label className="block text-sm font-bold text-brand-brown mb-1">
                {isMatchmaking ? "Person 1 Date of Birth *" : "Date of Birth *"}
              </label>
              <input name="dob" type="date" required className={inputClass} />
            </div>
          )}
          {show("tob") && (
            <div>
              <label className="block text-sm font-bold text-brand-brown mb-1">
                {isMatchmaking ? "Person 1 Time of Birth *" : "Time of Birth *"}
              </label>
              <TimeInput12h
                name="tob"
                required
                className="px-2 py-3 bg-brand-peach/60 border border-brand-orange/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all text-sm text-brand-brown"
              />
            </div>
          )}
          {show("pob") && (
            <div>
              <label className="block text-sm font-bold text-brand-brown mb-1">
                {isMatchmaking ? "Person 1 Place of Birth *" : "Place of Birth *"}
              </label>
              <input name="pob" required placeholder="City, State" className={inputClass} />
            </div>
          )}
        </div>
      )}

      {/* Education + Address — conditional */}
      {(show("education") || show("address")) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {show("education") && (
            <div>
              <label className="block text-sm font-bold text-brand-brown mb-1">
                {isMatchmaking ? "Person 1 Education" : "Education / Qualification"}
              </label>
              <input name="education" placeholder="e.g. B.Tech, MBA, M.Com" className={inputClass} />
            </div>
          )}
          {show("address") && (
            <div>
              <label className="block text-sm font-bold text-brand-brown mb-1">
                {isMatchmaking ? "Person 1 Address / City" : "Address / Location"}
              </label>
              <input name="address" placeholder="e.g. Mumbai, Maharashtra" className={inputClass} />
            </div>
          )}
        </div>
      )}

      {/* ── Partner Details Section (Matchmaking / Milan) ── */}
      {isMatchmaking && (
        <div className="mt-6 pt-5 border-t border-brand-orange/20 space-y-4 bg-orange-50/50 -mx-4 px-4 py-4 rounded-2xl border border-brand-orange/15">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-brand-orange fill-brand-orange/20" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Person 2 / Partner Details
            </span>
          </div>

          <div>
            <label className="block text-sm font-bold text-brand-brown mb-1">Partner&apos;s Full Name *</label>
            <input name="partnerName" required={isMatchmaking} placeholder="e.g. Priya Patel" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-brand-brown mb-1">Partner Date of Birth *</label>
              <input name="partnerDob" type="date" required={isMatchmaking} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-brown mb-1">Partner Time of Birth *</label>
              <TimeInput12h
                name="partnerTob"
                required={isMatchmaking}
                className="px-2 py-3 bg-brand-peach/60 border border-brand-orange/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all text-sm text-brand-brown"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-brown mb-1">Partner Place of Birth *</label>
              <input name="partnerPob" required={isMatchmaking} placeholder="City, State" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-brand-brown mb-1">Partner Education</label>
              <input name="partnerEducation" placeholder="e.g. MBBS, MBA, B.Sc" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-brown mb-1">Partner Address / City</label>
              <input name="partnerAddress" placeholder="e.g. Pune, Maharashtra" className={inputClass} />
            </div>
          </div>
        </div>
      )}

      {/* Message — conditional */}
      {show("message") && (
        <div>
          <label className="block text-sm font-bold text-brand-brown mb-1">Your Concern (Optional)</label>
          <textarea
            name="message"
            rows={3}
            placeholder="Any specific questions or concerns for the astrologer..."
            className={`${inputClass} resize-none`}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-14 bg-brand-orange text-white font-bold rounded-xl hover:bg-gold-600 transition-colors disabled:opacity-50 mt-2 shadow-md hover:shadow-lg cursor-pointer"
      >
        {isPending ? "Processing..." : `Book Now · ₹${service.price}`}
      </button>
    </form>
  )
}
