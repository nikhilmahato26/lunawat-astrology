'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAction } from "@/actions/auth"

const tabs = [
  { name: "Your Details", href: "/admin/details" },
  { name: "Consultations", href: "/admin/consultations" },
  { name: "About, Trust & FAQ", href: "/admin/about" },
  { name: "Certifications", href: "/admin/certifications" },
  { name: "Media & Gallery", href: "/admin/media" },
  { name: "Contact & Hours", href: "/admin/contact" },
]

export function AdminNav() {
  const pathname = usePathname()

  if (pathname === '/admin/login') return null

  return (
    <div className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <h1 className="font-bold text-lg">Personal Website Builder</h1>
          <form action={logoutAction}>
            <button 
              type="submit"
              className="text-sm font-medium text-zinc-500 hover:text-black"
            >
              Logout
            </button>
          </form>
        </div>
        
        <nav className="flex overflow-x-auto no-scrollbar border-t border-zinc-100">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`whitespace-nowrap px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-black text-black'
                    : 'border-transparent text-zinc-500 hover:text-black hover:border-zinc-300'
                }`}
              >
                {tab.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
