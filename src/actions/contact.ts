'use server'

import nodemailer from "nodemailer"

export async function submitContactForm(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const message = formData.get("message") as string

    if (!name || !email || !message) {
      return { error: "Please fill in all required fields." }
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "drrahuljain143@gmail.com",
      subject: `New Contact Request from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone || 'Not provided'}
        
        Message:
        ${message}
      `,
    }

    await transporter.sendMail(mailOptions)

    return { success: true }
  } catch (error) {
    console.error("Failed to send email:", error)
    return { error: "Failed to send your message. Please try again later." }
  }
}
