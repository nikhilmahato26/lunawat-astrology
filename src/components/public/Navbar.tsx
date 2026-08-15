'use client'

import { useState } from "react"
import Link from "next/link"
import { Phone, Mail } from "lucide-react"
import { ContactModal } from "./ContactModal"

export function Navbar({ businessName, phone }: { businessName?: string, phone?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-2xl tracking-tight text-black">
            {businessName || "Astrology"}
            <span className="text-gold-500">.</span>
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
              <Link href="#about" className="hover:text-black transition-colors">About</Link>
              <Link href="#services" className="hover:text-black transition-colors">Consultations</Link>
            </nav>
            
            <div className="flex items-center gap-3">
              {phone && (
                <a href={`tel:${phone}`} className="hidden md:flex items-center justify-center h-10 px-4 rounded-full border border-zinc-200 text-sm font-medium hover:border-black transition-colors">
                  <Phone size={16} className="mr-2" />
                  Call Now
                </a>
              )}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center h-10 px-5 rounded-full bg-black text-white text-sm font-medium hover:bg-gold-500 transition-colors shadow-lg shadow-black/10"
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
