'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { TextField, SaveBar, ToggleSwitch, TimeField } from "@/components/admin/ui"
import { updateContactData } from "@/actions/settings"
import type { SiteSettings, BusinessHour } from "@prisma/client"

export function ContactForm({ settings, initialHours }: { settings: SiteSettings, initialHours: BusinessHour[] }) {
  const initialFormData = {
    phone: settings.phone || "",
    whatsapp: settings.whatsapp || "",
    email: settings.email || "",
    upiNumber: settings.upiNumber || "",
    address: settings.address || "",
    mapEmbedUrl: settings.mapEmbedUrl || "",
    facebookUrl: settings.facebookUrl || "",
    instagramUrl: settings.instagramUrl || "",
  }
  const [formData, setFormData] = useState(initialFormData)

  // Sort hours by day (0=Sunday, 1=Monday... or however it's stored. The seed script used 1-6 for Mon-Sat, 0 for Sun)
  const sortedHours = [...initialHours].sort((a, b) => a.day === 0 ? 1 : b.day === 0 ? -1 : a.day - b.day)

  const [hours, setHours] = useState<BusinessHour[]>(sortedHours)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Baseline updates after a successful save — comparing against the props directly would
  // leave isDirty stuck true forever post-save, since props on an already-mounted client
  // component never update themselves.
  const [saved, setSaved] = useState({ formData: initialFormData, hours: sortedHours })

  const isDirty =
    JSON.stringify(formData) !== JSON.stringify(saved.formData) ||
    JSON.stringify(hours) !== JSON.stringify(saved.hours)

  const handleSave = () => {
    startTransition(async () => {
      await updateContactData({ ...formData, hours })
      setSaved({ formData, hours })
      router.refresh()
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // Admins sometimes paste the whole <iframe src="..."> snippet instead of just the URL — extract it.
    const cleaned = name === "mapEmbedUrl" ? (value.match(/src="([^"]+)"/)?.[1] ?? value) : value
    setFormData(prev => ({ ...prev, [name]: cleaned }))
  }

  const updateHour = (index: number, updated: BusinessHour) => {
    const newHours = [...hours]
    newHours[index] = updated
    setHours(newHours)
  }

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return (
    <div className="max-w-3xl space-y-12 pb-24">
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Contact Information</h2>
          <p className="text-zinc-500 text-sm mb-4">How clients can reach you and find you.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField 
            label="Phone Number" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            hint="Format: +91XXXXXXXXXX"
          />
          <TextField 
            label="WhatsApp Number" 
            name="whatsapp" 
            value={formData.whatsapp} 
            onChange={handleChange} 
            hint="For WhatsApp integration"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField 
            label="Email Address" 
            name="email" 
            type="email"
            value={formData.email} 
            onChange={handleChange} 
          />
          <TextField 
            label="UPI Number (Hidden for now)" 
            name="upiNumber" 
            value={formData.upiNumber} 
            onChange={handleChange} 
          />
        </div>

        <TextField
          label="Address (City / Area)"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />

        <TextField
          label="Google Maps Embed URL"
          name="mapEmbedUrl"
          value={formData.mapEmbedUrl}
          onChange={handleChange}
          hint='On Google Maps: Share → Embed a map → copy only the URL inside src="..." and paste it here'
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField
            label="Facebook URL (Optional)"
            name="facebookUrl"
            value={formData.facebookUrl}
            onChange={handleChange}
            placeholder="https://facebook.com/yourpage"
          />
          <TextField
            label="Instagram URL (Optional)"
            name="instagramUrl"
            value={formData.instagramUrl}
            onChange={handleChange}
            placeholder="https://instagram.com/yourhandle"
          />
        </div>
      </section>

      <section className="space-y-6 border-t border-zinc-200 pt-8">
        <div>
          <h2 className="text-xl font-bold mb-1">Business Hours</h2>
          <p className="text-zinc-500 text-sm mb-4">Your general availability during the week.</p>
        </div>

        <div className="space-y-4">
          {hours.map((hour, index) => (
            <div key={hour.day} className="flex items-center gap-4 bg-white p-4 border border-zinc-200 rounded-xl">
              <div className="w-24 font-medium">{dayNames[hour.day]}</div>
              <div className="w-24">
                <ToggleSwitch 
                  label="Closed" 
                  checked={hour.isClosed} 
                  onChange={(checked) => updateHour(index, { ...hour, isClosed: checked })} 
                />
              </div>
              {!hour.isClosed && (
                <div className="flex-1 flex items-center gap-4">
                  <TimeField 
                    label="" 
                    value={hour.openTime} 
                    onChange={(e) => updateHour(index, { ...hour, openTime: e.target.value })} 
                  />
                  <span className="text-zinc-500">to</span>
                  <TimeField 
                    label="" 
                    value={hour.closeTime} 
                    onChange={(e) => updateHour(index, { ...hour, closeTime: e.target.value })} 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <SaveBar isDirty={isDirty} isPending={isPending} onSave={handleSave} />
    </div>
  )
}
