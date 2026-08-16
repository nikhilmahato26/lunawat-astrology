'use client'

import { useState } from "react"
import Link from "next/link"
import { Phone, Mail } from "lucide-react"
import { ContactModal } from "./ContactModal"

export function Navbar({ businessName, phone }: { businessName?: string, phone?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-brand-peach/85 backdrop-blur-md border-b border-brand-orange/10">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="font-serif font-bold text-2xl tracking-tight text-brand-brown">
            {businessName || "Astrology"}
            <span className="text-brand-orange">.</span>
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-brown/70">
              <Link href="#about" className="hover:text-brand-orange transition-colors">About</Link>
              <Link href="#services" className="hover:text-brand-orange transition-colors">Consultations</Link>
              <Link href="#contact" className="hover:text-brand-orange transition-colors">Contact</Link>
            </nav>

            <div className="flex items-center gap-3">
              {phone && (
                <a href={`tel:${phone}`} className="hidden md:flex items-center justify-center h-10 px-4 rounded-full border border-brand-orange/20 text-sm font-medium hover:border-brand-orange transition-colors">
                  <Phone size={16} className="mr-2" />
                  Call Now
                </a>
              )}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center h-10 px-5 rounded-full bg-brand-brown text-brand-peach text-sm font-medium hover:bg-brand-orange hover:text-white transition-colors shadow-lg shadow-brand-brown/10"
              >
                <Mail size={16} className="mr-2 hidden sm:block" />
                Email Us
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
