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
    <footer className="bg-brand-brown text-brand-peach pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">

          <div className="space-y-6">
            <h3 className="font-serif font-bold text-2xl tracking-tight text-white">
              {businessName || "Astrology"}<span className="text-brand-orange">.</span>
            </h3>
            <p className="text-brand-peach/50 text-sm leading-relaxed max-w-xs">
              Providing expert guidance and clarity to help you navigate life's journey with confidence.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold uppercase tracking-wider text-sm text-brand-orange">Contact Us</h4>
            <div className="space-y-4">
              {address && (
                <div className="flex items-start gap-3 text-brand-peach/70 text-sm">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-brand-orange/70" />
                  <span>{address}</span>
                </div>
              )}
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-3 text-brand-peach/70 text-sm hover:text-white transition-colors">
                  <Phone size={18} className="shrink-0 text-brand-orange/70" />
                  <span>{phone}</span>
                </a>
              )}
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-brand-peach/70 text-sm hover:text-white transition-colors">
                  <MessageSquare size={18} className="shrink-0 text-brand-orange/70" />
                  <span>{whatsapp}</span>
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-3 text-brand-peach/70 text-sm hover:text-white transition-colors">
                  <Mail size={18} className="shrink-0 text-brand-orange/70" />
                  <span>{email}</span>
                </a>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold uppercase tracking-wider text-sm text-brand-orange">Business Hours</h4>
            <ul className="space-y-2 text-sm text-brand-peach/70">
              {hours.map((h) => (
                <li key={h.day} className="flex justify-between items-center border-b border-white/10 pb-2 last:border-0">
                  <span className="text-brand-peach/50">{days[h.day]}</span>
                  <span>{h.isClosed ? "Closed" : `${h.openTime} - ${h.closeTime}`}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <h4 className="font-bold uppercase tracking-wider text-sm text-brand-orange mb-4">Location</h4>
              <div className="w-full h-32 bg-white/5 rounded-lg overflow-hidden relative border border-white/10">
                {/* Embedded Map Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center text-brand-peach/40 text-xs text-center p-4">
                  Google Maps Embed<br/>(Set city in admin panel)
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 text-center text-xs text-brand-peach/40">
          <p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
