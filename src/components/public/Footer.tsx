import { MapPin, Phone, Mail, MessageSquare } from "lucide-react"

export function Footer({ 
  businessName, 
  address, 
  phone, 
  email, 
  whatsapp,
  hours
}: { 
  businessName?: string
  address?: string
  phone?: string
  email?: string
  whatsapp?: string
  hours: any[]
}) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return (
    <footer className="bg-black text-white pt-20 pb-10" id="contact">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          <div className="space-y-6">
            <h3 className="font-display font-bold text-2xl tracking-tight">
              {businessName || "Astrology"}<span className="text-gold-500">.</span>
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              Providing expert guidance and clarity to help you navigate life's journey with confidence.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold uppercase tracking-wider text-sm text-gold-500">Contact Us</h4>
            <div className="space-y-4">
              {address && (
                <div className="flex items-start gap-3 text-zinc-300 text-sm">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-gold-400" />
                  <span>{address}</span>
                </div>
              )}
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-3 text-zinc-300 text-sm hover:text-white transition-colors">
                  <Phone size={18} className="shrink-0 text-gold-400" />
                  <span>{phone}</span>
                </a>
              )}
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-zinc-300 text-sm hover:text-white transition-colors">
                  <MessageSquare size={18} className="shrink-0 text-gold-400" />
                  <span>{whatsapp}</span>
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-3 text-zinc-300 text-sm hover:text-white transition-colors">
                  <Mail size={18} className="shrink-0 text-gold-400" />
                  <span>{email}</span>
                </a>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold uppercase tracking-wider text-sm text-gold-500">Business Hours</h4>
            <ul className="space-y-2 text-sm text-zinc-300">
              {hours.map((h) => (
                <li key={h.day} className="flex justify-between items-center border-b border-zinc-800 pb-2 last:border-0">
                  <span className="text-zinc-400">{days[h.day]}</span>
                  <span>{h.isClosed ? "Closed" : `${h.openTime} - ${h.closeTime}`}</span>
                </li>
              ))}
            </ul>
            
            <div className="pt-4">
              <h4 className="font-bold uppercase tracking-wider text-sm text-gold-500 mb-4">Location</h4>
              <div className="w-full h-32 bg-zinc-900 rounded-lg overflow-hidden relative border border-zinc-800">
                {/* Embedded Map Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs text-center p-4">
                  Google Maps Embed<br/>(Set city in admin panel)
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
          <a href="/admin" className="hover:text-zinc-300 transition-colors mt-4 md:mt-0">Admin Login</a>
        </div>
      </div>
    </footer>
  )
}
