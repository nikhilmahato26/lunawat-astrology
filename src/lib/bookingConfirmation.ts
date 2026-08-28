import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { getBookingRef } from "@/lib/bookingRef"

function detailsTable(rows: [string, string][]) {
  return `<table cellpadding="0" cellspacing="0">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#666;font-size:14px;">${k}</td><td style="padding:4px 0;font-weight:600;font-size:14px;">${v}</td></tr>`
    )
    .join("")}</table>`
}

// Shared by both confirmation paths — the client-side Razorpay checkout handler
// (actions/bookings.ts verifyBookingPayment) and the Razorpay webhook
// (api/webhooks/razorpay), since either one can be the first to see a successful
// payment. Idempotent: if the lead is already PAID, it's a no-op that just returns
// the existing booking ref, so a payment never triggers duplicate confirmation emails.
export async function confirmPaidBooking(leadId: string, paymentId: string): Promise<{ bookingId: string } | null> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) return null

  if (lead.paymentStatus === "PAID") {
    return { bookingId: getBookingRef(lead.id) }
  }

  const updated = await prisma.lead.update({
    where: { id: lead.id },
    data: {
      paymentStatus: "PAID",
      razorpayPaymentId: paymentId,
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
      ...(updated.education ? ([["Education", updated.education]] as [string, string][]) : []),
      ...(updated.address ? ([["Address", updated.address]] as [string, string][]) : []),
      ...(updated.isMatchmaking || updated.partnerName
        ? ([
            ["-- Partner Details --", ""],
            ...(updated.partnerName ? ([["Partner Name", updated.partnerName]] as [string, string][]) : []),
            ...(updated.partnerDob ? ([["Partner DOB", updated.partnerDob]] as [string, string][]) : []),
            ...(updated.partnerTob ? ([["Partner TOB", updated.partnerTob]] as [string, string][]) : []),
            ...(updated.partnerPob ? ([["Partner POB", updated.partnerPob]] as [string, string][]) : []),
            ...(updated.partnerEducation ? ([["Partner Education", updated.partnerEducation]] as [string, string][]) : []),
            ...(updated.partnerAddress ? ([["Partner Address", updated.partnerAddress]] as [string, string][]) : []),
          ] as [string, string][])
        : []),
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

  return { bookingId }
}
