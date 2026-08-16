'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { RepeatableList } from "@/components/admin/RepeatableList"
import { TextField, SaveBar, ToggleSwitch } from "@/components/admin/ui"
import { ImageUploader } from "@/components/admin/ImageUploader"
import { updateCertifications, updateSiteSettings } from "@/actions/settings"

type Certification = {
  id?: string
  title: string
  issuer?: string
  year?: string
  imageUrl?: string
}

export function CertificationsForm({
  initialCertifications,
  initialShowSection,
}: {
  initialCertifications: any[]
  initialShowSection: boolean
}) {
  const initialItems: Certification[] = initialCertifications.map(c => ({
    id: c.id,
    title: c.title,
    issuer: c.issuer || "",
    year: c.year || "",
    imageUrl: c.imageUrl || "",
  }))
  const [certs, setCerts] = useState<Certification[]>(initialItems)
  const [showSection, setShowSection] = useState(initialShowSection)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Baseline updates after a successful save — comparing against the props directly would
  // leave isDirty stuck true forever post-save, since props on an already-mounted client
  // component never update themselves.
  const [saved, setSaved] = useState({ certs: initialItems, showSection: initialShowSection })

  const isDirty =
    JSON.stringify(certs) !== JSON.stringify(saved.certs) ||
    showSection !== saved.showSection

  const handleSave = () => {
    startTransition(async () => {
      await Promise.all([
        updateCertifications(certs),
        updateSiteSettings({ showCertifications: showSection }),
      ])
      setSaved({ certs, showSection })
      router.refresh()
    })
  }

  return (
    <div className="max-w-3xl pb-24 space-y-6">
      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-2">
        <ToggleSwitch
          label="Show Certifications Section"
          hint="Turn off to hide this section from the homepage entirely."
          checked={showSection}
          onChange={setShowSection}
        />
      </div>

      <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-2xl">
        <h3 className="font-bold text-lg mb-4">Manage Certifications</h3>
        <RepeatableList
          items={certs}
          onChange={setCerts}
          addButtonText="Add Certification"
          newItemFactory={() => ({ title: "", issuer: "", year: "", imageUrl: "" })}
          renderItem={(cert, index, update) => (
            <div className="flex flex-col md:flex-row gap-6 pt-1">
              <div className="w-32 shrink-0">
                <ImageUploader 
                  value={cert.imageUrl}
                  folder="lunawat/certifications"
                  aspectRatio="square"
                  onChange={(url) => update(index, { ...cert, imageUrl: url })}
                  onRemove={() => update(index, { ...cert, imageUrl: "" })}
                />
              </div>
              <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Title / Name"
                  value={cert.title}
                  onChange={(e) => update(index, { ...cert, title: e.target.value })}
                  placeholder="e.g. Jyotish Acharya"
                />
                <TextField
                  label="Issuer (Optional)"
                  value={cert.issuer}
                  onChange={(e) => update(index, { ...cert, issuer: e.target.value })}
                  placeholder="e.g. AIFAS"
                />
                <TextField
                  label="Year (Optional)"
                  value={cert.year}
                  onChange={(e) => update(index, { ...cert, year: e.target.value })}
                  placeholder="e.g. 2010"
                />
              </div>
            </div>
          )}
        />
      </div>

      <SaveBar isDirty={isDirty} isPending={isPending} onSave={handleSave} />
    </div>
  )
}
