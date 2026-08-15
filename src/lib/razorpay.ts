import Razorpay from "razorpay"

let instance: Razorpay | null = null

// Lazy singleton: the Razorpay SDK throws at construction time if key_id is
// missing, so this must not run at module load — only when a payment is
// actually being created (after the caller has verified keys are set).
export function getRazorpay(): Razorpay {
  if (!instance) {
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    })
  }
  return instance
}
