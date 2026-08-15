'use client'

import { useState, useTransition } from "react"
import { TextField, TextArea, SaveBar } from "@/components/admin/ui"
import { RepeatableList } from "@/components/admin/RepeatableList"
import { ImageUploader } from "@/components/admin/ImageUploader"
import { updateAboutData } from "@/actions/settings"
import type { Stat, SiteSettings } from "@prisma/client"

export function AboutForm({ settings, initialStats }: { settings: SiteSettings, initialStats: Stat[] }) {
  const [formData, setFormData] = useState({
    title: settings.aboutTitle || "",
    body: settings.aboutBody || "",
    aboutImageUrl: settings.aboutImageUrl || ""
  })
  const [stats, setStats] = useState<Stat[]>(initialStats)
  const [isPending, startTransition] = useTransition()
  
  const isDirty = 
    formData.title !== (settings.aboutTitle || "") ||
    formData.body !== (settings.aboutBody || "") ||
    formData.aboutImageUrl !== (settings.aboutImageUrl || "") ||
    JSON.stringify(stats) !== JSON.stringify(initialStats)

  const handleSave = () => {
    startTransition(async () => {
      await updateAboutData({ ...formData, stats })
    })
  }

  const renderStat = (stat: Stat, index: number, updateItem: (idx: number, s: Stat) => void) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        <TextField 
          label="Value (e.g. '1,000+')" 
          value={stat.value} 
          onChange={(e) => updateItem(index, { ...stat, value: e.target.value })} 
        />
        <TextField 
          label="Label (e.g. 'Happy Clients')" 
          value={stat.label} 
          onChange={(e) => updateItem(index, { ...stat, label: e.target.value })} 
        />
        <TextField 
          label="Icon (optional name)" 
          value={stat.icon || ""} 
          onChange={(e) => updateItem(index, { ...stat, icon: e.target.value })} 
          hint="e.g. 'smile', 'star', 'users'"
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-12 pb-24">
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1">About Section</h2>
          <p className="text-zinc-500 text-sm mb-4">The main biography or text introducing the practice.</p>
        </div>
        
        <ImageUploader 
          label="About Us Image"
          value={formData.aboutImageUrl}
          publicId=""
          folder="lunawat/about"
          onChange={(url, publicId) => setFormData(prev => ({ ...prev, aboutImageUrl: url }))}
          onRemove={() => setFormData(prev => ({ ...prev, aboutImageUrl: "" }))}
        />

        <TextField 
          label="Section Title" 
          value={formData.title} 
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} 
        />
        <TextArea 
          label="Biography / About Text" 
          value={formData.body} 
          onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))} 
        />
      </section>

      <section className="space-y-6 border-t border-zinc-200 pt-8">
        <div>
          <h2 className="text-xl font-bold mb-1">Key Statistics</h2>
          <p className="text-zinc-500 text-sm mb-4">Highlights to build trust (e.g., years of experience, consultations done).</p>
        </div>

        <RepeatableList
          items={stats}
          onChange={setStats}
          renderItem={renderStat}
          addButtonText="Add New Statistic"
          newItemFactory={() => ({
            id: crypto.randomUUID(), // temp
            label: "New Stat",
            value: "100+",
            icon: "",
            order: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          })}
        />
      </section>

      <SaveBar isDirty={isDirty} isPending={isPending} onSave={handleSave} />
    </div>
  )
}
