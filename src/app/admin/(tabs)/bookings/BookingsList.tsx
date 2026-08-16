'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Mail, Phone, MessageCircle, MapPin, Calendar, Clock, Tag } from "lucide-react"
import type { Lead } from "@prisma/client"
import { markLeadRead, deleteLead } from "@/actions/leads"

// Fixed locale + explicit hour12 so this always reads as AM/PM, regardless of the
// admin's OS/browser locale (see the "Time of Birth" native-input fix — same root cause).
const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
})

function formatTOB(tob: string) {
  const [hStr, mStr] = tob.split(":")
  let h = parseInt(hStr, 10)
  const period = h >= 12 ? "PM" : "AM"
  h = h % 12
  if (h === 0) h = 12
  return `${String(h).padStart(2, "0")}:${mStr} ${period}`
}

function PaymentBadge({ status }: { status: string | null }) {
  if (status === "PAID") {
    return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Paid</span>
  }
  if (status === "PENDING") {
    return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Pending</span>
  }
  return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600">WhatsApp</span>
}

export function BookingsList({
  bookings,
  serviceTitles,
}: {
  bookings: Lead[]
  serviceTitles: Record<string, string>
}) {
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const visible = filter === "unread" ? bookings.filter((b) => !b.isRead) : bookings
  const unreadCount = bookings.filter((b) => !b.isRead).length

  const toggleRead = (id: string, isRead: boolean) => {
    startTransition(async () => {
      await markLeadRead(id, isRead)
      router.refresh()
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm("Delete this booking permanently?")) return
    startTransition(async () => {
      await deleteLead(id)
      router.refresh()
    })
  }

  if (bookings.length === 0) {
    return <p className="text-zinc-500 text-sm">No bookings yet — they&apos;ll show up here as customers book consultations.</p>
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f ? "bg-black text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {f === "all" ? "All" : `Unread${unreadCount ? ` (${unreadCount})` : ""}`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((booking) => (
          <div
            key={booking.id}
            className={`border rounded-xl p-4 ${booking.isRead ? "border-zinc-200 bg-white" : "border-zinc-300 bg-zinc-50"}`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                {!booking.isRead && <span className="w-2 h-2 rounded-full bg-brand-orange shrink-0" aria-label="Unread" />}
                <span className="font-bold">{booking.name}</span>
                {booking.serviceId && serviceTitles[booking.serviceId] && (
                  <span className="text-zinc-500 text-sm">· {serviceTitles[booking.serviceId]}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <PaymentBadge status={booking.paymentStatus} />
                {booking.amount != null && <span className="text-sm font-bold">₹{booking.amount}</span>}
                <span className="text-xs text-zinc-400">{dateFormatter.format(booking.createdAt)}</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-zinc-700">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-zinc-400 shrink-0" /> {booking.phone}
              </div>
              {booking.whatsapp !== booking.phone && (
                <div className="flex items-center gap-2">
                  <MessageCircle size={14} className="text-zinc-400 shrink-0" /> {booking.whatsapp}
                </div>
              )}
              {booking.email && (
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-zinc-400 shrink-0" /> {booking.email}
                </div>
              )}
              {booking.category && (
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-zinc-400 shrink-0" /> {booking.category}
                </div>
              )}
              {booking.dob && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-zinc-400 shrink-0" /> DOB: {booking.dob}
                </div>
              )}
              {booking.tob && (
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-zinc-400 shrink-0" /> TOB: {formatTOB(booking.tob)}
                </div>
              )}
              {booking.pob && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-zinc-400 shrink-0" /> {booking.pob}
                </div>
              )}
            </div>

            {booking.message && (
              <p className="mt-3 text-sm text-zinc-600 bg-zinc-50 border border-zinc-100 rounded-lg p-3">{booking.message}</p>
            )}

            <div className="mt-3 flex items-center gap-3">
              <button
                disabled={isPending}
                onClick={() => toggleRead(booking.id, !booking.isRead)}
                className="text-xs font-medium text-zinc-500 hover:text-black disabled:opacity-50"
              >
                Mark as {booking.isRead ? "unread" : "read"}
              </button>
              <button
                disabled={isPending}
                onClick={() => handleDelete(booking.id)}
                className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50 flex items-center gap-1"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
