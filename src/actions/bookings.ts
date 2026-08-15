'use server'

import { prisma } from "@/lib/prisma"
import { getRazorpay } from "@/lib/razorpay"
import { getOfferPrice } from "@/lib/pricing"
import { sendEmail } from "@/lib/email"
import { z } from "zod"
import crypto from "crypto"

// Short, human-friendly reference derived from the Lead's own id — unique for free,
// no extra schema/column needed. e.g. "LAP-8F3K2Q1H"
function getBookingRef(leadId: string) {
  return `LAP-${leadId.slice(-8).toUpperCase()}`
}

function detailsTable(rows: [string, string][]) {
  return `<table cellpadding="0" cellspacing="0">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#666;font-size:14px;">${k}</td><td style="padding:4px 0;font-weight:600;font-size:14px;">${v}</td></tr>`
    )
    .join("")}</table>`
}

// Name, phone, and WhatsApp are always required — every booking needs a way to reach the
// customer. email/category/dob/tob/pob/message stay optional because the admin can hide
// any of them from the booking form (SiteSettings.bookingFields) — the client only renders
// + requires whichever of those are configured to show, so the server can't force them.
const bookingSchema = z.object({
  serviceId: z.string().min(1),
  name: z.string().trim().min(2, "Please enter your name"),
  phone: z.string().trim().min(8, "Please enter a valid phone number"),
  whatsapp: z.string().trim().min(8, "Please enter a valid WhatsApp number"),
  email: z.union([z.string().trim().email("Please enter a valid email"), z.literal("")]).optional(),
  category: z.string().trim().optional(),
  dob: z.string().trim().optional(),
  tob: z.string().trim().optional(),
  pob: z.string().trim().optional(),
  message: z.string().trim().optional(),
})

type BookingResult =
  | { success: false; error: string }
  | { success: true; mode: "whatsapp"; businessWhatsapp: string | null; message: string }
  | {
      success: true
      mode: "payment"
      orderId: string
      amount: number
      currency: string
      keyId: string
      leadId: string
      name: string
      email: string
      phone: string
      serviceTitle: string
    }

export async function createBooking(input: unknown): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Please check the form and try again." }
  }
  const data = parsed.data

  const [service, settings] = await Promise.all([
    prisma.service.findUnique({ where: { id: data.serviceId } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ])

  if (!service || !service.isActive) {
    return { success: false, error: "This service is no longer available." }
  }

  // Never trust a client-supplied price — always recompute the offer discount server-side.
  const effectivePrice = getOfferPrice(service) ?? service.price

  const usePayment = settings?.enablePaymentGateway ?? false

  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email || null,
      serviceId: data.serviceId,
      message: data.message || null,
      source: "booking",
      category: data.category || null,
      dob: data.dob || null,
      tob: data.tob || null,
      pob: data.pob || null,
      amount: effectivePrice,
      paymentStatus: usePayment ? "PENDING" : null,
    },
  })

  if (!usePayment) {
    const waMessage = [
      `Hi, I'd like to book *${service.title}* (₹${effectivePrice}).`,
      `Name: ${data.name}`,
      `WhatsApp: ${data.whatsapp}`,
      data.email ? `Email: ${data.email}` : null,
      data.category ? `Category: ${data.category}` : null,
      data.dob ? `DOB: ${data.dob}` : null,
      data.tob ? `TOB: ${data.tob}` : null,
      data.pob ? `POB: ${data.pob}` : null,
      data.message ? `Message: ${data.message}` : null,
    ]
      .filter(Boolean)
      .join("\n")

    return { success: true, mode: "whatsapp", businessWhatsapp: settings?.whatsapp ?? null, message: waMessage }
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return { success: false, error: "Online payment is not configured yet. Please contact us directly." }
  }

  const order = await getRazorpay().orders.create({
    amount: effectivePrice * 100,
    currency: "INR",
    receipt: lead.id,
    notes: { leadId: lead.id, serviceId: service.id },
  })

  await prisma.lead.update({
    where: { id: lead.id },
    data: { razorpayOrderId: order.id },
  })

  return {
    success: true,
    mode: "payment",
    orderId: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    leadId: lead.id,
    name: data.name,
    email: data.email || "",
    phone: data.phone,
    serviceTitle: service.title,
  }
}

export async function verifyBookingPayment(input: {
  leadId: string
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}): Promise<{ success: boolean; error?: string; bookingId?: string }> {
  const lead = await prisma.lead.findUnique({ where: { id: input.leadId } })

  if (!lead || lead.razorpayOrderId !== input.razorpay_order_id) {
    return { success: false, error: "Invalid booking reference." }
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`)
    .digest("hex")

  if (expectedSignature !== input.razorpay_signature) {
    return { success: false, error: "Payment verification failed." }
  }

  const updated = await prisma.lead.update({
    where: { id: lead.id },
    data: {
      paymentStatus: "PAID",
      razorpayPaymentId: input.razorpay_payment_id,
    },
  })

  const bookingId = getBookingRef(updated.id)

  // Best-effort — payment already succeeded and the Lead is already marked PAID, so a
  // transient SMTP failure here must not make the customer think their payment failed.
  try {
    const [service, settings] = await Promise.all([
      updated.serviceId ? prisma.service.findUnique({ where: { id: updated.serviceId } }) : null,
      prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    ])

    const businessName = settings?.businessName || "Lunawat Astro Point"

    const rows: [string, string][] = [
      ["Booking ID", bookingId],
      ["Service", service?.title || "Consultation"],
      ["Amount Paid", `₹${updated.amount ?? ""}`],
      ["Name", updated.name],
      ["Phone", updated.phone],
      ["WhatsApp", updated.whatsapp],
      ...(updated.email ? ([["Email", updated.email]] as [string, string][]) : []),
      ...(updated.category ? ([["Category", updated.category]] as [string, string][]) : []),
      ...(updated.dob ? ([["Date of Birth", updated.dob]] as [string, string][]) : []),
      ...(updated.tob ? ([["Time of Birth", updated.tob]] as [string, string][]) : []),
      ...(updated.pob ? ([["Place of Birth", updated.pob]] as [string, string][]) : []),
      ...(updated.message ? ([["Message", updated.message]] as [string, string][]) : []),
    ]

    const table = detailsTable(rows)

    if (updated.email) {
      await sendEmail({
        to: updated.email,
        subject: `Booking Confirmed — ${bookingId}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
            <h2 style="margin-bottom:4px;">Thank you, ${updated.name}!</h2>
            <p style="color:#555;">Your booking with ${businessName} is confirmed.</p>
            ${table}
            <p style="color:#555;margin-top:16px;">We'll reach out to you shortly to schedule your consultation.</p>
          </div>
        `,
      })
    }

    if (process.env.LEAD_NOTIFY_TO) {
      await sendEmail({
        to: process.env.LEAD_NOTIFY_TO,
        subject: `New Paid Booking — ${bookingId}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
            <h2 style="margin-bottom:4px;">New paid booking received</h2>
            ${table}
          </div>
        `,
      })
    }
  } catch (err) {
    console.error("Failed to send booking confirmation emails:", err)
  }

  return { success: true, bookingId }
}
