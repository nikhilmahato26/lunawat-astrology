'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Mail, Phone, MessageCircle, MapPin, Calendar, Clock, Tag, GraduationCap, Heart, Download, FileSpreadsheet } from "lucide-react"
import type { Lead } from "@prisma/client"
import { markLeadRead, deleteLead } from "@/actions/leads"
import { getBookingRef } from "@/lib/bookingRef"
import * as XLSX from "xlsx"

// Fixed locale + explicit hour12 so this always reads as AM/PM
const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
})

function formatTOB(tob: string) {
  if (!tob) return ""
  const [hStr, mStr] = tob.split(":")
  let h = parseInt(hStr, 10)
  if (isNaN(h)) return tob
  const period = h >= 12 ? "PM" : "AM"
  h = h % 12
  if (h === 0) h = 12
  return `${String(h).padStart(2, "0")}:${mStr || "00"} ${period}`
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
  const [filter, setFilter] = useState<"all" | "unread" | "pending" | "paid">("all")
  const [isPending, startTransition] = useTransition()
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()

  const filters = {
    all: bookings,
    unread: bookings.filter((b) => !b.isRead),
    pending: bookings.filter((b) => b.paymentStatus === "PENDING"),
    paid: bookings.filter((b) => b.paymentStatus === "PAID"),
  } as const

  const visible = filters[filter]

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

  const handleExportExcel = () => {
    setIsExporting(true)
    try {
      const dataToExport = visible.map((b) => {
        const isCouple = b.isMatchmaking || Boolean(b.partnerName)
        return {
          "Booking Ref": getBookingRef(b.id),
          "Booking Date": dateFormatter.format(b.createdAt),
          "Status": b.paymentStatus || "WhatsApp",
          "Amount (₹)": b.amount ?? "",
          "Service": b.serviceId ? serviceTitles[b.serviceId] || b.serviceId : "Consultation",
          "Client Name": b.name,
          "Phone": b.phone,
          "WhatsApp": b.whatsapp,
          "Email": b.email || "",
          "Category": b.category || "",
          "DOB": b.dob || "",
          "TOB": b.tob ? formatTOB(b.tob) : "",
          "POB": b.pob || "",
          "Education": b.education || "",
          "Address": b.address || "",
          "Is Matchmaking": isCouple ? "Yes" : "No",
          "Partner Name": b.partnerName || "",
          "Partner DOB": b.partnerDob || "",
          "Partner TOB": b.partnerTob ? formatTOB(b.partnerTob) : "",
          "Partner POB": b.partnerPob || "",
          "Partner Education": b.partnerEducation || "",
          "Partner Address": b.partnerAddress || "",
          "Message": b.message || "",
          "Razorpay Payment ID": b.razorpayPaymentId || "",
          "Razorpay Order ID": b.razorpayOrderId || "",
        }
      })

      const worksheet = XLSX.utils.json_to_sheet(dataToExport)

      // Set nice column widths for readability
      const colWidths = [
        { wch: 15 }, // Booking Ref
        { wch: 20 }, // Booking Date
        { wch: 12 }, // Status
        { wch: 12 }, // Amount
        { wch: 24 }, // Service
        { wch: 20 }, // Client Name
        { wch: 16 }, // Phone
        { wch: 16 }, // WhatsApp
        { wch: 25 }, // Email
        { wch: 16 }, // Category
        { wch: 14 }, // DOB
        { wch: 12 }, // TOB
        { wch: 18 }, // POB
        { wch: 18 }, // Education
        { wch: 25 }, // Address
        { wch: 15 }, // Is Matchmaking
        { wch: 20 }, // Partner Name
        { wch: 14 }, // Partner DOB
        { wch: 12 }, // Partner TOB
        { wch: 18 }, // Partner POB
        { wch: 18 }, // Partner Education
        { wch: 25 }, // Partner Address
        { wch: 35 }, // Message
        { wch: 22 }, // Razorpay Payment ID
        { wch: 22 }, // Razorpay Order ID
      ]
      worksheet["!cols"] = colWidths

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings")

      const timestamp = new Date().toISOString().slice(0, 10)
      const filename = `bookings_${filter}_${timestamp}.xlsx`
      XLSX.writeFile(workbook, filename)
    } catch (err) {
      console.error("Excel export error:", err)
      alert("Failed to export Excel file. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  if (bookings.length === 0) {
    return <p className="text-zinc-500 text-sm">No bookings yet — they&apos;ll show up here as customers book consultations.</p>
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Filter buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "unread", "pending", "paid"] as const).map((f) => {
            const count = filters[f].length
            const label = f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  filter === f ? "bg-black text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {f === "all" ? label : `${label} (${count})`}
              </button>
            )
          })}
        </div>

        {/* Download Excel Button */}
        <button
          onClick={handleExportExcel}
          disabled={isExporting || visible.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
          title="Download current bookings as Excel (.xlsx)"
        >
          <FileSpreadsheet size={16} />
          {isExporting ? "Exporting..." : `Download Excel (${visible.length})`}
        </button>
      </div>

      <div className="space-y-4">
        {visible.map((booking) => {
          const isCouple = booking.isMatchmaking || Boolean(booking.partnerName)

          return (
            <div
              key={booking.id}
              className={`border rounded-xl p-4 transition-all ${
                booking.isRead ? "border-zinc-200 bg-white" : "border-zinc-300 bg-zinc-50/70 shadow-sm"
              }`}
            >
              {/* Header: Name, Service, Status, Amount, Date */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  {!booking.isRead && (
                    <span className="w-2 h-2 rounded-full bg-brand-orange shrink-0" aria-label="Unread" />
                  )}
                  <span className="font-bold text-base text-zinc-900">{booking.name}</span>
                  {booking.serviceId && serviceTitles[booking.serviceId] && (
                    <span className="text-zinc-500 text-sm">· {serviceTitles[booking.serviceId]}</span>
                  )}
                  {isCouple && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      <Heart size={10} className="fill-rose-500 text-rose-500" /> Matchmaking
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <PaymentBadge status={booking.paymentStatus} />
                  {booking.paymentStatus === "PAID" && (
                    <span className="font-mono text-xs font-bold text-brand-orange">
                      {getBookingRef(booking.id)}
                    </span>
                  )}
                  {booking.amount != null && <span className="text-sm font-bold">₹{booking.amount}</span>}
                  <span className="text-xs text-zinc-400">{dateFormatter.format(booking.createdAt)}</span>
                </div>
              </div>

              {/* Main Client Details Grid */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm text-zinc-700">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-zinc-400 shrink-0" /> {booking.phone}
                </div>
                {booking.whatsapp !== booking.phone && (
                  <div className="flex items-center gap-2">
                    <MessageCircle size={14} className="text-zinc-400 shrink-0" /> {booking.whatsapp}
                  </div>
                )}
                {booking.email && (
                  <div className="flex items-center gap-2 truncate" title={booking.email}>
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
                    <MapPin size={14} className="text-zinc-400 shrink-0" /> POB: {booking.pob}
                  </div>
                )}
                {booking.education && (
                  <div className="flex items-center gap-2">
                    <GraduationCap size={14} className="text-zinc-400 shrink-0" /> Edu: {booking.education}
                  </div>
                )}
                {booking.address && (
                  <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                    <MapPin size={14} className="text-zinc-400 shrink-0" /> Addr: {booking.address}
                  </div>
                )}
              </div>

              {/* Matchmaking / Partner Details Block */}
              {isCouple && (
                <div className="mt-3 p-3 bg-rose-50/60 border border-rose-100 rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">
                    <Heart size={12} className="fill-rose-600 text-rose-600" />
                    Partner Details
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5 text-sm text-zinc-700">
                    {booking.partnerName && (
                      <div className="font-semibold text-zinc-900">
                        Name: {booking.partnerName}
                      </div>
                    )}
                    {booking.partnerDob && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-rose-400 shrink-0" /> DOB: {booking.partnerDob}
                      </div>
                    )}
                    {booking.partnerTob && (
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-rose-400 shrink-0" /> TOB: {formatTOB(booking.partnerTob)}
                      </div>
                    )}
                    {booking.partnerPob && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-rose-400 shrink-0" /> POB: {booking.partnerPob}
                      </div>
                    )}
                    {booking.partnerEducation && (
                      <div className="flex items-center gap-1.5">
                        <GraduationCap size={13} className="text-rose-400 shrink-0" /> Edu: {booking.partnerEducation}
                      </div>
                    )}
                    {booking.partnerAddress && (
                      <div className="flex items-center gap-1.5 col-span-1 sm:col-span-2">
                        <MapPin size={13} className="text-rose-400 shrink-0" /> Addr: {booking.partnerAddress}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message / Concern */}
              {booking.message && (
                <div className="mt-3 text-sm text-zinc-600 bg-zinc-50 border border-zinc-200/80 rounded-lg p-3">
                  <span className="font-medium text-zinc-800">Concern: </span>
                  {booking.message}
                </div>
              )}

              {/* Actions: Mark read/unread, Delete */}
              <div className="mt-3 flex items-center gap-3 pt-1 border-t border-zinc-100">
                <button
                  disabled={isPending}
                  onClick={() => toggleRead(booking.id, !booking.isRead)}
                  className="text-xs font-medium text-zinc-500 hover:text-black disabled:opacity-50 cursor-pointer"
                >
                  Mark as {booking.isRead ? "unread" : "read"}
                </button>
                <button
                  disabled={isPending}
                  onClick={() => handleDelete(booking.id)}
                  className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
