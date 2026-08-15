'use client'

import { useState, useTransition } from "react"
import { X } from "lucide-react"
import { submitContactForm } from "@/actions/contact"

export function ContactModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await submitContactForm(formData)
      if (result.error) {
        setStatus("error")
        setErrorMessage(result.error)
      } else {
        setStatus("success")
        setTimeout(() => {
          onClose()
          setStatus("idle")
        }, 3000)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif font-bold text-2xl text-brand-brown">Get in Touch</h3>
            <button
              onClick={onClose}
              className="p-2 bg-brand-orange/10 hover:bg-brand-orange/20 rounded-full transition-colors"
            >
              <X size={20} className="text-brand-brown/60" />
            </button>
          </div>

          {status === "success" ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="font-serif text-xl font-bold text-brand-brown">Message Sent!</h4>
              <p className="text-brand-brown/60">We'll get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {status === "error" && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-brand-brown/80 mb-1">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 bg-brand-peach/60 border border-brand-orange/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-brown/80 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 bg-brand-peach/60 border border-brand-orange/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-brown/80 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full px-4 py-3 bg-brand-peach/60 border border-brand-orange/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-brown/80 mb-1">How can we help you? *</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-brand-peach/60 border border-brand-orange/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-14 bg-brand-orange text-white font-medium rounded-xl hover:bg-gold-600 transition-colors disabled:opacity-50 mt-4"
              >
                {isPending ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
