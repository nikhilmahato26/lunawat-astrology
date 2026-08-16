'use server'

import { sendEmail } from "@/lib/email"

export async function submitContactForm(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const message = formData.get("message") as string

    if (!name || !email || !message) {
      return { error: "Please fill in all required fields." }
    }

    await sendEmail({
      to: process.env.LEAD_NOTIFY_TO || "drrahuljainastrology@gmail.com",
      subject: `New Contact Request from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="margin-bottom:4px;">New contact form submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
          <p><strong>Message:</strong><br/>${message}</p>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send email:", error)
    return { error: "Failed to send your message. Please try again later." }
  }
}
