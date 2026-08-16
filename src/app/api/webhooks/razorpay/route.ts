import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { confirmPaidBooking } from "@/lib/bookingConfirmation"

// Server-to-server fallback for the client-side confirmation in actions/bookings.ts
// verifyBookingPayment — catches payments that succeeded but never got confirmed
// because the customer closed the tab / lost connection before the browser-side
// handler fired. Configure this URL in Razorpay Dashboard → Settings → Webhooks as
// https://<your-domain>/api/webhooks/razorpay, with events "payment.captured" and
// "order.paid", and put the webhook secret it gives you in RAZORPAY_WEBHOOK_SECRET.
export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    console.error("Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not configured")
    return new Response("Webhook not configured", { status: 500 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get("x-razorpay-signature") || ""

  const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex")

  const signatureValid =
    signature.length === expectedSignature.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))

  if (!signatureValid) {
    return new Response("Invalid signature", { status: 400 })
  }

  let event: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return new Response("Invalid payload", { status: 400 })
  }

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload?.payment?.entity
    const orderId = payment?.order_id
    const paymentId = payment?.id

    if (orderId && paymentId) {
      const lead = await prisma.lead.findFirst({ where: { razorpayOrderId: orderId } })
      if (lead) {
        await confirmPaidBooking(lead.id, paymentId)
      }
    }
  }

  // Razorpay retries on anything but a 2xx — always acknowledge once the signature
  // checks out, even for event types/payloads we don't act on.
  return new Response("OK", { status: 200 })
}
