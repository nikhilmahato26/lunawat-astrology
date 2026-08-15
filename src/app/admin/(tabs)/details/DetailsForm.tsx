'use client'

import { useState, useTransition } from "react"
import { TextField, TextArea, SaveBar, SuggestionChips } from "@/components/admin/ui"
import { ImageUploader } from "@/components/admin/ImageUploader"
import { updateSiteSettings } from "@/actions/settings"
import type { SiteSettings } from "@prisma/client"

export function DetailsForm({ settings }: { settings: SiteSettings }) {
  const [formData, setFormData] = useState({
    businessName: settings.businessName,
    personName: settings.personName,
    credentials: settings.credentials || "",
    tagline: settings.tagline || "",
    experience: settings.experience || 0,
    languages: settings.languages.join(", "),
    heroHeadline: settings.heroHeadline || "",
    heroSubtext: settings.heroSubtext || "",
    heroImageUrl: settings.heroImageUrl || "",
  })

  const [isPending, startTransition] = useTransition()
  
  // Basic dirty check
  const isDirty = 
    formData.businessName !== settings.businessName ||
    formData.personName !== settings.personName ||
    formData.credentials !== (settings.credentials || "") ||
    formData.tagline !== (settings.tagline || "") ||
    formData.experience !== (settings.experience || 0) ||
    formData.languages !== settings.languages.join(", ") ||
    formData.heroHeadline !== (settings.heroHeadline || "") ||
    formData.heroSubtext !== (settings.heroSubtext || "") ||
    formData.heroImageUrl !== (settings.heroImageUrl || "")

  const handleSave = () => {
    startTransition(async () => {
      await updateSiteSettings({
        businessName: formData.businessName,
        personName: formData.personName,
        credentials: formData.credentials,
        tagline: formData.tagline,
        experience: formData.experience,
        languages: formData.languages.split(",").map((s: string) => s.trim()).filter(Boolean),
        heroHeadline: formData.heroHeadline,
        heroSubtext: formData.heroSubtext,
        heroImageUrl: formData.heroImageUrl,
      })
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === "experience" ? Number(value) : value }))
  }

  return (
    <div className="max-w-3xl space-y-12 pb-24">
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Basic Information</h2>
          <p className="text-zinc-500 text-sm mb-4">Core details about the business and practitioner.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField 
            label="Business Name" 
            name="businessName" 
            value={formData.businessName} 
            onChange={handleChange} 
          />
          <TextField 
            label="Practitioner Name" 
            name="personName" 
            value={formData.personName} 
            onChange={handleChange} 
          />
        </div>
        
        <TextField 
          label="Credentials (Degrees, Certifications)" 
          name="credentials" 
          value={formData.credentials} 
          onChange={handleChange} 
          hint="e.g. B.A.M.S., PGDip. in Ayu. Drug Standardisation (BHU), MBA"
        />
        
        <TextField 
          label="Tagline / Specializations" 
          name="tagline" 
          value={formData.tagline} 
          onChange={handleChange} 
          hint="e.g. Specialisation: Vastu & Jyotish, K.P. system"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField 
            label="Years of Experience" 
            name="experience"
            type="number" 
            value={formData.experience} 
            onChange={handleChange} 
          />
          <div>
            <TextField 
              label="Languages Spoken" 
              name="languages" 
              value={formData.languages} 
              onChange={handleChange} 
              hint="Comma separated (e.g. English, Hindi, Marathi)"
            />
            <SuggestionChips 
              suggestions={["English", "Hindi", "Marathi", "Gujarati"]}
              onSelect={(lang) => {
                const current = formData.languages.split(",").map((s: string) => s.trim()).filter(Boolean)
                if (!current.includes(lang)) {
                  setFormData(prev => ({ ...prev, languages: [...current, lang].join(", ") }))
                }
              }}
            />
          </div>
        </div>
      </section>

      <section className="space-y-6 border-t border-zinc-200 pt-8">
        <div>
          <h2 className="text-xl font-bold mb-1">Hero Section</h2>
          <p className="text-zinc-500 text-sm mb-4">The main introduction seen at the top of the website.</p>
        </div>

        <ImageUploader 
          label="Hero Image"
          value={formData.heroImageUrl}
          publicId=""
          folder="lunawat/hero"
          onChange={(url, publicId) => setFormData(prev => ({ ...prev, heroImageUrl: url }))}
          onRemove={() => setFormData(prev => ({ ...prev, heroImageUrl: "" }))}
        />

        <TextField 
          label="Hero Headline" 
          name="heroHeadline" 
          value={formData.heroHeadline} 
          onChange={handleChange} 
          hint="e.g. Unlock Your Cosmic Potential"
        />
        
        <TextArea 
          label="Hero Subtext" 
          name="heroSubtext" 
          value={formData.heroSubtext} 
          onChange={handleChange} 
        />
      </section>

      <SaveBar isDirty={isDirty} isPending={isPending} onSave={handleSave} />
    </div>
  )
}
